"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DeckList } from "@/components/deck/deck-list";
import { DeckForm } from "@/components/deck/deck-form";
import { listDecks, createDeck, updateDeck, deleteDeck } from "@/app/actions/deck";
import { useErrorHandler } from "@/lib/utils/errors";
import type { DeckWithStats, CreateDeckInput, UpdateDeckInput } from "@/types";

export default function HomePage() {
  const [decks, setDecks] = useState<DeckWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDeck, setEditingDeck] = useState<DeckWithStats | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { handleError } = useErrorHandler();
  const router = useRouter();

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      setIsLoading(true);
      const result = await listDecks();
      if (result.success && result.data) {
        setDecks(result.data);
      } else {
        handleError(new Error(result.error || "Failed to load decks"));
      }
    } catch (error) {
      handleError(error, "loading decks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeck = async (data: CreateDeckInput) => {
    try {
      setFormLoading(true);
      const result = await createDeck(data);
      if (result.success && result.data) {
        setDecks([result.data, ...decks]);
        setShowCreateForm(false);
      } else {
        handleError(new Error(result.error || "Failed to create deck"));
      }
    } catch (error) {
      handleError(error, "creating deck");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateDeck = async (data: UpdateDeckInput) => {
    try {
      setFormLoading(true);
      const result = await updateDeck(data);
      if (result.success && result.data) {
        setDecks(decks.map(deck => 
          deck.id === result.data!.id ? result.data! : deck
        ));
        setEditingDeck(null);
      } else {
        handleError(new Error(result.error || "Failed to update deck"));
      }
    } catch (error) {
      handleError(error, "updating deck");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDeck = async (deck: DeckWithStats) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${deck.name}"? This will also delete all ${deck.statistics.totalCards} cards in this deck. This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const result = await deleteDeck({ id: deck.id, confirmDelete: true });
      if (result.success) {
        setDecks(decks.filter(d => d.id !== deck.id));
      } else {
        handleError(new Error(result.error || "Failed to delete deck"));
      }
    } catch (error) {
      handleError(error, "deleting deck");
    }
  };

  const handleStudyDeck = (deck: DeckWithStats) => {
    if (deck.statistics.totalCards === 0) {
      alert("This deck has no cards to study. Add some cards first!");
      return;
    }
    // Navigate to study page (will be implemented later)
    router.push(`/decks/${deck.id}/study` as any);
  };

  const handleEditDeck = (deck: DeckWithStats) => {
    setEditingDeck(deck);
    setShowCreateForm(false);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingDeck(null);
  };

  if (showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <DeckForm
          onSubmit={handleCreateDeck}
          onCancel={handleCancelForm}
          isLoading={formLoading}
        />
      </div>
    );
  }

  if (editingDeck) {
    return (
      <div className="max-w-4xl mx-auto">
        <DeckForm
          deck={editingDeck}
          onSubmit={handleUpdateDeck}
          onCancel={handleCancelForm}
          isLoading={formLoading}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <DeckList
        decks={decks}
        onCreateNew={() => setShowCreateForm(true)}
        onEditDeck={handleEditDeck}
        onDeleteDeck={handleDeleteDeck}
        onStudyDeck={handleStudyDeck}
        isLoading={isLoading}
      />
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DeckList } from "@/components/deck/deck-list";
import { listDecks, deleteDeck } from "@/app/actions/deck";
import { useErrorHandler } from "@/lib/utils/errors";
import type { DeckWithStats } from "@/types";

export default function HomePage() {
  const [decks, setDecks] = useState<DeckWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleCreateNew = () => {
    router.push("/decks/new" as any);
  };

  const handleEditDeck = (deck: DeckWithStats) => {
    router.push(`/decks/${deck.id}` as any);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <DeckList
        decks={decks}
        onCreateNew={handleCreateNew}
        onEditDeck={handleEditDeck}
        onDeleteDeck={handleDeleteDeck}
        onStudyDeck={handleStudyDeck}
        isLoading={isLoading}
      />
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getDeck, updateDeck, deleteDeck } from "@/app/actions/deck";
import { listCardsByDeck, createCard, updateCard, deleteCard } from "@/app/actions/card";
import { DeckForm } from "@/components/deck/deck-form";
import { CardList } from "@/components/card/card-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2, Play } from "lucide-react";
import { useErrorHandler } from "@/lib/utils/errors";
import type { 
  DeckWithStats, 
  UpdateDeckInput, 
  Card as CardType, 
  CreateCardInput, 
  UpdateCardInput 
} from "@/types";

export default function DeckDetailPage() {
  const [deck, setDeck] = useState<DeckWithStats | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);
  const { handleError } = useErrorHandler();
  const router = useRouter();
  const params = useParams();

  const deckId = parseInt(params.id as string, 10);

  useEffect(() => {
    if (isNaN(deckId)) {
      router.push("/");
      return;
    }
    loadDeckAndCards();
  }, [deckId]);

  const loadDeckAndCards = async () => {
    try {
      setIsLoading(true);
      
      // Load deck and cards in parallel
      const [deckResult, cardsResult] = await Promise.all([
        getDeck({ id: deckId }),
        listCardsByDeck(deckId)
      ]);

      if (deckResult.success && deckResult.data) {
        setDeck(deckResult.data);
      } else {
        handleError(new Error(deckResult.error || "Failed to load deck"));
        router.push("/");
        return;
      }

      if (cardsResult.success && cardsResult.data) {
        setCards(cardsResult.data);
      } else {
        handleError(new Error(cardsResult.error || "Failed to load cards"));
      }
    } catch (error) {
      handleError(error, "loading deck and cards");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDeck = async (data: UpdateDeckInput) => {
    try {
      setIsUpdating(true);
      const result = await updateDeck(data);
      if (result.success && result.data) {
        setDeck({ ...deck!, ...result.data });
        setIsEditing(false);
      } else {
        handleError(new Error(result.error || "Failed to update deck"));
      }
    } catch (error) {
      handleError(error, "updating deck");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDeck = async () => {
    if (!deck) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${deck.name}"? This will also delete all ${cards.length} cards in this deck. This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const result = await deleteDeck({ id: deck.id, confirmDelete: true });
      if (result.success) {
        router.push("/");
      } else {
        handleError(new Error(result.error || "Failed to delete deck"));
      }
    } catch (error) {
      handleError(error, "deleting deck");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStudyDeck = () => {
    if (!deck) return;
    
    if (cards.length === 0) {
      alert("This deck has no cards to study. Add some cards first!");
      return;
    }
    
    router.push(`/decks/${deck.id}/study` as any);
  };

  const handleCreateCard = async (data: CreateCardInput) => {
    try {
      setCardsLoading(true);
      const result = await createCard(data);
      if (result.success && result.data) {
        setCards([result.data, ...cards]);
        // Update deck statistics
        if (deck) {
          setDeck({
            ...deck,
            statistics: {
              ...deck.statistics,
              totalCards: deck.statistics.totalCards + 1
            }
          });
        }
      } else {
        handleError(new Error(result.error || "Failed to create card"));
      }
    } catch (error) {
      handleError(error, "creating card");
    } finally {
      setCardsLoading(false);
    }
  };

  const handleEditCard = async (data: UpdateCardInput) => {
    try {
      setCardsLoading(true);
      const result = await updateCard(data);
      if (result.success && result.data) {
        setCards(cards.map(card => 
          card.id === result.data!.id ? result.data! : card
        ));
      } else {
        handleError(new Error(result.error || "Failed to update card"));
      }
    } catch (error) {
      handleError(error, "updating card");
    } finally {
      setCardsLoading(false);
    }
  };

  const handleDeleteCard = async (card: CardType) => {
    try {
      setCardsLoading(true);
      const result = await deleteCard({ id: card.id, confirmDelete: true });
      if (result.success) {
        setCards(cards.filter(c => c.id !== card.id));
        // Update deck statistics
        if (deck) {
          setDeck({
            ...deck,
            statistics: {
              ...deck.statistics,
              totalCards: deck.statistics.totalCards - 1
            }
          });
        }
      } else {
        handleError(new Error(result.error || "Failed to delete card"));
      }
    } catch (error) {
      handleError(error, "deleting card");
    } finally {
      setCardsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Deck Not Found</h1>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Decks
        </Button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setIsEditing(false)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deck
          </Button>
          <h1 className="text-2xl font-bold">Edit Deck</h1>
        </div>

        <DeckForm
          deck={deck}
          onSubmit={handleUpdateDeck}
          onCancel={() => setIsEditing(false)}
          isLoading={isUpdating}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Decks
          </Button>
          <h1 className="text-3xl font-bold">{deck.name}</h1>
          {deck.description && (
            <p className="text-muted-foreground mt-2">{deck.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleStudyDeck}
            disabled={cards.length === 0}
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Study
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteDeck}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cards.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Due for Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {cards.filter(card => 
                card.nextReviewDate && new Date(card.nextReviewDate) <= new Date()
              ).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {cards.reduce((sum, card) => sum + card.repetitionCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards Section */}
      <CardList
        cards={cards}
        deckId={deckId}
        deckName={deck.name}
        onCreateCard={handleCreateCard}
        onEditCard={handleEditCard}
        onDeleteCard={handleDeleteCard}
        isLoading={cardsLoading}
      />
    </div>
  );
}
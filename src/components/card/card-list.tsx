"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardItem } from "./card-item";
import { CardForm } from "./card-form";
import type { Card as CardType, CreateCardInput, UpdateCardInput } from "@/types";

interface CardListProps {
  cards: CardType[];
  deckId: number;
  deckName: string;
  onCreateCard: (data: CreateCardInput) => Promise<void>;
  onEditCard: (data: UpdateCardInput) => Promise<void>;
  onDeleteCard: (card: CardType) => Promise<void>;
  isLoading?: boolean;
}

export function CardList({
  cards,
  deckId,
  deckName,
  onCreateCard,
  onEditCard,
  onDeleteCard,
  isLoading = false
}: CardListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateCard = async (data: CreateCardInput | UpdateCardInput) => {
    try {
      await onCreateCard(data as CreateCardInput);
      setShowCreateForm(false);
    } catch (error) {
      // Error handling is done by the parent component
      console.error("Create card error:", error);
    }
  };

  const sortedCards = [...cards].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Add Card to "{deckName}"
          </h2>
        </div>
        <CardForm
          deckId={deckId}
          onSubmit={handleCreateCard}
          onCancel={() => setShowCreateForm(false)}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Cards in "{deckName}"
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {cards.length} card{cards.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          disabled={isLoading}
          className="shrink-0"
        >
          Add Card
        </Button>
      </div>

      {/* Empty State */}
      {cards.length === 0 && (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No cards yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This deck doesn't have any cards. Add your first card to get started!
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                disabled={isLoading}
              >
                Add Your First Card
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Cards Grid */}
      {cards.length > 0 && (
        <div className="space-y-4">
          {sortedCards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {cards.length > 0 && (
        <Card className="p-4">
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {cards.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Cards
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {cards.filter(card => 
                    card.nextReviewDate && new Date(card.nextReviewDate) <= new Date()
                  ).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Due for Review
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {cards.reduce((sum, card) => sum + card.repetitionCount, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Reviews
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
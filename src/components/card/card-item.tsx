"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardForm } from "./card-form";
import type { Card as CardType, CreateCardInput, UpdateCardInput } from "@/types";

interface CardItemProps {
  card: CardType;
  onEdit: (data: UpdateCardInput) => Promise<void>;
  onDelete: (card: CardType) => Promise<void>;
  isLoading?: boolean;
}

export function CardItem({ card, onEdit, onDelete, isLoading = false }: CardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleEdit = async (data: CreateCardInput | UpdateCardInput) => {
    try {
      await onEdit(data as UpdateCardInput);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done by the parent component
      console.error("Edit error:", error);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this card? This action cannot be undone."
    );
    
    if (confirmed) {
      try {
        await onDelete(card);
      } catch (error) {
        // Error handling is done by the parent component
        console.error("Delete error:", error);
      }
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isEditing) {
    return (
      <CardForm
        card={card}
        onSubmit={handleEdit}
        onCancel={() => setIsEditing(false)}
        isLoading={isLoading}
      />
    );
  }

  return (
    <Card className="w-full p-4 transition-all duration-200 hover:shadow-md">
      <div className="space-y-4">
        {/* Card Actions */}
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFlipped(!isFlipped)}
              disabled={isLoading}
            >
              {isFlipped ? "Show Front" : "Show Back"}
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete
          </Button>
        </div>

        {/* Card Content */}
        <div className="space-y-3">
          {!isFlipped ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  FRONT
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  (Question/Prompt)
                </span>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {card.front}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  BACK
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  (Answer/Response)
                </span>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {card.back}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Card Metadata */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="space-y-1">
              <p>Created: {formatDate(card.createdAt)}</p>
              {card.updatedAt !== card.createdAt && (
                <p>Updated: {formatDate(card.updatedAt)}</p>
              )}
            </div>
            <div className="text-right space-y-1">
              <p>Reviews: {card.repetitionCount}</p>
              <p>Interval: {card.intervalDays} day{card.intervalDays !== 1 ? 's' : ''}</p>
              {card.nextReviewDate && (
                <p>Next: {formatDate(card.nextReviewDate)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Study Statistics */}
        <div className="flex justify-center">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Ease: {card.easinessFactor.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                card.nextReviewDate && new Date(card.nextReviewDate) <= new Date()
                  ? "bg-orange-500"
                  : "bg-gray-400"
              }`}></div>
              <span className="text-gray-600 dark:text-gray-400">
                {card.nextReviewDate && new Date(card.nextReviewDate) <= new Date()
                  ? "Due for review"
                  : "Not due"
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
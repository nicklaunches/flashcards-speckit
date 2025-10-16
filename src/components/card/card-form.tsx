"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import type { Card as CardType, CreateCardInput, UpdateCardInput } from "@/types";

interface CardFormProps {
  card?: CardType;
  deckId?: number;
  onSubmit: (data: CreateCardInput | UpdateCardInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CardForm({ card, deckId, onSubmit, onCancel, isLoading = false }: CardFormProps) {
  const [front, setFront] = useState(card?.front || "");
  const [back, setBack] = useState(card?.back || "");
  const [frontError, setFrontError] = useState("");
  const [backError, setBackError] = useState("");

  const isEditing = Boolean(card);
  const title = isEditing ? "Edit Card" : "Add New Card";

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Reset errors
    setFrontError("");
    setBackError("");

    // Validate front
    const trimmedFront = front.trim();
    if (trimmedFront.length === 0) {
      setFrontError("Front content is required");
      isValid = false;
    } else if (trimmedFront.length > 1000) {
      setFrontError("Front content must be 1000 characters or less");
      isValid = false;
    }

    // Validate back
    const trimmedBack = back.trim();
    if (trimmedBack.length === 0) {
      setBackError("Back content is required");
      isValid = false;
    } else if (trimmedBack.length > 1000) {
      setBackError("Back content must be 1000 characters or less");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && card) {
        await onSubmit({
          id: card.id,
          front: front.trim(),
          back: back.trim(),
        });
      } else if (deckId) {
        await onSubmit({
          deckId,
          front: front.trim(),
          back: back.trim(),
        });
      }
    } catch (error) {
      // Error handling is done by the parent component
      console.error("Form submission error:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label 
              htmlFor="front" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Front (Question/Prompt)
            </label>
            <Textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Enter the question or prompt for this card..."
              className={`min-h-[100px] ${frontError ? "border-red-500" : ""}`}
              disabled={isLoading}
              rows={4}
            />
            {frontError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {frontError}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {front.length}/1000 characters
            </p>
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="back" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Back (Answer/Response)
            </label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Enter the answer or response for this card..."
              className={`min-h-[100px] ${backError ? "border-red-500" : ""}`}
              disabled={isLoading}
              rows={4}
            />
            {backError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {backError}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {back.length}/1000 characters
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </div>
              ) : (
                isEditing ? "Update Card" : "Create Card"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>

        {isEditing && card && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Created: {new Date(card.createdAt).toLocaleDateString()}
              {card.updatedAt !== card.createdAt && (
                <> • Updated: {new Date(card.updatedAt).toLocaleDateString()}</>
              )}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
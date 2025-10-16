"use client";

import { useState, useEffect } from "react";
import { StudyCard } from "./study-card";
import { StudyProgress } from "./study-progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw } from "lucide-react";
import type { Card as CardType, StudySession } from "@/types";

interface StudyInterfaceProps {
  cards: CardType[];
  session: StudySession;
  onReviewCard: (cardId: number, response: "easy" | "hard", responseTimeMs?: number) => Promise<void>;
  onCompleteSession: () => Promise<void>;
  onAbandonSession: () => Promise<void>;
  onBackToDeck: () => void;
  isLoading?: boolean;
}

export function StudyInterface({
  cards,
  session,
  onReviewCard,
  onCompleteSession,
  onAbandonSession,
  onBackToDeck,
  isLoading = false
}: StudyInterfaceProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [sessionStartTime] = useState(() => Date.now());
  const [cardStartTime, setCardStartTime] = useState(() => Date.now());
  const [isProcessing, setIsProcessing] = useState(false);

  const currentCard = cards[currentCardIndex];
  const isSessionComplete = currentCardIndex >= cards.length;

  useEffect(() => {
    // Reset card state when moving to next card
    setIsFlipped(false);
    setCardStartTime(Date.now());
  }, [currentCardIndex]);

  const handleFlip = () => {
    if (!isProcessing) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleResponse = async (response: "easy" | "hard") => {
    if (isProcessing || !currentCard) return;

    try {
      setIsProcessing(true);
      const responseTime = Date.now() - cardStartTime;
      
      await onReviewCard(currentCard.id, response, responseTime);
      
      if (response === "easy") {
        setCorrectAnswers(prev => prev + 1);
      }
      
      // Move to next card
      const nextIndex = currentCardIndex + 1;
      if (nextIndex >= cards.length) {
        // Session complete
        await onCompleteSession();
      } else {
        setCurrentCardIndex(nextIndex);
      }
    } catch (error) {
      console.error("Error reviewing card:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAbandonSession = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to quit this study session? Your progress will be lost."
    );
    
    if (confirmed) {
      try {
        await onAbandonSession();
      } catch (error) {
        console.error("Error abandoning session:", error);
      }
    }
  };

  const handleRestartSession = () => {
    const confirmed = window.confirm(
      "Are you sure you want to restart this study session? Your current progress will be lost."
    );
    
    if (confirmed) {
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setCorrectAnswers(0);
      setCardStartTime(Date.now());
    }
  };

  // Empty deck state
  if (cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No cards to study
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This deck doesn't have any cards to study. Add some cards first!
              </p>
              <Button onClick={onBackToDeck}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deck
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Session complete state
  if (isSessionComplete) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 text-green-600 dark:text-green-400">🎉</div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Study Session Complete!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Great job! You've completed this study session.
              </p>
              
              {/* Session Summary */}
              <div className="grid grid-cols-2 gap-4 my-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {cards.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Cards Studied
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round((correctAnswers / cards.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Accuracy
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button onClick={onBackToDeck}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Deck
                </Button>
                <Button variant="outline" onClick={handleRestartSession}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Study Again
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Active study interface
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={onBackToDeck}
          disabled={isProcessing || isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Deck
        </Button>
      </div>

      {/* Study Progress */}
      <StudyProgress
        currentCardIndex={currentCardIndex}
        totalCards={cards.length}
        correctAnswers={correctAnswers}
        sessionStartTime={sessionStartTime}
        onQuit={handleAbandonSession}
        isLoading={isProcessing || isLoading}
      />

      {/* Study Card */}
      {currentCard && (
        <StudyCard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          onResponse={handleResponse}
          isLoading={isProcessing || isLoading}
          showResponseButtons={isFlipped}
        />
      )}

      {/* Study Instructions */}
      {currentCardIndex === 0 && !isFlipped && (
        <Card className="p-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              <strong>How to study:</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>1. Read the question carefully</div>
              <div>2. Click to reveal the answer</div>
              <div>3. Mark Easy or Hard based on your performance</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
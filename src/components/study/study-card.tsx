"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Card as CardType } from "@/types";

interface StudyCardProps {
  card: CardType;
  isFlipped: boolean;
  onFlip: () => void;
  onResponse: (response: "easy" | "hard") => void;
  isLoading?: boolean;
  showResponseButtons?: boolean;
}

export function StudyCard({ 
  card, 
  isFlipped, 
  onFlip, 
  onResponse, 
  isLoading = false,
  showResponseButtons = false
}: StudyCardProps) {
  const [responseStartTime] = useState(() => Date.now());

  const handleResponse = (response: "easy" | "hard") => {
    const responseTime = Date.now() - responseStartTime;
    console.log(`Response time: ${responseTime}ms`);
    onResponse(response);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main Card */}
      <Card 
        className={`min-h-[300px] p-8 cursor-pointer transition-all duration-300 hover:shadow-lg ${
          isFlipped ? "bg-green-50 dark:bg-green-900/20" : "bg-blue-50 dark:bg-blue-900/20"
        }`}
        onClick={!isLoading ? onFlip : undefined}
      >
        <div className="flex flex-col h-full">
          {/* Card Type Indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isFlipped 
                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
            }`}>
              {isFlipped ? "ANSWER" : "QUESTION"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isFlipped ? "Click to show question" : "Click to reveal answer"}
            </div>
          </div>

          {/* Card Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-lg md:text-xl text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                {isFlipped ? card.back : card.front}
              </p>
            </div>
          </div>

          {/* Card Metadata */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <div className="space-x-4">
                <span>Reviews: {card.repetitionCount}</span>
                <span>Interval: {card.intervalDays} days</span>
                <span>Ease: {card.easinessFactor.toFixed(1)}</span>
              </div>
              {card.nextReviewDate && (
                <span>
                  Next: {new Date(card.nextReviewDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Flip Button */}
      {!showResponseButtons && (
        <div className="flex justify-center">
          <Button
            onClick={onFlip}
            disabled={isLoading}
            size="lg"
            className="px-8"
          >
            {isFlipped ? "Show Question" : "Reveal Answer"}
          </Button>
        </div>
      )}

      {/* Response Buttons */}
      {showResponseButtons && isFlipped && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              How did you do with this card?
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleResponse("hard")}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <div className="text-center space-y-1">
                <div className="font-semibold">Hard</div>
                <div className="text-xs opacity-75">
                  Show this card more often
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => handleResponse("easy")}
              disabled={isLoading}
              size="lg"
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            >
              <div className="text-center space-y-1">
                <div className="font-semibold">Easy</div>
                <div className="text-xs opacity-75">
                  Show this card less often
                </div>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            Processing response...
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Target } from "lucide-react";

interface StudyProgressProps {
  currentCardIndex: number;
  totalCards: number;
  correctAnswers: number;
  sessionStartTime: number;
  onPause?: () => void;
  onQuit?: () => void;
  isLoading?: boolean;
}

export function StudyProgress({
  currentCardIndex,
  totalCards,
  correctAnswers,
  sessionStartTime,
  onPause,
  onQuit,
  isLoading = false
}: StudyProgressProps) {
  const progressPercentage = totalCards > 0 ? (currentCardIndex / totalCards) * 100 : 0;
  const accuracy = currentCardIndex > 0 ? (correctAnswers / currentCardIndex) * 100 : 0;
  const elapsedTime = Math.floor((Date.now() - sessionStartTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  const formatTime = (mins: number, secs: number): string => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracyColor = (acc: number): string => {
    if (acc >= 80) return "text-green-600 dark:text-green-400";
    if (acc >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="w-full p-4 mb-6">
      <div className="space-y-4">
        {/* Header with Actions */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Study Session
          </h3>
          <div className="flex gap-2">
            {onPause && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPause}
                disabled={isLoading}
              >
                Pause
              </Button>
            )}
            {onQuit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onQuit}
                disabled={isLoading}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
              >
                Quit
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Card {currentCardIndex + 1} of {totalCards}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {progressPercentage.toFixed(0)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Cards Reviewed */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Reviewed</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {currentCardIndex}
            </div>
          </div>

          {/* Correct Answers */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Correct</span>
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {correctAnswers}
            </div>
          </div>

          {/* Accuracy */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <XCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Accuracy</span>
            </div>
            <div className={`text-lg font-bold ${getAccuracyColor(accuracy)}`}>
              {currentCardIndex > 0 ? `${accuracy.toFixed(0)}%` : "-"}
            </div>
          </div>

          {/* Time Elapsed */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Time</span>
            </div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatTime(minutes, seconds)}
            </div>
          </div>
        </div>

        {/* Performance Indicator */}
        {currentCardIndex > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Easy: {correctAnswers}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Hard: {currentCardIndex - correctAnswers}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
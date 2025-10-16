"use server";

import { revalidatePath } from "next/cache";
import { studySessionRepository } from "@/lib/db/study-repository";
import { sessionCardRepository } from "@/lib/db/session-card-repository";
import { cardRepository } from "@/lib/db/card-repository";
import { withErrorHandling } from "@/lib/utils/errors";
import type { 
  StudySession,
  SessionCard,
  Card,
  StartStudySessionInput,
  ReviewCardInput,
  ApiResponse 
} from "@/types";

export const startStudySession = withErrorHandling(async (input: StartStudySessionInput): Promise<ApiResponse<StudySession>> => {
  // Check if there's already an active session for this deck
  const activeSession = await studySessionRepository.findActiveByDeckId(input.deckId);
  
  if (activeSession) {
    return {
      success: true,
      data: activeSession,
    };
  }

  // Create new session
  const session = await studySessionRepository.create(input);
  
  // Revalidate relevant paths
  revalidatePath(`/decks/${input.deckId}`);
  revalidatePath(`/decks/${input.deckId}/study`);
  
  return {
    success: true,
    data: session,
  };
});

export const reviewCard = withErrorHandling(async (input: ReviewCardInput): Promise<ApiResponse<SessionCard>> => {
  // Create session card record
  const sessionCard = await sessionCardRepository.create(input);
  
  // Update session progress
  const sessionCards = await sessionCardRepository.findBySessionId(input.sessionId);
  const cardsStudied = sessionCards.length;
  const cardsCorrect = sessionCards.filter(sc => sc.response === "easy").length;
  
  await studySessionRepository.updateProgress(input.sessionId, cardsStudied, cardsCorrect);
  
  // Update card's spaced repetition data (basic implementation for now)
  const card = await cardRepository.findById(input.cardId);
  if (card) {
    const now = new Date();
    let newIntervalDays = card.intervalDays;
    let newEasinessFactor = card.easinessFactor;
    let newRepetitionCount = card.repetitionCount + 1;
    
    if (input.response === "easy") {
      // Increase interval and maintain or slightly increase easiness
      newIntervalDays = Math.max(1, Math.round(card.intervalDays * card.easinessFactor));
      newEasinessFactor = Math.min(3.0, card.easinessFactor + 0.1);
    } else {
      // Reset interval to 1 day and decrease easiness
      newIntervalDays = 1;
      newEasinessFactor = Math.max(1.3, card.easinessFactor - 0.2);
    }
    
    // Calculate next review date
    const nextReviewDate = new Date(now.getTime() + newIntervalDays * 24 * 60 * 60 * 1000);
    
    await cardRepository.update({
      id: card.id,
      easinessFactor: newEasinessFactor,
      intervalDays: newIntervalDays,
      nextReviewDate: nextReviewDate.toISOString(),
      repetitionCount: newRepetitionCount,
    });
  }
  
  // Revalidate relevant paths
  revalidatePath(`/decks/${sessionCard.sessionId}/study`);
  
  return {
    success: true,
    data: sessionCard,
  };
});

export const completeStudySession = withErrorHandling(async (sessionId: number): Promise<ApiResponse<StudySession>> => {
  const session = await studySessionRepository.complete(sessionId);
  
  // Revalidate relevant paths
  revalidatePath("/");
  revalidatePath(`/decks`);
  
  return {
    success: true,
    data: session,
  };
});

export const abandonStudySession = withErrorHandling(async (sessionId: number): Promise<ApiResponse<void>> => {
  await studySessionRepository.abandon(sessionId);
  
  // Revalidate relevant paths
  revalidatePath("/");
  revalidatePath(`/decks`);
  
  return {
    success: true,
  };
});

export const getStudyQueue = withErrorHandling(async (deckId: number): Promise<ApiResponse<Card[]>> => {
  // For now, get all cards in the deck
  // Later this will be filtered by due date and prioritized by spaced repetition
  const cards = await cardRepository.findByDeckId(deckId);
  
  // Simple shuffle for now - later we'll implement proper spaced repetition ordering
  const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
  
  return {
    success: true,
    data: shuffledCards,
  };
});

export const getActiveStudySession = withErrorHandling(async (deckId: number): Promise<ApiResponse<StudySession | null>> => {
  const session = await studySessionRepository.findActiveByDeckId(deckId);
  
  return {
    success: true,
    data: session,
  };
});

export const getStudySessionProgress = withErrorHandling(async (sessionId: number): Promise<ApiResponse<{
  session: StudySession;
  progress: {
    totalAnswered: number;
    correctAnswers: number;
    averageResponseTime?: number;
  };
}>> => {
  const session = await studySessionRepository.findById(sessionId);
  if (!session) {
    return {
      success: false,
      error: "Study session not found",
    };
  }
  
  const progress = await sessionCardRepository.getSessionProgress(sessionId);
  
  return {
    success: true,
    data: {
      session,
      progress,
    },
  };
});
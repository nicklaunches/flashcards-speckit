"use server";

import { DeckRepository } from "@/lib/db/deck-repository";
import { withErrorHandling } from "@/lib/utils/errors";
import { validateConfirmation } from "@/lib/utils/validation";
import type {
  CreateDeckInput,
  UpdateDeckInput,
  DeleteDeckInput,
  GetDeckInput,
  ApiResponse,
  DeckWithStats,
  DeckWithCards,
} from "@/types";

const deckRepository = new DeckRepository();

export const createDeck = withErrorHandling(async (input: CreateDeckInput): Promise<ApiResponse<DeckWithStats>> => {
  const deck = await deckRepository.create(input);
  
  // Convert to DeckWithStats format
  const deckWithStats: DeckWithStats = {
    ...deck,
    statistics: {
      totalCards: 0,
      dueCards: 0,
      lastStudied: null,
    },
  };

  return {
    success: true,
    data: deckWithStats,
  };
});

export const updateDeck = withErrorHandling(async (input: UpdateDeckInput): Promise<ApiResponse<DeckWithStats>> => {
  const deck = await deckRepository.update(input);
  
  // Get stats for the updated deck
  const deckWithStats = await deckRepository.findWithStats(deck.id);
  
  if (!deckWithStats) {
    throw new Error("Failed to retrieve updated deck");
  }

  return {
    success: true,
    data: deckWithStats,
  };
});

export const deleteDeck = withErrorHandling(async (input: DeleteDeckInput): Promise<ApiResponse<{ deletedDeckId: number; deletedCardCount: number }>> => {
  validateConfirmation(input.confirmDelete);
  
  const result = await deckRepository.delete(input.id);

  return {
    success: true,
    data: result,
  };
});

export const getDeck = withErrorHandling(async (input: GetDeckInput): Promise<ApiResponse<DeckWithCards>> => {
  const deckWithStats = await deckRepository.findWithStats(input.id);
  
  if (!deckWithStats) {
    return {
      success: false,
      error: `Deck with ID ${input.id} not found`,
    };
  }

  // For now, return empty cards array - this will be populated when we implement card management
  const deckWithCards: DeckWithCards = {
    ...deckWithStats,
    cards: [],
  };

  return {
    success: true,
    data: deckWithCards,
  };
});

export const listDecks = withErrorHandling(async (): Promise<ApiResponse<DeckWithStats[]>> => {
  const decks = await deckRepository.findAll();

  return {
    success: true,
    data: decks,
  };
});

export const searchDecks = withErrorHandling(async (query: string): Promise<ApiResponse<DeckWithStats[]>> => {
  const decks = await deckRepository.search(query);

  return {
    success: true,
    data: decks,
  };
});
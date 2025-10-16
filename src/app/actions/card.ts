// Client-side card service functions
// These run in the browser and interact with SQL.js database

import { CardRepository } from "@/lib/db/card-repository";
import { withErrorHandling } from "@/lib/utils/errors";
import type { 
  Card, 
  CreateCardInput, 
  UpdateCardInput, 
  DeleteCardInput,
  ApiResponse 
} from "@/types";

// Repository is instantiated per-call to ensure fresh database connection
const getCardRepository = () => new CardRepository();

export const createCard = withErrorHandling(async (input: CreateCardInput): Promise<ApiResponse<Card>> => {
  const cardRepository = getCardRepository();
  const card = await cardRepository.create(input);
  
  return {
    success: true,
    data: card,
  };
});

export const updateCard = withErrorHandling(async (input: UpdateCardInput): Promise<ApiResponse<Card>> => {
  const cardRepository = getCardRepository();
  const card = await cardRepository.update(input);
  
  return {
    success: true,
    data: card,
  };
});

export const deleteCard = withErrorHandling(async (input: DeleteCardInput): Promise<ApiResponse<void>> => {
  if (!input.confirmDelete) {
    return {
      success: false,
      error: "Delete confirmation required",
    };
  }

  const cardRepository = getCardRepository();
  
  // Get the card to verify it exists
  const card = await cardRepository.findById(input.id);
  if (!card) {
    return {
      success: false,
      error: "Card not found",
    };
  }

  await cardRepository.delete(input.id);
  
  return {
    success: true,
  };
});

export const getCard = withErrorHandling(async (id: number): Promise<ApiResponse<Card>> => {
  const cardRepository = getCardRepository();
  const card = await cardRepository.findById(id);
  
  if (!card) {
    return {
      success: false,
      error: "Card not found",
    };
  }
  
  return {
    success: true,
    data: card,
  };
});

export const listCardsByDeck = withErrorHandling(async (deckId: number): Promise<ApiResponse<Card[]>> => {
  const cardRepository = getCardRepository();
  const cards = await cardRepository.findByDeckId(deckId);
  
  return {
    success: true,
    data: cards,
  };
});

export const bulkCreateCards = withErrorHandling(async (
  deckId: number, 
  cardInputs: Array<{ front: string; back: string }>
): Promise<ApiResponse<Card[]>> => {
  const cardRepository = getCardRepository();
  const cards = await cardRepository.bulkCreate(deckId, cardInputs);
  
  return {
    success: true,
    data: cards,
  };
});

export const getDueCards = withErrorHandling(async (deckId: number): Promise<ApiResponse<Card[]>> => {
  const cardRepository = getCardRepository();
  const cards = await cardRepository.getDueCardsByDeckId(deckId);
  
  return {
    success: true,
    data: cards,
  };
});

export const getCardCount = withErrorHandling(async (deckId: number): Promise<ApiResponse<number>> => {
  const cardRepository = getCardRepository();
  const count = await cardRepository.getCountByDeckId(deckId);
  
  return {
    success: true,
    data: count,
  };
});
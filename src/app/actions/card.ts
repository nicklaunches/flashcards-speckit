"use server";

import { revalidatePath } from "next/cache";
import { cardRepository } from "@/lib/db/card-repository";
import { withErrorHandling } from "@/lib/utils/errors";
import type { 
  Card, 
  CreateCardInput, 
  UpdateCardInput, 
  DeleteCardInput,
  ApiResponse 
} from "@/types";

export const createCard = withErrorHandling(async (input: CreateCardInput): Promise<ApiResponse<Card>> => {
  const card = await cardRepository.create(input);
  
  // Revalidate relevant paths
  revalidatePath("/");
  revalidatePath(`/decks/${input.deckId}`);
  
  return {
    success: true,
    data: card,
  };
});

export const updateCard = withErrorHandling(async (input: UpdateCardInput): Promise<ApiResponse<Card>> => {
  const card = await cardRepository.update(input);
  
  // Revalidate relevant paths
  revalidatePath("/");
  revalidatePath(`/decks`);
  
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

  // Get the card to find the deck ID for revalidation
  const card = await cardRepository.findById(input.id);
  if (!card) {
    return {
      success: false,
      error: "Card not found",
    };
  }

  await cardRepository.delete(input.id);
  
  // Revalidate relevant paths
  revalidatePath("/");
  revalidatePath(`/decks/${card.deckId}`);
  
  return {
    success: true,
  };
});

export const getCard = withErrorHandling(async (id: number): Promise<ApiResponse<Card>> => {
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
  const cards = await cardRepository.bulkCreate(deckId, cardInputs);
  
  // Revalidate relevant paths
  revalidatePath("/");
  revalidatePath(`/decks/${deckId}`);
  
  return {
    success: true,
    data: cards,
  };
});

export const getDueCards = withErrorHandling(async (deckId: number): Promise<ApiResponse<Card[]>> => {
  const cards = await cardRepository.getDueCardsByDeckId(deckId);
  
  return {
    success: true,
    data: cards,
  };
});

export const getCardCount = withErrorHandling(async (deckId: number): Promise<ApiResponse<number>> => {
  const count = await cardRepository.getCountByDeckId(deckId);
  
  return {
    success: true,
    data: count,
  };
});
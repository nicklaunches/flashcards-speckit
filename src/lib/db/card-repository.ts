import { eq, sql, desc, and } from "drizzle-orm";
import { getDatabase } from "./connection";
import { cards, decks } from "@/db/schema";
import { NotFoundError, ConflictError, DatabaseError } from "@/lib/utils/errors";
import { validateId } from "@/lib/utils/validation";
import type { Card, CreateCardInput, UpdateCardInput } from "@/types";

export class CardRepository {
  private async getDb() {
    return await getDatabase();
  }

  async create(input: CreateCardInput): Promise<Card> {
    const deckId = validateId(input.deckId);
    const front = this.validateCardContent(input.front, "front");
    const back = this.validateCardContent(input.back, "back");

    try {
      const db = await this.getDb();
      
      // Verify deck exists
      const deck = await db
        .select()
        .from(decks)
        .where(eq(decks.id, deckId))
        .limit(1);

      if (deck.length === 0) {
        throw new NotFoundError(`Deck with ID ${deckId} not found`, "DECK_NOT_FOUND");
      }

      // Check for duplicate card content within the deck
      const existing = await db
        .select()
        .from(cards)
        .where(and(
          eq(cards.deckId, deckId),
          eq(cards.front, front)
        ))
        .limit(1);

      if (existing.length > 0) {
        throw new ConflictError(`Card with this front content already exists in this deck`, "DUPLICATE_CARD");
      }

      const result = await db
        .insert(cards)
        .values({
          deckId,
          front,
          back,
          easinessFactor: 2.5,
          intervalDays: 1,
          nextReviewDate: new Date().toISOString(),
          repetitionCount: 0,
        })
        .returning();

      if (result.length === 0) {
        throw new DatabaseError("Failed to create card");
      }

      return result[0] as Card;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create card`, error instanceof Error ? error : undefined);
    }
  }

  async findById(id: number): Promise<Card | null> {
    const cardId = validateId(id);

    try {
      const db = await this.getDb();
      const result = await db
        .select()
        .from(cards)
        .where(eq(cards.id, cardId))
        .limit(1);

      return result.length > 0 ? (result[0] as Card) : null;
    } catch (error) {
      throw new DatabaseError(`Failed to find card`, error instanceof Error ? error : undefined);
    }
  }

  async findByDeckId(deckId: number): Promise<Card[]> {
    const validDeckId = validateId(deckId);

    try {
      const db = await this.getDb();
      const result = await db
        .select()
        .from(cards)
        .where(eq(cards.deckId, validDeckId))
        .orderBy(desc(cards.createdAt));

      return result as Card[];
    } catch (error) {
      throw new DatabaseError(`Failed to find cards for deck`, error instanceof Error ? error : undefined);
    }
  }

  async update(input: UpdateCardInput): Promise<Card> {
    const id = validateId(input.id);
    const updateData: Partial<typeof cards.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };

    if (input.front !== undefined) {
      updateData.front = this.validateCardContent(input.front, "front");
    }
    if (input.back !== undefined) {
      updateData.back = this.validateCardContent(input.back, "back");
    }
    if (input.easinessFactor !== undefined) {
      updateData.easinessFactor = input.easinessFactor;
    }
    if (input.intervalDays !== undefined) {
      updateData.intervalDays = input.intervalDays;
    }
    if (input.nextReviewDate !== undefined) {
      updateData.nextReviewDate = input.nextReviewDate;
    }
    if (input.repetitionCount !== undefined) {
      updateData.repetitionCount = input.repetitionCount;
    }

    try {
      const db = await this.getDb();
      
      // Check if card exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new NotFoundError(`Card with ID ${id} not found`, "CARD_NOT_FOUND");
      }

      // Check for duplicate front content if front is being updated
      if (input.front !== undefined && input.front !== existing.front) {
        const duplicate = await db
          .select()
          .from(cards)
          .where(and(
            eq(cards.deckId, existing.deckId),
            eq(cards.front, updateData.front!),
            sql`${cards.id} != ${id}`
          ))
          .limit(1);

        if (duplicate.length > 0) {
          throw new ConflictError(`Another card with this front content already exists in this deck`, "DUPLICATE_CARD");
        }
      }

      const result = await db
        .update(cards)
        .set(updateData)
        .where(eq(cards.id, id))
        .returning();

      if (result.length === 0) {
        throw new DatabaseError("Failed to update card");
      }

      return result[0] as Card;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update card`, error instanceof Error ? error : undefined);
    }
  }

  async delete(id: number): Promise<void> {
    const cardId = validateId(id);

    try {
      const db = await this.getDb();
      
      // Check if card exists
      const existing = await this.findById(cardId);
      if (!existing) {
        throw new NotFoundError(`Card with ID ${cardId} not found`, "CARD_NOT_FOUND");
      }

      const result = await db
        .delete(cards)
        .where(eq(cards.id, cardId))
        .returning();

      if (result.length === 0) {
        throw new DatabaseError("Failed to delete card");
      }
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete card`, error instanceof Error ? error : undefined);
    }
  }

  async bulkCreate(deckId: number, cardInputs: Array<{ front: string; back: string }>): Promise<Card[]> {
    const validDeckId = validateId(deckId);

    if (cardInputs.length === 0) {
      return [];
    }

    try {
      const db = await this.getDb();
      
      // Verify deck exists
      const deck = await db
        .select()
        .from(decks)
        .where(eq(decks.id, validDeckId))
        .limit(1);

      if (deck.length === 0) {
        throw new NotFoundError(`Deck with ID ${validDeckId} not found`, "DECK_NOT_FOUND");
      }

      // Validate all card inputs
      const validatedInputs = cardInputs.map((input, index) => ({
        deckId: validDeckId,
        front: this.validateCardContent(input.front, `front[${index}]`),
        back: this.validateCardContent(input.back, `back[${index}]`),
        easinessFactor: 2.5,
        intervalDays: 1,
        nextReviewDate: new Date().toISOString(),
        repetitionCount: 0,
      }));

      // Check for duplicates within the batch
      const fronts = validatedInputs.map(input => input.front);
      const uniqueFronts = new Set(fronts);
      if (uniqueFronts.size !== fronts.length) {
        throw new ConflictError("Duplicate front content found within the batch", "DUPLICATE_IN_BATCH");
      }

      // Check for existing cards with same front content
      if (fronts.length > 0) {
        const existingCards = await db
          .select({ front: cards.front })
          .from(cards)
          .where(and(
            eq(cards.deckId, validDeckId),
            sql`${cards.front} IN (${fronts.map(f => `'${f.replace(/'/g, "''")}'`).join(', ')})`
          ));

        if (existingCards.length > 0) {
          const existingFronts = existingCards.map(c => c.front);
          throw new ConflictError(
            `Cards with these front contents already exist: ${existingFronts.join(', ')}`,
            "DUPLICATE_CARDS"
          );
        }
      }

      const result = await db
        .insert(cards)
        .values(validatedInputs)
        .returning();

      return result as Card[];
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to bulk create cards`, error instanceof Error ? error : undefined);
    }
  }

  async getCountByDeckId(deckId: number): Promise<number> {
    const validDeckId = validateId(deckId);

    try {
      const db = await this.getDb();
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(cards)
        .where(eq(cards.deckId, validDeckId));

      return result[0]?.count ?? 0;
    } catch (error) {
      throw new DatabaseError(`Failed to get card count`, error instanceof Error ? error : undefined);
    }
  }

  async getDueCardsByDeckId(deckId: number): Promise<Card[]> {
    const validDeckId = validateId(deckId);

    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      
      const result = await db
        .select()
        .from(cards)
        .where(and(
          eq(cards.deckId, validDeckId),
          sql`${cards.nextReviewDate} <= ${now}`
        ))
        .orderBy(cards.nextReviewDate);

      return result as Card[];
    } catch (error) {
      throw new DatabaseError(`Failed to get due cards`, error instanceof Error ? error : undefined);
    }
  }

  private validateCardContent(content: string, fieldName: string): string {
    if (typeof content !== "string") {
      throw new Error(`${fieldName} must be a string`);
    }
    
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      throw new Error(`${fieldName} cannot be empty`);
    }
    
    if (trimmed.length > 1000) {
      throw new Error(`${fieldName} must be 1000 characters or less`);
    }
    
    return trimmed;
  }
}

// Export singleton instance
export const cardRepository = new CardRepository();
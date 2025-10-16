import { eq, sql, desc } from "drizzle-orm";
import { getDatabase } from "./connection";
import { decks, cards, studySessions } from "@/db/schema";
import { NotFoundError, ConflictError, DatabaseError } from "@/lib/utils/errors";
import { validateDeckName, validateDeckDescription, validateId } from "@/lib/utils/validation";
import type { Deck, DeckWithStats, CreateDeckInput, UpdateDeckInput } from "@/types";

export class DeckRepository {
  private async getDb() {
    return await getDatabase();
  }

  async create(input: CreateDeckInput): Promise<Deck> {
    const name = validateDeckName(input.name);
    const description = validateDeckDescription(input.description);

    try {
      const db = await this.getDb();
      
      // Check for duplicate name
      const existing = await db
        .select()
        .from(decks)
        .where(eq(decks.name, name))
        .limit(1);

      if (existing.length > 0) {
        throw new ConflictError(`Deck with name "${name}" already exists`, "DUPLICATE_NAME");
      }

      const result = await db
        .insert(decks)
        .values({
          name,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      if (!result[0]) {
        throw new DatabaseError("Failed to create deck");
      }

      return result[0];
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError("Failed to create deck", error as Error);
    }
  }

  async findById(id: number): Promise<Deck | null> {
    const deckId = validateId(id);

    try {
      const db = await this.getDb();
      const result = await db
        .select()
        .from(decks)
        .where(eq(decks.id, deckId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw new DatabaseError("Failed to find deck", error as Error);
    }
  }

  async findByIdOrThrow(id: number): Promise<Deck> {
    const deck = await this.findById(id);
    if (!deck) {
      throw new NotFoundError("Deck", id);
    }
    return deck;
  }

  async findWithStats(id: number): Promise<DeckWithStats | null> {
    const deckId = validateId(id);

    try {
      const db = await this.getDb();
      
      // Get deck
      const deck = await this.findById(deckId);
      if (!deck) {
        return null;
      }

      // Get card statistics
      const cardStats = await db
        .select({
          totalCards: sql<number>`count(*)`,
          dueCards: sql<number>`count(case when ${cards.nextReviewDate} <= datetime('now') or ${cards.nextReviewDate} is null then 1 end)`,
        })
        .from(cards)
        .where(eq(cards.deckId, deckId));

      // Get last study session
      const lastSession = await db
        .select({
          completedAt: studySessions.completedAt,
        })
        .from(studySessions)
        .where(eq(studySessions.deckId, deckId))
        .orderBy(desc(studySessions.startedAt))
        .limit(1);

      const stats = cardStats[0] || { totalCards: 0, dueCards: 0 };
      
      return {
        ...deck,
        statistics: {
          totalCards: stats.totalCards,
          dueCards: stats.dueCards,
          lastStudied: lastSession[0]?.completedAt || null,
        },
      };
    } catch (error) {
      throw new DatabaseError("Failed to find deck with stats", error as Error);
    }
  }

  async findAll(): Promise<DeckWithStats[]> {
    try {
      const db = await this.getDb();
      
      // Get all decks with statistics in a single query
      const result = await db
        .select({
          id: decks.id,
          name: decks.name,
          description: decks.description,
          createdAt: decks.createdAt,
          updatedAt: decks.updatedAt,
          totalCards: sql<number>`count(${cards.id})`,
          dueCards: sql<number>`count(case when ${cards.nextReviewDate} <= datetime('now') or ${cards.nextReviewDate} is null then 1 end)`,
        })
        .from(decks)
        .leftJoin(cards, eq(decks.id, cards.deckId))
        .groupBy(decks.id)
        .orderBy(desc(decks.updatedAt));

      // Get last study sessions for each deck
      const deckIds = result.map(deck => deck.id);
      const lastSessions = deckIds.length > 0 ? await db
        .select({
          deckId: studySessions.deckId,
          completedAt: studySessions.completedAt,
        })
        .from(studySessions)
        .where(sql`${studySessions.deckId} in (${sql.join(deckIds, sql`,`)}) and ${studySessions.completedAt} is not null`)
        .orderBy(desc(studySessions.startedAt)) : [];

      // Map last study sessions by deck ID
      const lastSessionMap = new Map<number, string>();
      for (const session of lastSessions) {
        if (!lastSessionMap.has(session.deckId) && session.completedAt) {
          lastSessionMap.set(session.deckId, session.completedAt);
        }
      }

      return result.map(deck => ({
        id: deck.id,
        name: deck.name,
        description: deck.description,
        createdAt: deck.createdAt!,
        updatedAt: deck.updatedAt!,
        statistics: {
          totalCards: deck.totalCards,
          dueCards: deck.dueCards,
          lastStudied: lastSessionMap.get(deck.id) || null,
        },
      }));
    } catch (error) {
      throw new DatabaseError("Failed to find all decks", error as Error);
    }
  }

  async update(input: UpdateDeckInput): Promise<Deck> {
    const id = validateId(input.id);
    
    // Validate fields if provided
    const updates: Partial<Pick<Deck, 'name' | 'description'>> = {};
    if (input.name !== undefined) {
      updates.name = validateDeckName(input.name);
    }
    if (input.description !== undefined) {
      updates.description = validateDeckDescription(input.description);
    }

    if (Object.keys(updates).length === 0) {
      // No changes, return existing deck
      return await this.findByIdOrThrow(id);
    }

    try {
      const db = await this.getDb();

      // Check if deck exists
      await this.findByIdOrThrow(id);

      // Check for duplicate name if name is being updated
      if (updates.name) {
        const existing = await db
          .select()
          .from(decks)
          .where(sql`${decks.name} = ${updates.name} and ${decks.id} != ${id}`)
          .limit(1);

        if (existing.length > 0) {
          throw new ConflictError(`Deck with name "${updates.name}" already exists`, "DUPLICATE_NAME");
        }
      }

      const result = await db
        .update(decks)
        .set({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(decks.id, id))
        .returning();

      if (!result[0]) {
        throw new DatabaseError("Failed to update deck");
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError("Failed to update deck", error as Error);
    }
  }

  async delete(id: number): Promise<{ deletedDeckId: number; deletedCardCount: number }> {
    const deckId = validateId(id);

    try {
      const db = await this.getDb();

      // Check if deck exists
      await this.findByIdOrThrow(deckId);

      // Check for active study sessions
      const activeSessions = await db
        .select()
        .from(studySessions)
        .where(sql`${studySessions.deckId} = ${deckId} and ${studySessions.completedAt} is null`)
        .limit(1);

      if (activeSessions.length > 0) {
        throw new ConflictError("Cannot delete deck with active study session", "ACTIVE_STUDY_SESSION");
      }

      // Count cards before deletion
      const cardCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(cards)
        .where(eq(cards.deckId, deckId));

      // Delete deck (cascades to cards and sessions)
      await db.delete(decks).where(eq(decks.id, deckId));

      return {
        deletedDeckId: deckId,
        deletedCardCount: cardCount[0]?.count || 0,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError("Failed to delete deck", error as Error);
    }
  }

  async search(query: string): Promise<DeckWithStats[]> {
    if (!query.trim()) {
      return await this.findAll();
    }

    try {
      const db = await this.getDb();
      const searchTerm = `%${query.toLowerCase()}%`;
      
      const result = await db
        .select({
          id: decks.id,
          name: decks.name,
          description: decks.description,
          createdAt: decks.createdAt,
          updatedAt: decks.updatedAt,
          totalCards: sql<number>`count(${cards.id})`,
          dueCards: sql<number>`count(case when ${cards.nextReviewDate} <= datetime('now') or ${cards.nextReviewDate} is null then 1 end)`,
        })
        .from(decks)
        .leftJoin(cards, eq(decks.id, cards.deckId))
        .where(sql`lower(${decks.name}) like ${searchTerm} or lower(${decks.description}) like ${searchTerm}`)
        .groupBy(decks.id)
        .orderBy(desc(decks.updatedAt));

      return result.map(deck => ({
        id: deck.id,
        name: deck.name,
        description: deck.description,
        createdAt: deck.createdAt!,
        updatedAt: deck.updatedAt!,
        statistics: {
          totalCards: deck.totalCards,
          dueCards: deck.dueCards,
          lastStudied: null, // Simplified for search results
        },
      }));
    } catch (error) {
      throw new DatabaseError("Failed to search decks", error as Error);
    }
  }
}
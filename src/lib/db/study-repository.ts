import { eq, sql, and, desc } from "drizzle-orm";
import { getDatabase } from "./connection";
import { studySessions, decks } from "@/db/schema";
import { NotFoundError, DatabaseError } from "@/lib/utils/errors";
import { validateId } from "@/lib/utils/validation";
import type { StudySession, StartStudySessionInput } from "@/types";

export class StudySessionRepository {
  private async getDb() {
    return await getDatabase();
  }

  async create(input: StartStudySessionInput): Promise<StudySession> {
    const deckId = validateId(input.deckId);
    const sessionType = input.sessionType || "review";

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

      const result = await db
        .insert(studySessions)
        .values({
          deckId,
          sessionType,
          cardsStudied: 0,
          cardsCorrect: 0,
        })
        .returning();

      if (result.length === 0) {
        throw new DatabaseError("Failed to create study session");
      }

      return result[0] as StudySession;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create study session`, error instanceof Error ? error : undefined);
    }
  }

  async findById(id: number): Promise<StudySession | null> {
    const sessionId = validateId(id);

    try {
      const db = await this.getDb();
      const result = await db
        .select()
        .from(studySessions)
        .where(eq(studySessions.id, sessionId))
        .limit(1);

      return result.length > 0 ? (result[0] as StudySession) : null;
    } catch (error) {
      throw new DatabaseError(`Failed to find study session`, error instanceof Error ? error : undefined);
    }
  }

  async findActiveByDeckId(deckId: number): Promise<StudySession | null> {
    const validDeckId = validateId(deckId);

    try {
      const db = await this.getDb();
      const result = await db
        .select()
        .from(studySessions)
        .where(and(
          eq(studySessions.deckId, validDeckId),
          sql`${studySessions.completedAt} IS NULL`
        ))
        .orderBy(desc(studySessions.startedAt))
        .limit(1);

      return result.length > 0 ? (result[0] as StudySession) : null;
    } catch (error) {
      throw new DatabaseError(`Failed to find active study session`, error instanceof Error ? error : undefined);
    }
  }

  async updateProgress(id: number, cardsStudied: number, cardsCorrect: number): Promise<StudySession> {
    const sessionId = validateId(id);

    try {
      const db = await this.getDb();
      
      // Check if session exists
      const existing = await this.findById(sessionId);
      if (!existing) {
        throw new NotFoundError(`Study session with ID ${sessionId} not found`, "SESSION_NOT_FOUND");
      }

      // Check if session is already completed
      if (existing.completedAt) {
        throw new DatabaseError("Cannot update completed study session");
      }

      const result = await db
        .update(studySessions)
        .set({
          cardsStudied,
          cardsCorrect,
        })
        .where(eq(studySessions.id, sessionId))
        .returning();

      if (result.length === 0) {
        throw new DatabaseError("Failed to update study session");
      }

      return result[0] as StudySession;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update study session`, error instanceof Error ? error : undefined);
    }
  }

  async complete(id: number): Promise<StudySession> {
    const sessionId = validateId(id);

    try {
      const db = await this.getDb();
      
      // Check if session exists
      const existing = await this.findById(sessionId);
      if (!existing) {
        throw new NotFoundError(`Study session with ID ${sessionId} not found`, "SESSION_NOT_FOUND");
      }

      // Check if session is already completed
      if (existing.completedAt) {
        throw new DatabaseError("Study session is already completed");
      }

      const result = await db
        .update(studySessions)
        .set({
          completedAt: new Date().toISOString(),
        })
        .where(eq(studySessions.id, sessionId))
        .returning();

      if (result.length === 0) {
        throw new DatabaseError("Failed to complete study session");
      }

      return result[0] as StudySession;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to complete study session`, error instanceof Error ? error : undefined);
    }
  }

  async abandon(id: number): Promise<void> {
    const sessionId = validateId(id);

    try {
      const db = await this.getDb();
      
      // Check if session exists
      const existing = await this.findById(sessionId);
      if (!existing) {
        throw new NotFoundError(`Study session with ID ${sessionId} not found`, "SESSION_NOT_FOUND");
      }

      // If session is already completed, don't allow abandoning
      if (existing.completedAt) {
        throw new DatabaseError("Cannot abandon completed study session");
      }

      // Delete the session (which will cascade delete session cards)
      const result = await db
        .delete(studySessions)
        .where(eq(studySessions.id, sessionId))
        .returning();

      if (result.length === 0) {
        throw new DatabaseError("Failed to abandon study session");
      }
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to abandon study session`, error instanceof Error ? error : undefined);
    }
  }

  async findByDeckId(deckId: number, limit: number = 10): Promise<StudySession[]> {
    const validDeckId = validateId(deckId);

    try {
      const db = await this.getDb();
      const result = await db
        .select()
        .from(studySessions)
        .where(eq(studySessions.deckId, validDeckId))
        .orderBy(desc(studySessions.startedAt))
        .limit(limit);

      return result as StudySession[];
    } catch (error) {
      throw new DatabaseError(`Failed to find study sessions`, error instanceof Error ? error : undefined);
    }
  }

  async getSessionStats(id: number): Promise<{
    totalCards: number;
    correctCards: number;
    accuracy: number;
    averageResponseTime?: number;
  }> {
    const sessionId = validateId(id);

    try {
      const session = await this.findById(sessionId);
      if (!session) {
        throw new NotFoundError(`Study session with ID ${sessionId} not found`, "SESSION_NOT_FOUND");
      }

      const accuracy = session.cardsStudied > 0 
        ? (session.cardsCorrect / session.cardsStudied) * 100 
        : 0;

      return {
        totalCards: session.cardsStudied,
        correctCards: session.cardsCorrect,
        accuracy: Math.round(accuracy * 100) / 100, // Round to 2 decimal places
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to get session stats`, error instanceof Error ? error : undefined);
    }
  }
}

// Export singleton instance
export const studySessionRepository = new StudySessionRepository();
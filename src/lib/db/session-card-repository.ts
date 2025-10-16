import { eq, sql, and, desc } from "drizzle-orm";
import { getDatabase } from "./connection";
import { sessionCards, studySessions, cards } from "@/db/schema";
import { NotFoundError, DatabaseError } from "@/lib/utils/errors";
import { validateId } from "@/lib/utils/validation";
import type { SessionCard, ReviewCardInput } from "@/types";

export class SessionCardRepository {
  private async getDb() {
    return await getDatabase();
  }

  async create(input: ReviewCardInput): Promise<SessionCard> {
    const sessionId = validateId(input.sessionId);
    const cardId = validateId(input.cardId);
    const response = this.validateResponse(input.response);
    const responseTimeMs = input.responseTimeMs;

    try {
      const db = await this.getDb();

      // Verify session exists and is not completed
      const session = await db
        .select()
        .from(studySessions)
        .where(eq(studySessions.id, sessionId))
        .limit(1);

      if (session.length === 0) {
        throw new NotFoundError(`Study session with ID ${sessionId} not found`, "SESSION_NOT_FOUND");
      }

      if (session[0].completedAt) {
        throw new DatabaseError("Cannot add cards to completed study session");
      }

      // Verify card exists
      const card = await db
        .select()
        .from(cards)
        .where(eq(cards.id, cardId))
        .limit(1);

      if (card.length === 0) {
        throw new NotFoundError(`Card with ID ${cardId} not found`, "CARD_NOT_FOUND");
      }

      // Check if this card was already reviewed in this session
      const existing = await db
        .select()
        .from(sessionCards)
        .where(and(
          eq(sessionCards.sessionId, sessionId),
          eq(sessionCards.cardId, cardId)
        ))
        .limit(1);

      if (existing.length > 0) {
        throw new DatabaseError("Card has already been reviewed in this session");
      }

      const result = await db
        .insert(sessionCards)
        .values({
          sessionId,
          cardId,
          response,
          responseTimeMs: responseTimeMs || null,
        })
        .returning();

      if (result.length === 0) {
        throw new DatabaseError("Failed to create session card");
      }

      return result[0] as SessionCard;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create session card`, error instanceof Error ? error : undefined);
    }
  }

  async findBySessionId(sessionId: number): Promise<SessionCard[]> {
    const validSessionId = validateId(sessionId);

    try {
      const db = await this.getDb();
      const result = await db
        .select()
        .from(sessionCards)
        .where(eq(sessionCards.sessionId, validSessionId))
        .orderBy(desc(sessionCards.reviewedAt));

      return result as SessionCard[];
    } catch (error) {
      throw new DatabaseError(`Failed to find session cards`, error instanceof Error ? error : undefined);
    }
  }

  async findByCardId(cardId: number, limit: number = 10): Promise<SessionCard[]> {
    const validCardId = validateId(cardId);

    try {
      const db = await this.getDb();
      const result = await db
        .select()
        .from(sessionCards)
        .where(eq(sessionCards.cardId, validCardId))
        .orderBy(desc(sessionCards.reviewedAt))
        .limit(limit);

      return result as SessionCard[];
    } catch (error) {
      throw new DatabaseError(`Failed to find session cards for card`, error instanceof Error ? error : undefined);
    }
  }

  async getSessionProgress(sessionId: number): Promise<{
    totalAnswered: number;
    correctAnswers: number;
    averageResponseTime?: number;
  }> {
    const validSessionId = validateId(sessionId);

    try {
      const db = await this.getDb();

      // Get all session cards for this session
      const sessionCardsResult = await db
        .select({
          response: sessionCards.response,
          responseTimeMs: sessionCards.responseTimeMs,
        })
        .from(sessionCards)
        .where(eq(sessionCards.sessionId, validSessionId));

      const totalAnswered = sessionCardsResult.length;
      const correctAnswers = sessionCardsResult.filter(sc => sc.response === "easy").length;

      // Calculate average response time (only for cards with response time)
      const responseTimes = sessionCardsResult
        .map(sc => sc.responseTimeMs)
        .filter((time): time is number => time !== null);

      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : undefined;

      return {
        totalAnswered,
        correctAnswers,
        averageResponseTime,
      };
    } catch (error) {
      throw new DatabaseError(`Failed to get session progress`, error instanceof Error ? error : undefined);
    }
  }

  async getCardPerformanceHistory(cardId: number): Promise<{
    totalReviews: number;
    correctReviews: number;
    averageResponseTime?: number;
    lastReviewed?: string;
  }> {
    const validCardId = validateId(cardId);

    try {
      const db = await this.getDb();

      // Get all session cards for this card
      const cardHistory = await db
        .select({
          response: sessionCards.response,
          responseTimeMs: sessionCards.responseTimeMs,
          reviewedAt: sessionCards.reviewedAt,
        })
        .from(sessionCards)
        .where(eq(sessionCards.cardId, validCardId))
        .orderBy(desc(sessionCards.reviewedAt));

      const totalReviews = cardHistory.length;
      const correctReviews = cardHistory.filter(sc => sc.response === "easy").length;

      // Calculate average response time (only for cards with response time)
      const responseTimes = cardHistory
        .map(sc => sc.responseTimeMs)
        .filter((time): time is number => time !== null);

      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : undefined;

      const lastReviewed = cardHistory.length > 0 ? cardHistory[0].reviewedAt : undefined;

      return {
        totalReviews,
        correctReviews,
        averageResponseTime,
        lastReviewed,
      };
    } catch (error) {
      throw new DatabaseError(`Failed to get card performance history`, error instanceof Error ? error : undefined);
    }
  }

  async deleteBySessionId(sessionId: number): Promise<void> {
    const validSessionId = validateId(sessionId);

    try {
      const db = await this.getDb();
      await db
        .delete(sessionCards)
        .where(eq(sessionCards.sessionId, validSessionId));
    } catch (error) {
      throw new DatabaseError(`Failed to delete session cards`, error instanceof Error ? error : undefined);
    }
  }

  private validateResponse(response: string): "easy" | "hard" {
    if (response !== "easy" && response !== "hard") {
      throw new Error(`Invalid response: ${response}. Must be 'easy' or 'hard'`);
    }
    return response;
  }
}

// Export singleton instance
export const sessionCardRepository = new SessionCardRepository();
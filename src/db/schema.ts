import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const decks = sqliteTable("decks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 100 }).notNull(),
  description: text("description", { length: 500 }).notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  deckId: integer("deck_id").notNull().references(() => decks.id, { onDelete: "cascade" }),
  front: text("front", { length: 1000 }).notNull(),
  back: text("back", { length: 1000 }).notNull(),
  easinessFactor: real("easiness_factor").notNull().default(2.5),
  intervalDays: integer("interval_days").notNull().default(1),
  nextReviewDate: text("next_review_date"),
  repetitionCount: integer("repetition_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const studySessions = sqliteTable("study_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  deckId: integer("deck_id").notNull().references(() => decks.id, { onDelete: "cascade" }),
  cardsStudied: integer("cards_studied").notNull().default(0),
  cardsCorrect: integer("cards_correct").notNull().default(0),
  startedAt: text("started_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
  sessionType: text("session_type").notNull().default("review"),
});

export const sessionCards = sqliteTable("session_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull().references(() => studySessions.id, { onDelete: "cascade" }),
  cardId: integer("card_id").notNull().references(() => cards.id, { onDelete: "cascade" }),
  response: text("response").notNull(), // 'easy' or 'hard'
  responseTimeMs: integer("response_time_ms"),
  reviewedAt: text("reviewed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Relations for Drizzle queries
import { relations } from "drizzle-orm";

export const decksRelations = relations(decks, ({ many }) => ({
  cards: many(cards),
  studySessions: many(studySessions),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  deck: one(decks, {
    fields: [cards.deckId],
    references: [decks.id],
  }),
  sessionCards: many(sessionCards),
}));

export const studySessionsRelations = relations(studySessions, ({ one, many }) => ({
  deck: one(decks, {
    fields: [studySessions.deckId],
    references: [decks.id],
  }),
  sessionCards: many(sessionCards),
}));

export const sessionCardsRelations = relations(sessionCards, ({ one }) => ({
  session: one(studySessions, {
    fields: [sessionCards.sessionId],
    references: [studySessions.id],
  }),
  card: one(cards, {
    fields: [sessionCards.cardId],
    references: [cards.id],
  }),
}));
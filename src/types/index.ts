// Database entity types
export interface Deck {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: number;
  deckId: number;
  front: string;
  back: string;
  easinessFactor: number;
  intervalDays: number;
  nextReviewDate: string | null;
  repetitionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: number;
  deckId: number;
  cardsStudied: number;
  cardsCorrect: number;
  startedAt: string;
  completedAt: string | null;
  sessionType: "review" | "cram" | "new";
}

export interface SessionCard {
  id: number;
  sessionId: number;
  cardId: number;
  response: "easy" | "hard";
  responseTimeMs: number | null;
  reviewedAt: string;
}

// API input/output types
export interface CreateDeckInput {
  name: string;
  description?: string;
}

export interface UpdateDeckInput {
  id: number;
  name?: string;
  description?: string;
}

export interface DeleteDeckInput {
  id: number;
  confirmDelete: boolean;
}

export interface GetDeckInput {
  id: number;
}

export interface CreateCardInput {
  deckId: number;
  front: string;
  back: string;
}

export interface UpdateCardInput {
  id: number;
  front?: string;
  back?: string;
  easinessFactor?: number;
  intervalDays?: number;
  nextReviewDate?: string;
  repetitionCount?: number;
}

export interface DeleteCardInput {
  id: number;
  confirmDelete: boolean;
}

export interface StartStudySessionInput {
  deckId: number;
  sessionType?: "review" | "cram" | "new";
}

export interface ReviewCardInput {
  sessionId: number;
  cardId: number;
  response: "easy" | "hard";
  responseTimeMs?: number;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DeckWithStats {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  statistics: {
    totalCards: number;
    dueCards: number;
    lastStudied: string | null;
    studyStreak?: number;
  };
}

export interface DeckWithCards extends DeckWithStats {
  cards: Card[];
}

export interface StudyQueue {
  sessionId: number;
  cards: Card[];
  currentIndex: number;
  totalCards: number;
}

// Component props types
export interface DeckCardProps {
  deck: DeckWithStats;
  onEdit?: (deck: DeckWithStats) => void;
  onDelete?: (deck: DeckWithStats) => void;
  onStudy?: (deck: DeckWithStats) => void;
}

export interface CardItemProps {
  card: Card;
  onEdit?: (card: Card) => void;
  onDelete?: (card: Card) => void;
}

export interface StudyCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  onResponse: (response: "easy" | "hard") => void;
}

// Spaced repetition types
export interface SpacedRepetitionResult {
  easinessFactor: number;
  intervalDays: number;
  nextReviewDate: string;
  repetitionCount: number;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  deckId?: number;
  cardType?: "due" | "new" | "all";
}

export interface SearchResult {
  type: "deck" | "card";
  item: Deck | Card;
  highlights?: string[];
}
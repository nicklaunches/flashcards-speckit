# API Contracts: Study System

## Server Actions

### startStudySession
**Purpose**: Begin a new study session for a deck

**Input Type**:
```typescript
interface StartStudySessionInput {
  deck_id: number;
  session_type?: 'review' | 'cram' | 'new'; // Default: 'review'
  max_cards?: number; // Optional limit, default: all due cards
}
```

**Output Type**:
```typescript
interface StartStudySessionOutput {
  success: boolean;
  data?: {
    session_id: number;
    deck_id: number;
    cards: Array<{
      id: number;
      front: string;
      back: string;
      // Back initially hidden, revealed on flip
    }>;
    session_type: string;
    started_at: string;
  };
  error?: string;
}
```

**Business Rules**:
- 'review' mode: Only shows cards due for review
- 'cram' mode: Shows all cards regardless of due date
- 'new' mode: Shows only cards never studied
- Maximum one active session per deck

**Error Cases**:
- `DECK_NOT_FOUND`: Deck with given ID doesn't exist
- `NO_CARDS_AVAILABLE`: No cards match session type criteria
- `ACTIVE_SESSION_EXISTS`: Deck already has active study session

---

### reviewCard
**Purpose**: Submit user's response to a card during study

**Input Type**:
```typescript
interface ReviewCardInput {
  session_id: number;
  card_id: number;
  response: 'easy' | 'hard';
  response_time_ms?: number; // Optional timing data
}
```

**Output Type**:
```typescript
interface ReviewCardOutput {
  success: boolean;
  data?: {
    card_id: number;
    next_review_date: string;
    new_interval_days: number;
    session_progress: {
      cards_studied: number;
      cards_remaining: number;
      current_accuracy: number;
    };
    next_card?: {
      id: number;
      front: string;
      // Back hidden until flip
    } | null; // null if session complete
  };
  error?: string;
}
```

**Business Rules**:
- Updates card's spaced repetition parameters immediately
- 'easy' response: Increases interval based on easiness factor
- 'hard' response: Resets interval to 1 day, decreases easiness factor
- Tracks response in SessionCard junction table

**Error Cases**:
- `SESSION_NOT_FOUND`: Session doesn't exist or is completed
- `CARD_NOT_IN_SESSION`: Card not part of current study session
- `CARD_ALREADY_REVIEWED`: Card already reviewed in this session
- `INVALID_RESPONSE`: Response must be 'easy' or 'hard'

---

### completeStudySession
**Purpose**: Mark study session as finished

**Input Type**:
```typescript
interface CompleteStudySessionInput {
  session_id: number;
}
```

**Output Type**:
```typescript
interface CompleteStudySessionOutput {
  success: boolean;
  data?: {
    session_id: number;
    summary: {
      cards_studied: number;
      cards_correct: number;
      accuracy_percentage: number;
      session_duration_ms: number;
      deck_progress: {
        total_cards: number;
        mastered_cards: number;
        due_tomorrow: number;
      };
    };
  };
  error?: string;
}
```

**Business Rules**:
- Can only complete session with at least one card reviewed
- Sets completed_at timestamp
- Calculates final statistics

**Error Cases**:
- `SESSION_NOT_FOUND`: Session doesn't exist
- `SESSION_ALREADY_COMPLETE`: Session was already completed
- `NO_CARDS_REVIEWED`: Cannot complete session without reviewing cards

---

### abandonStudySession
**Purpose**: Cancel active study session without completion

**Input Type**:
```typescript
interface AbandonStudySessionInput {
  session_id: number;
}
```

**Output Type**:
```typescript
interface AbandonStudySessionOutput {
  success: boolean;
  data?: {
    session_id: number;
    cards_reviewed: number;
  };
  error?: string;
}
```

**Business Rules**:
- Preserves any card reviews already submitted
- Does not set completed_at timestamp
- Session marked as abandoned in database

---

### getStudyQueue
**Purpose**: Get cards due for review in a deck

**Input Type**:
```typescript
interface GetStudyQueueInput {
  deck_id: number;
  session_type?: 'review' | 'cram' | 'new';
}
```

**Output Type**:
```typescript
interface GetStudyQueueOutput {
  success: boolean;
  data?: {
    deck_id: number;
    available_cards: number;
    cards: Array<{
      id: number;
      next_review_date: string | null;
      interval_days: number;
      // Content not included for queue preview
    }>;
  };
  error?: string;
}
```

## Client-Side Hooks

### useStudySession
**Purpose**: React hook managing active study session state

```typescript
interface UseStudySessionReturn {
  // Session state
  session: {
    id: number;
    cards: StudyCard[];
    currentCardIndex: number;
    isComplete: boolean;
  } | null;
  
  // Current card state
  currentCard: StudyCard | null;
  isCardFlipped: boolean;
  
  // Actions
  startSession: (input: StartStudySessionInput) => Promise<void>;
  flipCard: () => void;
  reviewCard: (response: 'easy' | 'hard') => Promise<void>;
  completeSession: () => Promise<CompleteStudySessionOutput>;
  abandonSession: () => Promise<void>;
  
  // Status
  isLoading: boolean;
  error: string | null;
}

interface StudyCard {
  id: number;
  front: string;
  back: string;
}
```

### useStudyKeyboard
**Purpose**: Keyboard shortcuts for study interface

```typescript
interface UseStudyKeyboardReturn {
  // Automatically binds to study session hook
  // Space: flip card or advance to next
  // J: mark card as hard
  // K: mark card as easy  
  // Escape: abandon session (with confirmation)
}
```

### useStudyStats
**Purpose**: Real-time study statistics

```typescript
interface UseStudyStatsReturn {
  stats: {
    cards_studied: number;
    cards_correct: number;
    accuracy_percentage: number;
    session_duration_ms: number;
    estimated_remaining_time_ms: number;
  } | null;
  isLoading: boolean;
}
```
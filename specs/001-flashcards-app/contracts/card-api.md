# API Contracts: Card Management

## Server Actions

### createCard
**Purpose**: Add a new flashcard to a deck

**Input Type**:
```typescript
interface CreateCardInput {
  deck_id: number;
  front: string;    // Required, 1-1000 characters
  back: string;     // Required, 1-1000 characters
}
```

**Output Type**:
```typescript
interface CreateCardOutput {
  success: boolean;
  data?: {
    id: number;
    deck_id: number;
    front: string;
    back: string;
    easiness_factor: number;
    interval_days: number;
    next_review_date: string | null;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}
```

**Validation Rules**:
- `front` and `back` must be non-empty after trimming
- `deck_id` must reference existing deck
- Content length limits enforced

**Error Cases**:
- `DECK_NOT_FOUND`: Referenced deck doesn't exist
- `INVALID_FRONT`: Front content is empty or too long
- `INVALID_BACK`: Back content is empty or too long

---

### updateCard
**Purpose**: Edit existing card content

**Input Type**:
```typescript
interface UpdateCardInput {
  id: number;
  front?: string;   // Optional, 1-1000 characters
  back?: string;    // Optional, 1-1000 characters
}
```

**Output Type**:
```typescript
interface UpdateCardOutput {
  success: boolean;
  data?: {
    id: number;
    front: string;
    back: string;
    updated_at: string;
    // Note: Spaced repetition data reset on content change
    easiness_factor: number;
    interval_days: number;
    next_review_date: string | null;
  };
  error?: string;
}
```

**Business Rules**:
- Updating card content resets spaced repetition progress
- This prevents gaming the system by editing after difficult reviews

**Error Cases**:
- `CARD_NOT_FOUND`: Card with given ID doesn't exist
- `INVALID_CONTENT`: Content validation failed
- `NO_CHANGES`: No valid changes provided

---

### deleteCard
**Purpose**: Remove card from deck

**Input Type**:
```typescript
interface DeleteCardInput {
  id: number;
}
```

**Output Type**:
```typescript
interface DeleteCardOutput {
  success: boolean;
  data?: {
    deletedCardId: number;
    deck_id: number;
  };
  error?: string;
}
```

**Error Cases**:
- `CARD_NOT_FOUND`: Card with given ID doesn't exist

---

### getCard
**Purpose**: Retrieve single card details

**Input Type**:
```typescript
interface GetCardInput {
  id: number;
}
```

**Output Type**:
```typescript
interface GetCardOutput {
  success: boolean;
  data?: {
    id: number;
    deck_id: number;
    front: string;
    back: string;
    easiness_factor: number;
    interval_days: number;
    next_review_date: string | null;
    repetition_count: number;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}
```

---

### bulkCreateCards
**Purpose**: Import multiple cards at once (for CSV import, etc.)

**Input Type**:
```typescript
interface BulkCreateCardsInput {
  deck_id: number;
  cards: Array<{
    front: string;
    back: string;
  }>;
}
```

**Output Type**:
```typescript
interface BulkCreateCardsOutput {
  success: boolean;
  data?: {
    created_count: number;
    failed_count: number;
    created_cards: Array<{
      id: number;
      front: string;
      back: string;
    }>;
    errors?: Array<{
      index: number;
      error: string;
      card: { front: string; back: string; };
    }>;
  };
  error?: string;
}
```

**Business Rules**:
- Transaction-based: all cards created or none
- Partial failures reported with specific error details
- Maximum 100 cards per bulk operation

## Client-Side Hooks

### useCardMutations
**Purpose**: React hook providing card mutation functions

```typescript
interface UseCardMutationsReturn {
  createCard: (input: CreateCardInput) => Promise<CreateCardOutput>;
  updateCard: (input: UpdateCardInput) => Promise<UpdateCardOutput>;
  deleteCard: (input: DeleteCardInput) => Promise<DeleteCardOutput>;
  bulkCreateCards: (input: BulkCreateCardsInput) => Promise<BulkCreateCardsOutput>;
  isLoading: boolean;
  error: string | null;
}
```

### useCardQuery
**Purpose**: React hook for fetching individual card

```typescript
interface UseCardQueryReturn {
  card: GetCardOutput['data'] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```
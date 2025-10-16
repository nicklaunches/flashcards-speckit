# API Contracts: Deck Management

## Server Actions

### createDeck
**Purpose**: Create a new flashcard deck

**Input Type**:
```typescript
interface CreateDeckInput {
  name: string;          // Required, 1-100 characters
  description?: string;  // Optional, max 500 characters  
}
```

**Output Type**:
```typescript
interface CreateDeckOutput {
  success: boolean;
  data?: {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}
```

**Validation Rules**:
- `name` must be non-empty after trimming
- `name` must be unique across all decks
- `description` defaults to empty string if not provided

**Error Cases**:
- `DUPLICATE_NAME`: Deck with same name already exists
- `INVALID_NAME`: Name is empty or too long
- `INVALID_DESCRIPTION`: Description exceeds 500 characters

---

### updateDeck
**Purpose**: Update existing deck metadata

**Input Type**:
```typescript
interface UpdateDeckInput {
  id: number;
  name?: string;         // Optional, 1-100 characters
  description?: string;  // Optional, max 500 characters
}
```

**Output Type**:
```typescript
interface UpdateDeckOutput {
  success: boolean;
  data?: {
    id: number;
    name: string;
    description: string;
    updated_at: string;
  };
  error?: string;
}
```

**Error Cases**:
- `DECK_NOT_FOUND`: Deck with given ID doesn't exist
- `DUPLICATE_NAME`: Another deck already has the new name
- `INVALID_NAME`: Name validation failed

---

### deleteDeck
**Purpose**: Delete deck and all associated cards

**Input Type**:
```typescript
interface DeleteDeckInput {
  id: number;
  confirmDelete: boolean; // Must be true to proceed
}
```

**Output Type**:
```typescript
interface DeleteDeckOutput {
  success: boolean;
  data?: {
    deletedDeckId: number;
    deletedCardCount: number;
  };
  error?: string;
}
```

**Error Cases**:
- `DECK_NOT_FOUND`: Deck with given ID doesn't exist
- `CONFIRMATION_REQUIRED`: confirmDelete must be true
- `ACTIVE_STUDY_SESSION`: Cannot delete deck with active study session

---

### getDeck
**Purpose**: Retrieve single deck with all cards

**Input Type**:
```typescript
interface GetDeckInput {
  id: number;
}
```

**Output Type**:
```typescript
interface GetDeckOutput {
  success: boolean;
  data?: {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    cards: Array<{
      id: number;
      front: string;
      back: string;
      next_review_date: string | null;
      created_at: string;
    }>;
    statistics: {
      total_cards: number;
      due_cards: number;
      last_studied: string | null;
    };
  };
  error?: string;
}
```

---

### listDecks
**Purpose**: Get all decks with basic metadata

**Input Type**:
```typescript
interface ListDecksInput {
  // No parameters - returns all decks
}
```

**Output Type**:
```typescript
interface ListDecksOutput {
  success: boolean;
  data?: Array<{
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    statistics: {
      total_cards: number;
      due_cards: number;
      last_studied: string | null;
      study_streak: number;
    };
  }>;
  error?: string;
}
```

## Client-Side Hooks

### useDeckMutations
**Purpose**: React hook providing deck mutation functions

```typescript
interface UseDeckMutationsReturn {
  createDeck: (input: CreateDeckInput) => Promise<CreateDeckOutput>;
  updateDeck: (input: UpdateDeckInput) => Promise<UpdateDeckOutput>;
  deleteDeck: (input: DeleteDeckInput) => Promise<DeleteDeckOutput>;
  isLoading: boolean;
  error: string | null;
}
```

### useDeckQuery
**Purpose**: React hook for fetching deck data

```typescript
interface UseDeckQueryReturn {
  deck: GetDeckOutput['data'] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```
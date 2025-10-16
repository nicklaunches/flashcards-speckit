# API Contracts: Search & Global Operations

## Server Actions

### searchContent
**Purpose**: Full-text search across decks and cards

**Input Type**:
```typescript
interface SearchContentInput {
  query: string;        // Search term, minimum 2 characters
  filters?: {
    include_decks?: boolean;     // Default: true
    include_cards?: boolean;     // Default: true
    deck_ids?: number[];         // Optional: limit to specific decks
  };
  limit?: number;       // Default: 50, max: 100
}
```

**Output Type**:
```typescript
interface SearchContentOutput {
  success: boolean;
  data?: {
    query: string;
    total_results: number;
    decks: Array<{
      id: number;
      name: string;
      description: string;
      match_type: 'name' | 'description';
      card_count: number;
    }>;
    cards: Array<{
      id: number;
      deck_id: number;
      deck_name: string;
      front: string;
      back: string;
      match_type: 'front' | 'back';
      match_snippet: string; // Highlighted excerpt
    }>;
  };
  error?: string;
}
```

**Search Features**:
- Case-insensitive matching
- Partial word matching
- Highlighted search results
- Relevance-based ordering

**Error Cases**:
- `QUERY_TOO_SHORT`: Query must be at least 2 characters
- `INVALID_FILTERS`: Invalid filter parameters

---

### exportData
**Purpose**: Export all user data for backup/portability

**Input Type**:
```typescript
interface ExportDataInput {
  format: 'json' | 'csv';
  include_study_history?: boolean; // Default: false
}
```

**Output Type**:
```typescript
interface ExportDataOutput {
  success: boolean;
  data?: {
    format: string;
    filename: string;
    content: string;     // Base64-encoded file content
    size_bytes: number;
    exported_at: string;
    summary: {
      decks_count: number;
      cards_count: number;
      sessions_count?: number; // If study history included
    };
  };
  error?: string;
}
```

**Export Formats**:
- JSON: Complete data with all relationships
- CSV: Flattened card data suitable for spreadsheet import

---

### importData
**Purpose**: Import data from backup or external source

**Input Type**:
```typescript
interface ImportDataInput {
  content: string;      // File content as string
  format: 'json' | 'csv';
  options?: {
    merge_strategy: 'replace' | 'merge' | 'append'; // Default: 'append'
    create_backup: boolean; // Default: true
  };
}
```

**Output Type**:
```typescript
interface ImportDataOutput {
  success: boolean;
  data?: {
    imported_counts: {
      decks: number;
      cards: number;
      sessions?: number;
    };
    skipped_counts: {
      duplicate_decks: number;
      invalid_cards: number;
    };
    backup_created?: {
      filename: string;
      size_bytes: number;
    };
  };
  error?: string;
}
```

**Import Strategies**:
- 'replace': Clear existing data, import new
- 'merge': Update existing, add new
- 'append': Add all as new (rename duplicates)

**Error Cases**:
- `INVALID_FORMAT`: File format not recognized
- `CORRUPT_DATA`: Data structure validation failed
- `BACKUP_FAILED`: Could not create backup before import

---

### getGlobalStats
**Purpose**: Application-wide statistics and insights

**Input Type**:
```typescript
interface GetGlobalStatsInput {
  // No parameters
}
```

**Output Type**:
```typescript
interface GetGlobalStatsOutput {
  success: boolean;
  data?: {
    overview: {
      total_decks: number;
      total_cards: number;
      cards_due_today: number;
      study_streak_days: number;
    };
    study_performance: {
      total_sessions: number;
      average_accuracy: number;
      total_study_time_hours: number;
      cards_mastered: number;
    };
    recent_activity: {
      decks_studied_this_week: number;
      cards_reviewed_today: number;
      longest_session_today_minutes: number;
      last_study_date: string | null;
    };
    deck_breakdown: Array<{
      deck_id: number;
      deck_name: string;
      card_count: number;
      due_count: number;
      mastery_percentage: number;
    }>;
  };
  error?: string;
}
```

## Client-Side Hooks

### useSearch
**Purpose**: React hook for search functionality

```typescript
interface UseSearchReturn {
  // Search state
  query: string;
  results: SearchContentOutput['data'] | null;
  isSearching: boolean;
  
  // Actions
  search: (query: string, filters?: SearchContentInput['filters']) => Promise<void>;
  clearSearch: () => void;
  
  // Status
  error: string | null;
}
```

### useDataOperations
**Purpose**: Import/export functionality

```typescript
interface UseDataOperationsReturn {
  // Export
  exportData: (format: 'json' | 'csv', includeHistory?: boolean) => Promise<void>;
  
  // Import
  importData: (file: File, options?: ImportDataInput['options']) => Promise<ImportDataOutput>;
  
  // Status
  isExporting: boolean;
  isImporting: boolean;
  error: string | null;
}
```

### useGlobalStats
**Purpose**: Application statistics

```typescript
interface UseGlobalStatsReturn {
  stats: GetGlobalStatsOutput['data'] | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
```

## Error Handling

### Global Error Types
```typescript
type ApiError = 
  | 'NETWORK_ERROR'
  | 'DATABASE_ERROR' 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

interface ErrorResponse {
  success: false;
  error: string;
  error_code: ApiError;
  details?: Record<string, any>;
  timestamp: string;
}
```

### Client Error Handling
- Automatic retry for network errors
- User-friendly error messages
- Fallback UI states for failed operations
- Error reporting (local logging only)
- Graceful degradation for non-critical features
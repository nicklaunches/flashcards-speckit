# Data Model: Offline-First Flashcards Study App

**Date**: October 15, 2025
**Feature**: 001-flashcards-app
**Status**: Phase 1 Design

## Entity Specifications

### Deck Entity

**Purpose**: Represents a collection of related flashcards organized by topic or subject

**Fields**:
- `id`: INTEGER PRIMARY KEY (auto-increment)
- `name`: TEXT NOT NULL (max 100 characters, user-facing deck title)
- `description`: TEXT (optional, max 500 characters, deck purpose/content description)
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at`: DATETIME DEFAULT CURRENT_TIMESTAMP (updated on deck or card changes)

**Validation Rules**:
- `name` must be non-empty after trimming whitespace
- `name` must be unique per user (enforced at application level)
- `description` can be empty but not null (default empty string)
- Deck cannot be deleted if it has cards without explicit confirmation

**Relationships**:
- One-to-many with Cards (CASCADE DELETE)
- One-to-many with StudySessions (CASCADE DELETE)

**State Transitions**:
- Created → Active (has cards) → Archived (soft delete, future feature)
- Study state: Never Studied → In Progress → Completed Session

**Business Rules**:
- Empty decks can exist but cannot be studied
- Deck statistics calculated from related cards and study sessions
- Last studied date derived from most recent study session

### Card Entity

**Purpose**: Individual flashcard with front/back content and spaced repetition metadata

**Fields**:
- `id`: INTEGER PRIMARY KEY (auto-increment)
- `deck_id`: INTEGER NOT NULL (foreign key to Decks)
- `front`: TEXT NOT NULL (question/prompt side, max 1000 characters)
- `back`: TEXT NOT NULL (answer/explanation side, max 1000 characters)
- `easiness_factor`: REAL DEFAULT 2.5 (SM-2 algorithm parameter, range 1.3-2.5)
- `interval_days`: INTEGER DEFAULT 1 (days until next review, minimum 1)
- `next_review_date`: DATETIME (calculated field, when card should appear next)
- `repetition_count`: INTEGER DEFAULT 0 (number of successful repetitions)
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

**Validation Rules**:
- `front` and `back` must be non-empty after trimming whitespace
- `easiness_factor` constrained to 1.3 ≤ EF ≤ 2.5
- `interval_days` must be ≥ 1
- `next_review_date` automatically calculated, not user-editable
- `repetition_count` only incremented on successful (Easy) reviews

**Relationships**:
- Many-to-one with Deck (ON DELETE CASCADE)
- One-to-many with CardReviews (future enhancement for detailed history)

**State Transitions**:
- New → Due for Review → Reviewed (Easy/Hard) → Due for Review (cycle)
- Spaced repetition intervals: 1d → 6d → 15d → 30d → 60d (approximate SM-2)

**Business Rules**:
- Cards marked "Hard" decrease easiness factor and reset interval
- Cards marked "Easy" increase interval based on easiness factor
- Due cards appear in study sessions, not-due cards don't
- Card modifications reset spaced repetition data to prevent gaming

### StudySession Entity

**Purpose**: Tracks a single study attempt with progress and performance metrics

**Fields**:
- `id`: INTEGER PRIMARY KEY (auto-increment)
- `deck_id`: INTEGER NOT NULL (foreign key to Decks)
- `cards_studied`: INTEGER DEFAULT 0 (total cards reviewed in session)
- `cards_correct`: INTEGER DEFAULT 0 (cards marked as "Easy")
- `started_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
- `completed_at`: DATETIME (null if session in progress)
- `session_type`: TEXT DEFAULT 'review' (enum: 'review', 'cram', 'new')

**Validation Rules**:
- `cards_correct` ≤ `cards_studied` (logical constraint)
- `completed_at` must be ≥ `started_at` if not null
- Session cannot be completed with zero cards studied
- Only one active session per deck at a time

**Relationships**:
- Many-to-one with Deck (ON DELETE CASCADE)
- One-to-many with SessionCards (junction table for detailed tracking)

**State Transitions**:
- Started → In Progress (cards being reviewed) → Completed/Abandoned
- Session abandonment: no `completed_at` timestamp after 30 minutes

**Business Rules**:
- Session accuracy = `cards_correct` / `cards_studied`
- Average session time calculated for deck performance metrics
- Sessions older than 90 days eligible for cleanup (future enhancement)

### SessionCard Entity (Junction Table)

**Purpose**: Detailed tracking of individual card interactions within study sessions

**Fields**:
- `id`: INTEGER PRIMARY KEY (auto-increment)
- `session_id`: INTEGER NOT NULL (foreign key to StudySessions)
- `card_id`: INTEGER NOT NULL (foreign key to Cards)
- `response`: TEXT NOT NULL (enum: 'easy', 'hard')
- `response_time_ms`: INTEGER (time taken to respond, milliseconds)
- `reviewed_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

**Validation Rules**:
- `response` must be 'easy' or 'hard'
- `response_time_ms` must be > 0 if provided
- Unique constraint on (`session_id`, `card_id`) - no duplicate reviews per session

**Relationships**:
- Many-to-one with StudySession (ON DELETE CASCADE)
- Many-to-one with Card (ON DELETE CASCADE)

**Business Rules**:
- Used to update card spaced repetition parameters
- Enables detailed analytics and progress tracking
- Response time helps identify problem cards

## Domain Aggregates

### Deck Aggregate
**Root**: Deck entity
**Contains**: Cards, current study session
**Invariants**: 
- Cannot delete deck with active study session
- Deck statistics must be consistent with contained cards

### Study Aggregate  
**Root**: StudySession entity
**Contains**: SessionCards, temporary study state
**Invariants**:
- Session cards must all belong to session's deck
- Session completion requires all selected cards to be reviewed

## Data Access Patterns

### Read Patterns
1. **Deck List**: Load all decks with basic metadata (name, card count, last studied)
2. **Deck Detail**: Load single deck with all cards for management interface
3. **Study Queue**: Load due cards for specific deck ordered by due date
4. **Search**: Full-text search across deck names, descriptions, and card content
5. **Statistics**: Aggregate queries for deck performance and study streaks

### Write Patterns
1. **CRUD Operations**: Standard create, update, delete for decks and cards
2. **Batch Card Import**: Transaction-based bulk card creation
3. **Study Progress**: Update card repetition data and create session records
4. **Backup/Restore**: Full database export/import for data portability

### Performance Considerations
- Index on `deck_id` for card queries
- Index on `next_review_date` for due card filtering
- Index on `created_at` for chronological sorting
- Composite index on (`deck_id`, `next_review_date`) for study queue

## Validation & Business Logic

### Cross-Entity Validation
- Deck names must be unique across the application
- Cards cannot exist without a valid parent deck
- Study sessions must reference existing decks with cards
- Spaced repetition dates must be in the future after updates

### Data Integrity Rules
- Foreign key constraints enforced at database level
- Application-level checks for business rule violations
- Transaction boundaries around related entity updates
- Soft delete pattern for data recovery (future enhancement)

### Error Handling
- Graceful degradation for corrupted spaced repetition data
- Data migration scripts for schema evolution
- Backup creation before destructive operations
- User confirmation for irreversible actions (deck deletion)

## Schema Evolution Strategy

### Migration Approach
- Drizzle ORM migration system for schema changes
- Semantic versioning for database schema versions
- Backward compatibility for at least one version
- Data migration scripts for breaking changes

### Future Enhancements
- Card tags/categories (many-to-many relationship)
- Deck sharing and collaboration (user authentication required)
- Multimedia card content (images, audio)
- Advanced analytics and learning curves
- Deck templates and community sharing
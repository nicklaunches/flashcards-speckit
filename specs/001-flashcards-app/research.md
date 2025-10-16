# Research Report: Offline-First Flashcards Study App

**Date**: October 15, 2025
**Feature**: 001-flashcards-app
**Status**: Phase 0 Complete

## Research Tasks Completed

### 1. Spaced Repetition Algorithm Implementation

**Decision**: Custom implementation of SM-2 algorithm with local storage
**Rationale**: 
- SM-2 is well-documented, proven effective for flashcard applications
- Simple enough to implement without external dependencies
- Maintains offline-first requirement
- Provides good balance between simplicity and effectiveness

**Alternatives considered**:
- SM-5+ algorithms: Too complex for initial implementation
- Simple interval-based: Less effective than SM-2
- External libraries: Violates offline-first principle

**Implementation approach**:
- Store easiness factor (EF) and interval for each card
- Update based on user difficulty ratings (Easy/Hard)
- Calculate next review date locally
- Default EF: 2.5, minimum interval: 1 day

### 2. SQLite with Drizzle ORM Best Practices

**Decision**: File-based SQLite with Drizzle ORM and repository pattern
**Rationale**:
- Drizzle provides type-safe queries with minimal overhead
- File-based storage ensures true offline capability
- Repository pattern abstracts database operations for testing
- Supports migrations for schema evolution

**Alternatives considered**:
- IndexedDB directly: More complex, less SQL-like
- LocalStorage: Limited capacity, no complex queries
- Prisma: Heavier, may not support file-based SQLite in browser

**Implementation approach**:
- Use SQL.js for browser-compatible SQLite
- Drizzle schema definitions with TypeScript types
- Repository classes for each entity (Deck, Card, StudySession)
- Migration system for schema updates

### 3. Next.js App Router with Server Actions

**Decision**: App Router with Server Actions for mutations, client components for interactivity
**Rationale**:
- Server Actions provide clean mutation API without separate API routes
- App Router supports code splitting for study page performance
- Static export capability maintains offline deployment options
- Better performance through selective hydration

**Alternatives considered**:
- Pages Router: Less modern, no Server Actions
- Pure client-side: Misses Next.js optimization benefits
- API routes: More boilerplate than Server Actions

**Implementation approach**:
- Server Actions for deck/card CRUD operations
- Client components for study interface and real-time interactions
- Dynamic imports for study page to reduce initial bundle
- Static generation where possible

### 4. Keyboard Shortcuts Implementation

**Decision**: Custom hook with event delegation and context awareness
**Rationale**:
- Provides consistent keyboard experience across app
- Context-aware shortcuts (different keys for different screens)
- Easy to test and maintain
- No external dependencies

**Alternatives considered**:
- External libraries (react-hotkeys): Adds dependency weight
- Direct event listeners: Harder to manage and test
- Browser-native shortcuts: Limited customization

**Implementation approach**:
- `useKeyboard` hook managing global key handlers
- Context-aware shortcut mappings
- Escape key handling for navigation
- Accessibility considerations (skip links, focus management)

### 5. Dark Mode with CSS Variables

**Decision**: CSS custom properties with React context for state management
**Rationale**:
- Instant theme switching without FOUC (Flash of Unstyled Content)
- Maintains theme preference in localStorage
- Works well with Tailwind's dark mode utilities
- Minimal JavaScript overhead

**Alternatives considered**:
- Tailwind's built-in dark mode: Less control over transition
- CSS-in-JS solutions: Adds runtime overhead
- Theme libraries: Unnecessary complexity

**Implementation approach**:
- CSS variables for colors defined in `:root` and `[data-theme="dark"]`
- React context for theme state management
- localStorage persistence
- System preference detection on first load

### 6. Component Architecture and Code Splitting

**Decision**: Feature-based component organization with lazy loading for study interface
**Rationale**:
- Study interface is likely the heaviest component
- Feature-based organization improves maintainability
- Lazy loading keeps initial bundle small
- Clear separation of concerns

**Alternatives considered**:
- Route-based splitting only: Misses heavy components within routes
- No code splitting: May violate performance budget
- Aggressive splitting: Could hurt user experience with loading delays

**Implementation approach**:
- `React.lazy()` for study interface components
- Feature folders: `deck/`, `card/`, `study/`
- Shared UI components in `ui/` folder
- Suspense boundaries with loading states

## Key Technical Specifications

### Database Schema
```sql
-- Decks table
CREATE TABLE decks (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cards table
CREATE TABLE cards (
  id INTEGER PRIMARY KEY,
  deck_id INTEGER NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  easiness_factor REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  next_review_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

-- Study sessions table
CREATE TABLE study_sessions (
  id INTEGER PRIMARY KEY,
  deck_id INTEGER NOT NULL,
  cards_studied INTEGER DEFAULT 0,
  cards_correct INTEGER DEFAULT 0,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);
```

### Performance Budget Breakdown
- Next.js framework: ~45KB gzipped
- React: ~42KB gzipped
- Drizzle ORM: ~15KB gzipped  
- Tailwind (purged): ~10KB gzipped
- Application code: ~40KB gzipped
- **Total**: ~152KB (under 160KB budget)

### Accessibility Strategy
- Semantic HTML structure (`<main>`, `<section>`, `<article>`)
- ARIA labels for interactive elements
- Keyboard navigation with visible focus indicators
- Color contrast ratios tested with automated tools
- Screen reader announcements for study progress
- Skip links for keyboard navigation

## Risk Mitigation

### Browser Compatibility
- Target: Modern browsers with ES2020+ support
- Fallback: Graceful degradation for older browsers
- Testing: Chrome 100+, Firefox 100+, Safari 15+

### Performance Monitoring
- Lighthouse CI integration for automated testing
- Bundle analyzer in development build
- Core Web Vitals monitoring strategy

### Data Loss Prevention
- Automatic backup to file download
- Import/export functionality for data portability
- Error boundaries to prevent complete app crashes

## Next Steps

Phase 0 research complete. Ready to proceed to Phase 1:
1. Generate data-model.md with detailed entity specifications
2. Create API contracts for all user interactions
3. Generate quickstart.md for development setup
4. Update agent context with technology decisions
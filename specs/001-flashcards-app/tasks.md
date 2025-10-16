# Tasks: Offline-First Flashcards Study App

**Input**: Design documents from `/specs/001-flashcards-app/`
**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

**Tests**: Tests are NOT explicitly requested in the feature specification, so no test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**⚠️ TASK SIZE CONSTRAINT**: Per constitution, 90% of tasks MUST complete in under 30 minutes. If a task description suggests >30min work, break it down into smaller, specific sub-tasks.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Next.js structure**: `src/app/`, `src/components/`, `src/lib/`, `src/db/`, `public/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Next.js project with TypeScript, Tailwind CSS, and ESLint using create-next-app
- [x] T002 [P] Install core dependencies: drizzle-orm, sqlite3, sql.js, clsx, tailwind-merge, lucide-react
- [x] T003 [P] Install development dependencies: drizzle-kit, vitest, @testing-library/react, playwright
- [x] T004 [P] Create project directory structure in src/ for app/, components/, lib/, db/, types/
- [x] T005 [P] Configure Tailwind CSS with custom colors and dark mode in tailwind.config.js
- [x] T006 [P] Configure TypeScript paths and Next.js settings in next.config.js
- [x] T007 [P] Setup package.json scripts for development, build, test, and database operations

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create database schema for all entities in src/db/schema.ts
- [x] T009 Configure Drizzle ORM and migrations in drizzle.config.ts
- [x] T010 Implement SQLite connection with SQL.js in src/lib/db/connection.ts
- [x] T011 [P] Create TypeScript type definitions in src/types/index.ts
- [x] T012 [P] Setup CSS variables for theming in src/app/globals.css
- [x] T013 [P] Create base UI components (Button, Input, Card) in src/components/ui/
- [x] T014 Create root layout with theme provider in src/app/layout.tsx
- [x] T015 [P] Implement error handling utilities in src/lib/utils/errors.ts
- [x] T016 [P] Create validation utilities in src/lib/utils/validation.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Manage Study Decks (Priority: P1) 🎯 MVP

**Goal**: Users can create decks with names and descriptions to organize their study materials by topic or subject

**Independent Test**: Can create a deck with a name and description, verify it persists between app sessions, and delivers immediate organizational value

### Implementation for User Story 1

- [x] T017 [P] [US1] Create Deck repository class with CRUD operations in src/lib/db/deck-repository.ts
- [x] T018 [P] [US1] Implement createDeck Server Action in src/app/actions/deck.ts
- [x] T019 [P] [US1] Implement updateDeck Server Action in src/app/actions/deck.ts
- [x] T020 [P] [US1] Implement deleteDeck Server Action in src/app/actions/deck.ts
- [x] T021 [P] [US1] Implement getDeck Server Action in src/app/actions/deck.ts
- [x] T022 [P] [US1] Implement listDecks Server Action in src/app/actions/deck.ts
- [x] T023 [P] [US1] Create DeckCard component for deck display in src/components/deck/deck-card.tsx
- [x] T024 [P] [US1] Create DeckForm component for deck creation/editing in src/components/deck/deck-form.tsx
- [x] T025 [P] [US1] Create DeckList component for displaying all decks in src/components/deck/deck-list.tsx
- [x] T026 [US1] Implement home page with deck list in src/app/page.tsx
- [ ] T027 [US1] Create new deck page in src/app/decks/new/page.tsx
- [ ] T028 [US1] Implement deck detail page structure in src/app/decks/[id]/page.tsx
- [ ] T029 [US1] Add deck deletion with confirmation in deck detail page
- [ ] T030 [US1] Implement deck editing functionality in deck detail page

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Add and Edit Flashcards (Priority: P1)

**Goal**: Users can add flashcards with front and back content to their decks, and edit them as their understanding evolves

**Independent Test**: Can add cards to a deck, edit their content, and verify the changes persist independently

### Implementation for User Story 2

- [ ] T031 [P] [US2] Create Card repository class with CRUD operations in src/lib/db/card-repository.ts
- [ ] T032 [P] [US2] Implement createCard Server Action in src/app/actions/card.ts
- [ ] T033 [P] [US2] Implement updateCard Server Action in src/app/actions/card.ts
- [ ] T034 [P] [US2] Implement deleteCard Server Action in src/app/actions/card.ts
- [ ] T035 [P] [US2] Implement getCard Server Action in src/app/actions/card.ts
- [ ] T036 [P] [US2] Implement bulkCreateCards Server Action in src/app/actions/card.ts
- [ ] T037 [P] [US2] Create CardForm component for card creation/editing in src/components/card/card-form.tsx
- [ ] T038 [P] [US2] Create CardList component for displaying deck cards in src/components/card/card-list.tsx
- [ ] T039 [P] [US2] Create CardItem component for individual card display in src/components/card/card-item.tsx
- [ ] T040 [US2] Integrate card management into deck detail page in src/app/decks/[id]/page.tsx
- [ ] T041 [US2] Add card creation functionality to deck detail page
- [ ] T042 [US2] Implement card editing with inline forms in CardItem component
- [ ] T043 [US2] Add card deletion with confirmation in CardItem component
- [ ] T044 [US2] Display card count and basic statistics in deck components

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Study Deck with Quiz Flow (Priority: P1)

**Goal**: Users can study a deck through a quiz interface that shows the front of a card, lets them flip to see the answer, and mark their confidence level

**Independent Test**: Can start a study session, go through cards, mark difficulty levels, and see progress tracking

### Implementation for User Story 3

- [ ] T045 [P] [US3] Create StudySession repository class in src/lib/db/study-repository.ts
- [ ] T046 [P] [US3] Create SessionCard repository class in src/lib/db/session-card-repository.ts
- [ ] T047 [P] [US3] Implement startStudySession Server Action in src/app/actions/study.ts
- [ ] T048 [P] [US3] Implement reviewCard Server Action in src/app/actions/study.ts
- [ ] T049 [P] [US3] Implement completeStudySession Server Action in src/app/actions/study.ts
- [ ] T050 [P] [US3] Implement abandonStudySession Server Action in src/app/actions/study.ts
- [ ] T051 [P] [US3] Implement getStudyQueue Server Action in src/app/actions/study.ts
- [ ] T052 [P] [US3] Create StudyCard component for card display in study mode in src/components/study/study-card.tsx
- [ ] T053 [P] [US3] Create StudyInterface component for quiz flow in src/components/study/study-interface.tsx
- [ ] T054 [P] [US3] Create StudyProgress component for session tracking in src/components/study/study-progress.tsx
- [ ] T055 [P] [US3] Create StudySummary component for session completion in src/components/study/study-summary.tsx
- [ ] T056 [US3] Create study page with code-splitting in src/app/decks/[id]/study/page.tsx
- [ ] T057 [US3] Implement card flip functionality in StudyCard component
- [ ] T058 [US3] Add Easy/Hard response buttons in StudyInterface component
- [ ] T059 [US3] Implement study session state management in study page
- [ ] T060 [US3] Add study button to deck detail page linking to study interface
- [ ] T061 [US3] Handle empty deck state (no cards to study) in study interface

**Checkpoint**: All core functionality (P1 user stories) should now be independently functional

---

## Phase 6: User Story 4 - Spaced Repetition System (Priority: P2)

**Goal**: Cards marked as "Hard" appear more frequently in future study sessions, while "Easy" cards appear less often

**Independent Test**: Can mark cards with different difficulty levels and verify they appear with appropriate frequency in subsequent study sessions

### Implementation for User Story 4

- [ ] T062 [P] [US4] Implement SM-2 spaced repetition algorithm in src/lib/spaced-repetition/sm2-algorithm.ts
- [ ] T063 [P] [US4] Create spaced repetition utilities in src/lib/spaced-repetition/utils.ts
- [ ] T064 [US4] Integrate spaced repetition calculations into reviewCard Server Action
- [ ] T065 [US4] Update card next_review_date calculation in card repository
- [ ] T066 [US4] Modify getStudyQueue to filter by due date in study repository
- [ ] T067 [US4] Update study interface to show due cards only in review mode
- [ ] T068 [US4] Add different study modes (review, cram, new) to study interface
- [ ] T069 [US4] Display card statistics (interval, easiness factor) in card components
- [ ] T070 [US4] Add deck statistics showing due cards count in deck components

**Checkpoint**: Spaced repetition system should enhance the study experience

---

## Phase 7: User Story 5 - Search and Filter (Priority: P2)

**Goal**: Users can search through their decks and cards by text content to quickly find specific information

**Independent Test**: Can create multiple decks and cards, then search for specific terms and verify relevant results appear

### Implementation for User Story 5

- [ ] T071 [P] [US5] Implement search functionality in deck repository in src/lib/db/deck-repository.ts
- [ ] T072 [P] [US5] Implement search functionality in card repository in src/lib/db/card-repository.ts
- [ ] T073 [P] [US5] Implement searchContent Server Action in src/app/actions/search.ts
- [ ] T074 [P] [US5] Create SearchBar component in src/components/ui/search-bar.tsx
- [ ] T075 [P] [US5] Create SearchResults component in src/components/search/search-results.tsx
- [ ] T076 [US5] Integrate search functionality into home page
- [ ] T077 [US5] Add search within deck detail page for cards
- [ ] T078 [US5] Implement search result highlighting in components
- [ ] T079 [US5] Add search filters (decks only, cards only) to search interface
- [ ] T080 [US5] Handle empty search results with helpful messaging

**Checkpoint**: Search and filtering should improve content discovery

---

## Phase 8: User Story 6 - Keyboard Navigation and Shortcuts (Priority: P3)

**Goal**: Users can use keyboard shortcuts for navigation and study actions to enable faster study sessions

**Independent Test**: Can use only keyboard controls to navigate through study sessions and verify all actions work correctly

### Implementation for User Story 6

- [ ] T081 [P] [US6] Create keyboard shortcuts hook in src/lib/keyboard/use-keyboard.ts
- [ ] T082 [P] [US6] Define keyboard shortcut mappings in src/lib/keyboard/shortcuts.ts
- [ ] T083 [P] [US6] Create keyboard context provider in src/lib/keyboard/keyboard-context.tsx
- [ ] T084 [US6] Integrate keyboard shortcuts into study interface components
- [ ] T085 [US6] Add keyboard shortcuts for deck navigation (J/K for up/down)
- [ ] T086 [US6] Implement Space key for card flip and advance in study mode
- [ ] T087 [US6] Add Escape key handling for navigation back/cancel actions
- [ ] T088 [US6] Add keyboard shortcuts help overlay component
- [ ] T089 [US6] Ensure keyboard shortcuts work with screen readers
- [ ] T090 [US6] Add visual focus indicators for keyboard navigation

**Checkpoint**: Keyboard navigation should provide efficient interaction

---

## Phase 9: User Story 7 - Responsive Design and Dark Mode (Priority: P3)

**Goal**: Users can use the app comfortably on both desktop and mobile devices, and switch to dark mode for studying in low-light conditions

**Independent Test**: Can access the app on different screen sizes and toggle dark mode to verify layout and readability

### Implementation for User Story 7

- [ ] T091 [P] [US7] Create dark mode context and provider in src/lib/theme/theme-context.tsx
- [ ] T092 [P] [US7] Implement theme toggle component in src/components/ui/theme-toggle.tsx
- [ ] T093 [P] [US7] Add dark mode CSS variables to globals.css
- [ ] T094 [P] [US7] Update all components with dark mode styling
- [ ] T095 [US7] Integrate theme toggle into root layout header
- [ ] T096 [US7] Implement responsive layouts for mobile devices
- [ ] T097 [US7] Add touch gestures for study interface on mobile
- [ ] T098 [US7] Optimize component spacing for different screen sizes
- [ ] T099 [US7] Test and adjust color contrast ratios for accessibility
- [ ] T100 [US7] Add system theme preference detection on first load

**Checkpoint**: App should work seamlessly across devices and lighting conditions

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T101 [P] Add error boundaries for graceful error handling in src/components/error-boundary.tsx
- [ ] T102 [P] Implement loading states and skeletons across all components
- [ ] T103 [P] Add data export functionality with JSON/CSV formats
- [ ] T104 [P] Implement data import functionality for backup restoration
- [ ] T105 [P] Create global statistics dashboard for study insights
- [ ] T106 [P] Add app icons and favicon in public/icons/
- [ ] T107 [P] Optimize bundle size with code splitting for study components
- [ ] T108 [P] Add proper meta tags and SEO optimization
- [ ] T109 Performance optimization: lazy loading and memoization
- [ ] T110 Accessibility audit and WCAG AA compliance verification
- [ ] T111 Cross-browser testing and compatibility fixes
- [ ] T112 Run quickstart.md validation and documentation updates

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but independently testable
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 & US2 for deck/card data
- **User Story 4 (P2)**: Depends on User Story 3 completion - Enhances study functionality
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Independently testable search feature
- **User Story 6 (P3)**: Depends on User Stories 1-3 - Enhances navigation across existing functionality
- **User Story 7 (P3)**: Can start after Foundational (Phase 2) - Independently testable UI enhancements

### Within Each User Story

- Repository classes before server actions
- Server actions before components
- Base components before page integration
- Core functionality before enhancement features

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Stories 1, 2, 5, 7 can start in parallel
- User Story 3 can start after US1 & US2 basic structure is complete
- All tasks within a user story marked [P] can run in parallel
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all repository and server actions for User Story 1 together:
Task: "Create Deck repository class with CRUD operations in src/lib/db/deck-repository.ts"
Task: "Implement createDeck Server Action in src/app/actions/deck.ts"
Task: "Implement updateDeck Server Action in src/app/actions/deck.ts"
Task: "Implement deleteDeck Server Action in src/app/actions/deck.ts"

# Launch all components for User Story 1 together:
Task: "Create DeckCard component for deck display in src/components/deck/deck-card.tsx"
Task: "Create DeckForm component for deck creation/editing in src/components/deck/deck-form.tsx"
Task: "Create DeckList component for displaying all decks in src/components/deck/deck-list.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Deck Management)
4. Complete Phase 4: User Story 2 (Card Management)
5. Complete Phase 5: User Story 3 (Study Interface)
6. **STOP and VALIDATE**: Test complete study workflow independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic deck management)
3. Add User Story 2 → Test independently → Deploy/Demo (Card management)
4. Add User Story 3 → Test independently → Deploy/Demo (MVP complete!)
5. Add User Story 4 → Test independently → Deploy/Demo (Smart studying)
6. Add User Story 5 → Test independently → Deploy/Demo (Search feature)
7. Add User Story 6 → Test independently → Deploy/Demo (Keyboard shortcuts)
8. Add User Story 7 → Test independently → Deploy/Demo (Full UI polish)
9. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Deck Management)
   - Developer B: User Story 2 (Card Management)
   - Developer C: User Story 5 (Search) or User Story 7 (UI Polish)
3. After US1 & US2 complete:
   - Continue with User Story 3 (Study Interface)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- User Stories 1-3 form the complete MVP
- User Stories 4-7 are enhancements that add significant value
- Focus on vertical slices: complete one story before moving to next
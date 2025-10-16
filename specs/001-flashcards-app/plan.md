# Implementation Plan: Offline-First Flashcards Study App

**Branch**: `001-flashcards-app` | **Date**: October 15, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-flashcards-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an offline-first flashcards study application enabling users to create decks, add cards, and study through spaced repetition. Core functionality includes deck management, card creation/editing, quiz-style study interface, and keyboard shortcuts. Technical approach uses Next.js + React + TypeScript with SQLite/Drizzle for local storage, emphasizing performance and accessibility while maintaining complete offline capability.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

## Technical Context

**Language/Version**: TypeScript 5+ with React 18+ and Next.js 14+ using App Router
**Primary Dependencies**: React, Next.js, Drizzle ORM, Tailwind CSS, SQLite3
**Storage**: SQLite local file database with Drizzle ORM repository abstraction
**Testing**: Vitest (unit tests for business logic), Playwright (smoke tests for critical user journeys)
**Target Platform**: Web (modern browsers), static export capability for local deployment
**Project Type**: Single-page application with Next.js App Router and Server Actions for mutations
**Performance Goals**: First Load JS <160KB (code-split study page), FCP <1.5s on 3G, Core Web Vitals "Good"
**Constraints**: WCAG AA compliance, offline-first (no external services), keyboard shortcuts utility, dark mode via CSS variables
**Scale/Scope**: Support for hundreds of decks with thousands of cards per deck, single concurrent study session, local-only spaced repetition algorithm

**Architecture Decisions**:
- **Database**: SQLite file with Drizzle ORM for type-safe queries and migrations
- **State Management**: React useState/useReducer with local persistence, no external state libraries
- **UI Components**: Custom Tailwind components with dark mode CSS variables
- **Code Splitting**: Dynamic imports for study interface to minimize initial bundle
- **Keyboard Handling**: Custom keyboard shortcuts utility for study navigation
- **Spaced Repetition**: Local algorithm implementation with no external dependencies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Initial Check (Pre-Phase 0)**: ✅ PASSED
- [x] **Vertical Slicing**: All planned features can be implemented in <30 minute vertical slices (deck creation, card addition, basic study flow, etc.)
- [x] **Technology Stack**: Uses React + Next.js + TypeScript + SQLite/Drizzle only - no external dependencies
- [x] **Test Strategy**: Unit tests planned for spaced repetition logic, data models, utilities; Playwright for deck creation and study flows
- [x] **Performance Budget**: Code-split study page, minimal dependencies, Tailwind purging projected to keep bundle <160KB
- [x] **Accessibility**: WCAG AA compliance via semantic HTML, keyboard navigation, proper ARIA labels, color contrast ≥4.5:1
- [x] **Offline-First**: SQLite local database, no external APIs, local fonts, bundled assets only

**Post-Phase 1 Design Check**: ✅ PASSED
- [x] **Vertical Slicing**: Data model and API contracts support <30min implementation slices
- [x] **Technology Stack**: All contracts use only approved technologies (Next.js Server Actions, Drizzle ORM, SQLite)
- [x] **Test Strategy**: Clear separation of business logic enables targeted unit testing, API contracts support E2E testing
- [x] **Performance Budget**: Code-split study interface and repository pattern minimize bundle size
- [x] **Accessibility**: API contracts include ARIA-friendly data structures and keyboard interaction patterns
- [x] **Offline-First**: All operations work with local SQLite database, no network dependencies in any contract

**Final Compliance Status**: ✅ PASSED - No constitutional violations identified in design phase

## Project Structure

### Documentation (this feature)

```
specs/001-flashcards-app/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
# Next.js Web Application Structure
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── layout.tsx         # Root layout with dark mode provider
│   ├── page.tsx           # Home page (deck list)
│   ├── decks/
│   │   ├── [id]/
│   │   │   ├── page.tsx   # Deck detail page
│   │   │   └── study/
│   │   │       └── page.tsx # Study interface (code-split)
│   │   └── new/
│   │       └── page.tsx   # Create new deck
│   └── globals.css        # Tailwind + CSS variables for dark mode
├── components/             # Reusable React components
│   ├── ui/                # Base UI components (buttons, inputs, cards)
│   ├── deck/              # Deck-specific components
│   ├── card/              # Card management components
│   └── study/             # Study interface components
├── lib/                   # Core business logic and utilities
│   ├── db/                # Database utilities and repository pattern
│   ├── spaced-repetition/ # Algorithm implementation
│   ├── keyboard/          # Keyboard shortcuts utility
│   └── utils/             # General utilities
├── db/                    # Database schema and Drizzle configuration
│   ├── schema.ts          # SQLite table definitions
│   ├── migrations/        # Database migration files
│   └── drizzle.config.ts  # Drizzle ORM configuration
└── types/                 # TypeScript type definitions
    ├── deck.ts
    ├── card.ts
    └── study.ts

tests/
├── unit/                  # Vitest unit tests for core logic
│   ├── spaced-repetition/ # Algorithm tests
│   ├── utils/             # Utility function tests
│   └── lib/               # Business logic tests
└── e2e/                   # Playwright end-to-end tests
    ├── deck-management.spec.ts
    ├── study-flow.spec.ts
    └── keyboard-navigation.spec.ts

public/                    # Static assets (offline-compatible)
├── icons/                 # App icons and UI icons
└── fonts/                 # Local fonts only (no CDN dependencies)
```

**Structure Decision**: Next.js App Router with feature-based component organization, repository pattern for data access, and clear separation of business logic for testability.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


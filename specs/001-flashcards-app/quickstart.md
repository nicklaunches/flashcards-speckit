# Development Quickstart: Offline-First Flashcards Study App

**Feature**: 001-flashcards-app  
**Last Updated**: October 15, 2025  
**Prerequisites**: Node.js 18+, npm/yarn/pnpm

## Project Setup

### 1. Initialize Next.js Project
```bash
# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest flashcards-app --typescript --tailwind --eslint --app

cd flashcards-app
```

### 2. Install Core Dependencies
```bash
# Database & ORM
npm install drizzle-orm sqlite3 sql.js
npm install -D drizzle-kit

# Additional utilities
npm install clsx tailwind-merge lucide-react
npm install @types/sql.js
```

### 3. Install Development Dependencies
```bash
# Testing
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test

# Development tools
npm install -D @types/node eslint-config-prettier prettier
```

## Project Structure Setup

### 4. Create Directory Structure
```bash
mkdir -p src/{app,components,lib,db,types}
mkdir -p src/components/{ui,deck,card,study}
mkdir -p src/lib/{db,spaced-repetition,keyboard,utils}
mkdir -p tests/{unit,e2e}
mkdir -p public/{icons,fonts}
```

### 5. Database Configuration

**File**: `src/db/schema.ts`
```typescript
import { sqliteTable, integer, text, real, datetime } from 'drizzle-orm/sqlite-core';

export const decks = sqliteTable('decks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
});

export const cards = sqliteTable('cards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  deck_id: integer('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  front: text('front').notNull(),
  back: text('back').notNull(),
  easiness_factor: real('easiness_factor').notNull().default(2.5),
  interval_days: integer('interval_days').notNull().default(1),
  next_review_date: datetime('next_review_date'),
  repetition_count: integer('repetition_count').notNull().default(0),
  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
});

export const study_sessions = sqliteTable('study_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  deck_id: integer('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  cards_studied: integer('cards_studied').notNull().default(0),
  cards_correct: integer('cards_correct').notNull().default(0),
  started_at: datetime('started_at').notNull().default(new Date()),
  completed_at: datetime('completed_at'),
  session_type: text('session_type').notNull().default('review'),
});

export const session_cards = sqliteTable('session_cards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  session_id: integer('session_id').notNull().references(() => study_sessions.id, { onDelete: 'cascade' }),
  card_id: integer('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  response: text('response').notNull(), // 'easy' | 'hard'
  response_time_ms: integer('response_time_ms'),
  reviewed_at: datetime('reviewed_at').notNull().default(new Date()),
});
```

**File**: `drizzle.config.ts`
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  driver: 'sqlite',
  dbCredentials: {
    url: './flashcards.db',
  },
} satisfies Config;
```

### 6. Database Connection

**File**: `src/lib/db/connection.ts`
```typescript
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { migrate } from 'drizzle-orm/sqlite-proxy/migrator';
import initSqlJs from 'sql.js';
import * as schema from '@/db/schema';

let db: ReturnType<typeof drizzle> | null = null;

export async function getDatabase() {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file) => `/sql-wasm.wasm`
  });

  // Load existing database or create new
  const data = localStorage.getItem('flashcards-db');
  const sqliteDb = new SQL.Database(data ? new Uint8Array(JSON.parse(data)) : undefined);

  db = drizzle(sqliteDb, { schema });

  // Run migrations
  await migrate(db, { migrationsFolder: './src/db/migrations' });

  // Save database changes to localStorage
  setInterval(() => {
    const data = sqliteDb.export();
    localStorage.setItem('flashcards-db', JSON.stringify(Array.from(data)));
  }, 5000);

  return db;
}
```

### 7. TypeScript Configuration

**File**: `src/types/index.ts`
```typescript
// Re-export schema types
export type Deck = typeof schema.decks.$inferSelect;
export type NewDeck = typeof schema.decks.$inferInsert;
export type Card = typeof schema.cards.$inferSelect;
export type NewCard = typeof schema.cards.$inferInsert;
export type StudySession = typeof schema.study_sessions.$inferSelect;
export type NewStudySession = typeof schema.study_sessions.$inferInsert;

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Study types
export interface StudyCard {
  id: number;
  front: string;
  back: string;
}

export interface StudySessionState {
  id: number;
  cards: StudyCard[];
  currentCardIndex: number;
  isComplete: boolean;
}
```

## Configuration Files

### 8. Tailwind Configuration

**File**: `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        muted: 'var(--muted)',
      },
    },
  },
  plugins: [],
}
```

### 9. Testing Configuration

**File**: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**File**: `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 10. Package.json Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "db:generate": "drizzle-kit generate:sqlite",
    "db:migrate": "drizzle-kit push:sqlite",
    "type-check": "tsc --noEmit"
  }
}
```

## Development Workflow

### 11. First Implementation Steps

1. **Setup Database**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

2. **Create Basic Layout**:
   - `src/app/layout.tsx` - Root layout with dark mode provider
   - `src/app/page.tsx` - Home page with deck list
   - `src/app/globals.css` - CSS variables for theming

3. **Implement Core Components**:
   - `src/components/ui/` - Basic UI components (Button, Input, Card)
   - `src/components/deck/` - Deck list and creation components
   - `src/lib/db/` - Repository pattern for data access

4. **Add Server Actions**:
   - Create deck management actions in `src/app/actions/deck.ts`
   - Implement card management actions in `src/app/actions/card.ts`

### 12. Development Priorities

**Phase 1 - Core CRUD (Vertical Slices)**:
1. Create deck with name (30min slice)
2. Add card to deck (30min slice)
3. Edit deck/card content (30min slice)
4. Delete deck/card (30min slice)

**Phase 2 - Study Interface**:
1. Basic study page layout (30min slice)
2. Card flip interaction (30min slice)
3. Easy/Hard rating (30min slice)
4. Session completion (30min slice)

**Phase 3 - Spaced Repetition**:
1. SM-2 algorithm implementation (30min slice)
2. Due date calculation (30min slice)
3. Review queue filtering (30min slice)

## Quality Assurance

### 13. Testing Strategy

**Unit Tests** (src/tests/unit/):
- Spaced repetition algorithm logic
- Data validation functions
- Utility functions

**E2E Tests** (src/tests/e2e/):
- Deck creation flow
- Card management flow
- Study session completion
- Keyboard navigation

### 14. Performance Monitoring

- Bundle size tracking with `@next/bundle-analyzer`
- Core Web Vitals monitoring in development
- Lighthouse CI integration for automated testing

### 15. Accessibility Checklist

- [ ] Semantic HTML structure
- [ ] Keyboard navigation support
- [ ] ARIA labels for interactive elements
- [ ] Color contrast verification
- [ ] Screen reader testing
- [ ] Focus management

## Deployment

### 16. Static Export Setup

Add to `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig;
```

### 17. Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Static export
npm run build && npm run export

# Type checking
npm run type-check

# Run all tests
npm run test && npm run test:e2e
```

This quickstart provides everything needed to begin implementing the flashcards application following the constitutional requirements and technical specifications.
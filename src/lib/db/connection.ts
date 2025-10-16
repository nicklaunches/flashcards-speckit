import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";
import * as schema from "@/db/schema";
import { sql } from "drizzle-orm";

let db: ReturnType<typeof drizzle> | null = null;
let sqlJs: any = null;

export async function getDatabase() {
  if (db) {
    return db;
  }

  try {
    // Initialize SQL.js
    if (!sqlJs) {
      sqlJs = await initSqlJs({
        // Use CDN for SQL.js wasm file in production, local in development
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });
    }

    // Create or open database
    let database;
    const existingData = localStorage.getItem("flashcards-db");
    
    if (existingData) {
      // Load existing database from localStorage
      const buf = new Uint8Array(JSON.parse(existingData));
      database = new sqlJs.Database(buf);
    } else {
      // Create new database
      database = new sqlJs.Database();
    }

    // Initialize Drizzle
    db = drizzle(database, { schema });

    // Run migrations if needed
    await runMigrations(db);

    // Setup auto-save to localStorage
    setupAutoSave(database);

    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw new Error("Database initialization failed");
  }
}

async function runMigrations(database: ReturnType<typeof drizzle>) {
  try {
    // For now, we'll create tables manually since we don't have migration files yet
    // This will be replaced with proper migrations later
    await database.run(sql`
      CREATE TABLE IF NOT EXISTS decks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await database.run(sql`
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deck_id INTEGER NOT NULL,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        easiness_factor REAL NOT NULL DEFAULT 2.5,
        interval_days INTEGER NOT NULL DEFAULT 1,
        next_review_date TEXT,
        repetition_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
      )
    `);

    await database.run(sql`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deck_id INTEGER NOT NULL,
        cards_studied INTEGER NOT NULL DEFAULT 0,
        cards_correct INTEGER NOT NULL DEFAULT 0,
        started_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,
        session_type TEXT NOT NULL DEFAULT 'review',
        FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
      )
    `);

    await database.run(sql`
      CREATE TABLE IF NOT EXISTS session_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        card_id INTEGER NOT NULL,
        response TEXT NOT NULL,
        response_time_ms INTEGER,
        reviewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES study_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      )
    `);

    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

function setupAutoSave(database: any) {
  // Save to localStorage every 5 seconds
  setInterval(() => {
    try {
      const data = database.export();
      localStorage.setItem("flashcards-db", JSON.stringify(Array.from(data)));
    } catch (error) {
      console.error("Failed to save database:", error);
    }
  }, 5000);

  // Also save on page unload
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      try {
        const data = database.export();
        localStorage.setItem("flashcards-db", JSON.stringify(Array.from(data)));
      } catch (error) {
        console.error("Failed to save database on unload:", error);
      }
    });
  }
}

// Utility function to manually save database
export async function saveDatabase() {
  if (!db) return;
  
  try {
    const database = (db as any)._.database;
    const data = database.export();
    localStorage.setItem("flashcards-db", JSON.stringify(Array.from(data)));
  } catch (error) {
    console.error("Failed to manually save database:", error);
    throw error;
  }
}
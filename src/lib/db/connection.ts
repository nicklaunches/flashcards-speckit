import { sql } from "drizzle-orm";
import * as schema from "@/db/schema";

let db: any | null = null;
let sqlJs: any = null;
let initPromise: Promise<any> | null = null;
let initializationPromise: Promise<any> | null = null;

// Add retry mechanism for SQL.js initialization
async function initSQL(): Promise<any> {
  // This function should only be called from the browser
  if (typeof window === "undefined") {
    throw new Error("SQL.js can only be initialized in the browser. Ensure database operations are only called from client components.");
  }

  // Prevent multiple concurrent initializations
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    let SQL: any = null;

    // Method 1: Try local files with dynamic import (most reliable in Next.js)
    try {
      console.log("Attempting to load SQL.js from local files...");

      // Dynamically import the SQL.js module
      const sqlModule = await import('sql.js');
      SQL = await sqlModule.default({
        locateFile: (file: string) => `/sql-wasm.wasm`
      });

      console.log("SQL.js loaded successfully from local files");
      return SQL;
    } catch (error) {
      console.warn("Failed to load SQL.js from local files:", error);
    }

    // Method 3: Try CDN with retry mechanism
    const cdnUrls = [
      "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js",
      "https://unpkg.com/sql.js@1.10.3/dist/sql-wasm.js",
      "https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.js"
    ];

    for (let attempt = 0; attempt < 3; attempt++) {
      for (const url of cdnUrls) {
        try {
          console.log(`Attempting to load SQL.js from CDN (attempt ${attempt + 1}): ${url}`);

          SQL = await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = url;
            script.onload = async () => {
              try {
                const initSqlJs = (window as any).initSqlJs;
                if (!initSqlJs) {
                  throw new Error("initSqlJs not found on window object");
                }

                const sqlInstance = await initSqlJs({
                  locateFile: (file: string) =>
                    url.replace("sql-wasm.js", file)
                });
                resolve(sqlInstance);
              } catch (err) {
                reject(err);
              }
            };
            script.onerror = () => reject(new Error(`Failed to load script from ${url}`));
            document.head.appendChild(script);

            // Timeout after 10 seconds
            setTimeout(() => {
              reject(new Error(`Timeout loading from ${url}`));
            }, 10000);
          });

          console.log("SQL.js loaded successfully from CDN");
          return SQL;
        } catch (error) {
          console.warn(`Failed to load SQL.js from ${url}:`, error);

          // Wait before trying next URL
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    }

    throw new Error("Failed to load SQL.js from all sources after multiple attempts");
  })();

  return initializationPromise;
}

export async function getDatabase() {
  if (db) {
    return db;
  }

  // Prevent multiple concurrent initializations
  if (initPromise) {
    await initPromise;
    if (db) return db;
  }

  initPromise = (async () => {
    try {
      // Initialize SQL.js with retry mechanism
      if (!sqlJs) {
        sqlJs = await initSQL();
      }

      // Create or open database
      let database;
      const existingData = localStorage.getItem("flashcards-db");

      if (existingData) {
        try {
          // Load existing database from localStorage
          console.log("Loading existing database from localStorage");
          const buf = new Uint8Array(JSON.parse(existingData));
          database = new sqlJs.Database(buf);
          console.log("Existing database loaded successfully");
        } catch (error) {
          console.warn("Failed to load existing database, creating new one:", error);
          database = new sqlJs.Database();
        }
      } else {
        // Create new database
        console.log("Creating new database");
        database = new sqlJs.Database();
      }

      // Initialize Drizzle - dynamically import to avoid SSR issues
      console.log("Initializing Drizzle ORM");
      const { drizzle } = await import("drizzle-orm/sql-js");
      db = drizzle(database, { schema });

      // Run migrations if needed
      console.log("Running database migrations");
      await runMigrations(db);

      // Setup auto-save to localStorage
      console.log("Setting up auto-save");
      setupAutoSave(database);

      console.log("Database initialization completed successfully");
      return db;
    } catch (error) {
      console.error("Failed to initialize database:", error);

      // Reset everything and clear corrupted data
      db = null;
      sqlJs = null;
      initPromise = null;

      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("flashcards-db");
          console.log("Cleared corrupted database from localStorage");
        } catch (e) {
          console.warn("Failed to clear localStorage:", e);
        }
      }

      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  })();

  await initPromise;
  return db!;
}

async function runMigrations(database: any) {
  try {
    console.log("Starting database migrations...");

    // For now, we'll create tables manually since we don't have migration files yet
    // This will be replaced with proper migrations later

    console.log("Creating decks table...");
    await database.run(sql`
      CREATE TABLE IF NOT EXISTS decks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Creating cards table...");
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

    console.log("Creating study_sessions table...");
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

    console.log("Creating session_cards table...");
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
    throw new Error(`Database migration failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function setupAutoSave(database: any) {
  let saveInterval: NodeJS.Timeout | null = null;

  const saveToStorage = () => {
    try {
      const data = database.export();
      localStorage.setItem("flashcards-db", JSON.stringify(Array.from(data)));
      console.log("Database saved to localStorage");
    } catch (error) {
      console.error("Failed to save database:", error);
    }
  };

  // Save to localStorage every 10 seconds (increased from 5 to reduce load)
  if (typeof window !== "undefined") {
    saveInterval = setInterval(saveToStorage, 10000);
  }

  // Also save on page unload
  if (typeof window !== "undefined") {
    const handleBeforeUnload = () => {
      if (saveInterval) {
        clearInterval(saveInterval);
      }
      saveToStorage();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    // Cleanup function
    return () => {
      if (saveInterval) {
        clearInterval(saveInterval);
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
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
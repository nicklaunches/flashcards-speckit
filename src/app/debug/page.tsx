"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    const testDatabaseInit = async () => {
      try {
        addLog("Starting database initialization test...");
        
        // Test 1: Check if we're in browser
        if (typeof window === "undefined") {
          throw new Error("Not in browser environment");
        }
        addLog("✓ Browser environment confirmed");

        // Test 2: Check localStorage
        try {
          localStorage.setItem("test", "test");
          localStorage.removeItem("test");
          addLog("✓ localStorage is available");
        } catch (error) {
          addLog(`✗ localStorage test failed: ${error}`);
        }

        // Test 3: Check if SQL.js files are accessible
        try {
          const response = await fetch("/sql-wasm.wasm");
          if (response.ok) {
            addLog("✓ Local WASM file is accessible");
          } else {
            addLog(`✗ Local WASM file not accessible: ${response.status}`);
          }
        } catch (error) {
          addLog(`✗ Failed to check local WASM file: ${error}`);
        }

        // Test 4: Try to import sql.js directly
        try {
          addLog("Testing direct SQL.js import...");
          const initSqlJs = (await import("sql.js")).default;
          addLog("✓ SQL.js import successful");
          
          const SQL = await initSqlJs({
            locateFile: (file: string) => {
              addLog(`Locating file: ${file} -> /sql-wasm.wasm`);
              return "/sql-wasm.wasm";
            }
          });
          addLog("✓ SQL.js initialization successful");
          
          // Test 5: Create a test database
          const db = new SQL.Database();
          addLog("✓ Test database created");
          
          // Test 6: Run a simple query
          db.run("CREATE TABLE test (id INTEGER, name TEXT)");
          db.run("INSERT INTO test VALUES (1, 'test')");
          const result = db.exec("SELECT * FROM test");
          addLog(`✓ Test query successful: ${JSON.stringify(result)}`);
          
          setStatus("success");
          addLog("🎉 All tests passed! Database initialization should work.");
          
        } catch (error) {
          addLog(`✗ SQL.js test failed: ${error}`);
          setStatus("error");
        }

        // Test 7: Try actual app database initialization
        try {
          addLog("Testing app database initialization...");
          const { getDatabase } = await import("@/lib/db/connection");
          const db = await getDatabase();
          addLog("✓ App database initialization successful");
          setStatus("success");
        } catch (error) {
          addLog(`✗ App database initialization failed: ${error}`);
          setStatus("error");
        }

      } catch (error) {
        addLog(`✗ Critical error: ${error}`);
        setStatus("error");
      }
    };

    testDatabaseInit();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Database Debug Page</h1>
      
      <div className="mb-4">
        <div className={`inline-block px-3 py-1 rounded text-sm ${
          status === "loading" ? "bg-blue-100 text-blue-800" :
          status === "success" ? "bg-green-100 text-green-800" :
          "bg-red-100 text-red-800"
        }`}>
          Status: {status}
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
        <h2 className="font-semibold mb-2">Debug Logs:</h2>
        <div className="space-y-1 font-mono text-sm">
          {logs.map((log, index) => (
            <div 
              key={index} 
              className={`${
                log.includes("✓") ? "text-green-700" :
                log.includes("✗") ? "text-red-700" :
                log.includes("🎉") ? "text-green-700 font-bold" :
                "text-gray-700"
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>This page tests the database initialization process step by step.</p>
        <p>Check the browser console for additional details.</p>
      </div>
    </div>
  );
}
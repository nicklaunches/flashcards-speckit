export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, field ? `INVALID_${field.toUpperCase()}` : "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message, `${resource.toUpperCase()}_NOT_FOUND`, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: string = "CONFLICT") {
    super(message, code, 409);
    this.name = "ConflictError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, "DATABASE_ERROR", 500);
    this.name = "DatabaseError";
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

// Error handling utilities
export function handleApiError(error: unknown): { success: false; error: string } {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: "An unexpected error occurred",
  };
}

// Async error wrapper for server actions
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | { success: false; error: string }> => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Client-side error boundary hook
export function useErrorHandler() {
  const handleError = (error: unknown, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ""}:`, error);
    
    if (error instanceof AppError) {
      // Could integrate with toast notifications here
      alert(error.message);
    } else if (error instanceof Error) {
      alert(`An error occurred: ${error.message}`);
    } else {
      alert("An unexpected error occurred");
    }
  };

  return { handleError };
}
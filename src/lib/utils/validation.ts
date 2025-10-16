import { ValidationError } from "./errors";

// Basic validation utilities
export function validateRequired(value: unknown, fieldName: string): void {
  if (value === null || value === undefined || value === "") {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
}

export function validateString(value: unknown, fieldName: string, minLength = 0, maxLength = Infinity): string {
  validateRequired(value, fieldName);

  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters long`,
      fieldName
    );
  }

  if (trimmed.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be no more than ${maxLength} characters long`,
      fieldName
    );
  }

  return trimmed;
}

export function validateNumber(value: unknown, fieldName: string, min = -Infinity, max = Infinity): number {
  validateRequired(value, fieldName);

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (typeof num !== "number" || isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a valid number`, fieldName);
  }

  if (num < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName);
  }

  if (num > max) {
    throw new ValidationError(`${fieldName} must be no more than ${max}`, fieldName);
  }

  return num;
}

export function validateInteger(value: unknown, fieldName: string, min = -Infinity, max = Infinity): number {
  const num = validateNumber(value, fieldName, min, max);

  if (!Number.isInteger(num)) {
    throw new ValidationError(`${fieldName} must be an integer`, fieldName);
  }

  return num;
}

export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== "boolean") {
    throw new ValidationError(`${fieldName} must be a boolean`, fieldName);
  }
  return value;
}

export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[]
): T {
  validateRequired(value, fieldName);

  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }

  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(", ")}`,
      fieldName
    );
  }

  return value as T;
}

// Deck validation
export function validateDeckName(name: unknown): string {
  return validateString(name, "name", 1, 100);
}

export function validateDeckDescription(description: unknown): string {
  // Description is optional - return empty string if not provided
  if (description === null || description === undefined || description === "") {
    return "";
  }

  if (typeof description !== "string") {
    throw new ValidationError("description must be a string", "description");
  }

  const trimmed = description.trim();

  if (trimmed.length > 500) {
    throw new ValidationError(
      "description must be no more than 500 characters long",
      "description"
    );
  }

  return trimmed;
}

// Card validation
export function validateCardFront(front: unknown): string {
  return validateString(front, "front", 1, 1000);
}

export function validateCardBack(back: unknown): string {
  return validateString(back, "back", 1, 1000);
}

export function validateEasinessFactor(factor: unknown): number {
  return validateNumber(factor, "easinessFactor", 1.3, 2.5);
}

export function validateIntervalDays(interval: unknown): number {
  return validateInteger(interval, "intervalDays", 1);
}

// Study session validation
export function validateSessionType(type: unknown): "review" | "cram" | "new" {
  return validateEnum(type, "sessionType", ["review", "cram", "new"] as const);
}

export function validateResponse(response: unknown): "easy" | "hard" {
  return validateEnum(response, "response", ["easy", "hard"] as const);
}

export function validateResponseTime(time: unknown): number | null {
  if (time === null || time === undefined) {
    return null;
  }
  return validateInteger(time, "responseTimeMs", 0);
}

// ID validation
export function validateId(id: unknown, fieldName = "id"): number {
  return validateInteger(id, fieldName, 1);
}

// Confirmation validation
export function validateConfirmation(confirm: unknown): boolean {
  const confirmed = validateBoolean(confirm, "confirmDelete");
  if (!confirmed) {
    throw new ValidationError("Confirmation is required for this action", "confirmDelete");
  }
  return confirmed;
}
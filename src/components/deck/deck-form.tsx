"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeckWithStats, CreateDeckInput, UpdateDeckInput } from "@/types";

interface DeckFormProps {
  deck?: DeckWithStats;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeckForm({ deck, onSubmit, onCancel, isLoading = false }: DeckFormProps) {
  const [name, setName] = useState(deck?.name || "");
  const [description, setDescription] = useState(deck?.description || "");
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const isEditing = !!deck;
  const title = isEditing ? "Edit Deck" : "Create New Deck";

  const validateForm = (): boolean => {
    const newErrors: { name?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length > 100) {
      newErrors.name = "Name must be 100 characters or less";
    }

    if (description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        await onSubmit({
          id: deck.id,
          name: name.trim(),
          description: description.trim(),
        });
      } else {
        await onSubmit({
          name: name.trim(),
          description: description.trim(),
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name *
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter deck name"
              disabled={isLoading}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter deck description (optional)"
              disabled={isLoading}
              className={errors.description ? "border-destructive" : ""}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="flex-1"
          >
            {isLoading ? "Saving..." : (isEditing ? "Update" : "Create")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
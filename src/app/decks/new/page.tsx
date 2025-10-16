"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeckForm } from "@/components/deck/deck-form";
import { createDeck } from "@/app/actions/deck";
import { useErrorHandler } from "@/lib/utils/errors";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { CreateDeckInput } from "@/types";

export default function NewDeckPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { handleError } = useErrorHandler();
  const router = useRouter();

  const handleCreateDeck = async (data: CreateDeckInput) => {
    try {
      setIsLoading(true);
      const result = await createDeck(data);
      if (result.success && result.data) {
        router.push(`/decks/${result.data.id}` as any);
      } else {
        handleError(new Error(result.error || "Failed to create deck"));
      }
    } catch (error) {
      handleError(error, "creating deck");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Decks
        </Button>
        <h1 className="text-2xl font-bold">Create New Deck</h1>
        <p className="text-muted-foreground">
          Create a new deck to organize your flashcards by topic or subject.
        </p>
      </div>

      <DeckForm
        onSubmit={handleCreateDeck}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}
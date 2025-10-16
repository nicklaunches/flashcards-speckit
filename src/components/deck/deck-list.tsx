"use client";

import { DeckCard } from "./deck-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { DeckWithStats } from "@/types";

interface DeckListProps {
  decks: DeckWithStats[];
  onCreateNew: () => void;
  onEditDeck: (deck: DeckWithStats) => void;
  onDeleteDeck: (deck: DeckWithStats) => void;
  onStudyDeck: (deck: DeckWithStats) => void;
  isLoading?: boolean;
}

export function DeckList({ 
  decks, 
  onCreateNew, 
  onEditDeck, 
  onDeleteDeck, 
  onStudyDeck,
  isLoading = false 
}: DeckListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Decks</h2>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            New Deck
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Decks</h2>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Deck
          </Button>
        </div>
        
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No decks yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first deck to start studying with flashcards.
          </p>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Deck
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Your Decks</h2>
          <p className="text-muted-foreground">
            {decks.length} deck{decks.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          New Deck
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onEdit={onEditDeck}
            onDelete={onDeleteDeck}
            onStudy={onStudyDeck}
          />
        ))}
      </div>
    </div>
  );
}
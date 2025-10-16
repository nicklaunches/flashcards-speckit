"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Edit, Trash2 } from "lucide-react";
import type { DeckWithStats } from "@/types";

interface DeckCardProps {
  deck: DeckWithStats;
  onEdit?: (deck: DeckWithStats) => void;
  onDelete?: (deck: DeckWithStats) => void;
  onStudy?: (deck: DeckWithStats) => void;
}

export function DeckCard({ deck, onEdit, onDelete, onStudy }: DeckCardProps) {
  const canStudy = deck.statistics.totalCards > 0;
  const dueText = deck.statistics.dueCards > 0 
    ? `${deck.statistics.dueCards} due` 
    : "None due";

  const lastStudiedText = deck.statistics.lastStudied 
    ? new Date(deck.statistics.lastStudied).toLocaleDateString()
    : "Never studied";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{deck.name}</CardTitle>
            <CardDescription>{deck.description || "No description"}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Cards</p>
            <p className="font-medium">{deck.statistics.totalCards}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Due Cards</p>
            <p className="font-medium">{dueText}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Last Studied</p>
            <p className="font-medium">{lastStudiedText}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        {canStudy && (
          <Button 
            onClick={() => onStudy?.(deck)}
            className="flex-1"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Study
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit?.(deck)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete?.(deck)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
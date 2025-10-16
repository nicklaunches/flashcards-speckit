"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { StudyInterface } from "@/components/study/study-interface";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { 
  startStudySession, 
  getStudyQueue, 
  reviewCard, 
  completeStudySession, 
  abandonStudySession,
  getActiveStudySession 
} from "@/app/actions/study";
import { getDeck } from "@/app/actions/deck";
import { useErrorHandler } from "@/lib/utils/errors";
import type { Card as CardType, StudySession, DeckWithStats } from "@/types";

export default function StudyPage() {
  const [deck, setDeck] = useState<DeckWithStats | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [session, setSession] = useState<StudySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [studyMode, setStudyMode] = useState<"review" | "cram" | "new">("review");
  const { handleError } = useErrorHandler();
  const router = useRouter();
  const params = useParams();

  const deckId = parseInt(params.id as string, 10);

  useEffect(() => {
    if (isNaN(deckId)) {
      router.push("/");
      return;
    }
    loadDeckAndCheckSession();
  }, [deckId]);

  const loadDeckAndCheckSession = async () => {
    try {
      setIsLoading(true);
      
      // Load deck
      const deckResult = await getDeck({ id: deckId });
      if (!deckResult.success || !deckResult.data) {
        handleError(new Error(deckResult.error || "Failed to load deck"));
        router.push("/");
        return;
      }
      setDeck(deckResult.data);

      // Check for active session
      const sessionResult = await getActiveStudySession(deckId);
      if (sessionResult.success && sessionResult.data) {
        setSession(sessionResult.data);
        // Load study queue for existing session
        await loadStudyQueue();
      }
    } catch (error) {
      handleError(error, "loading deck and session");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudyQueue = async () => {
    try {
      const cardsResult = await getStudyQueue(deckId);
      if (cardsResult.success && cardsResult.data) {
        setCards(cardsResult.data);
      } else {
        handleError(new Error(cardsResult.error || "Failed to load study queue"));
      }
    } catch (error) {
      handleError(error, "loading study queue");
    }
  };

  const handleStartSession = async () => {
    try {
      setIsStarting(true);
      
      const sessionResult = await startStudySession({ 
        deckId, 
        sessionType: studyMode 
      });
      
      if (sessionResult.success && sessionResult.data) {
        setSession(sessionResult.data);
        await loadStudyQueue();
      } else {
        handleError(new Error(sessionResult.error || "Failed to start study session"));
      }
    } catch (error) {
      handleError(error, "starting study session");
    } finally {
      setIsStarting(false);
    }
  };

  const handleReviewCard = async (cardId: number, response: "easy" | "hard", responseTimeMs?: number) => {
    if (!session) return;

    try {
      const result = await reviewCard({
        sessionId: session.id,
        cardId,
        response,
        responseTimeMs,
      });

      if (!result.success) {
        handleError(new Error(result.error || "Failed to review card"));
      }
    } catch (error) {
      handleError(error, "reviewing card");
    }
  };

  const handleCompleteSession = async () => {
    if (!session) return;

    try {
      const result = await completeStudySession(session.id);
      if (result.success) {
        setSession(null);
        setCards([]);
      } else {
        handleError(new Error(result.error || "Failed to complete session"));
      }
    } catch (error) {
      handleError(error, "completing session");
    }
  };

  const handleAbandonSession = async () => {
    if (!session) return;

    try {
      const result = await abandonStudySession(session.id);
      if (result.success) {
        setSession(null);
        setCards([]);
      } else {
        handleError(new Error(result.error || "Failed to abandon session"));
      }
    } catch (error) {
      handleError(error, "abandoning session");
    }
  };

  const handleBackToDeck = () => {
    router.push(`/decks/${deckId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Deck Not Found</h1>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Decks
        </Button>
      </div>
    );
  }

  // If there's an active session, show the study interface
  if (session && cards.length > 0) {
    return (
      <StudyInterface
        cards={cards}
        session={session}
        onReviewCard={handleReviewCard}
        onCompleteSession={handleCompleteSession}
        onAbandonSession={handleAbandonSession}
        onBackToDeck={handleBackToDeck}
        isLoading={false}
      />
    );
  }

  // Show session start interface
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={handleBackToDeck}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deck
          </Button>
          <h1 className="text-3xl font-bold">Study: {deck.name}</h1>
          {deck.description && (
            <p className="text-muted-foreground mt-2">{deck.description}</p>
          )}
        </div>
      </div>

      {/* Study Options */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Choose Study Mode</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="studyMode"
                  value="review"
                  checked={studyMode === "review"}
                  onChange={(e) => setStudyMode(e.target.value as "review")}
                  className="form-radio"
                />
                <div>
                  <div className="font-medium">Review Mode</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Study cards that are due for review based on spaced repetition
                  </div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="studyMode"
                  value="cram"
                  checked={studyMode === "cram"}
                  onChange={(e) => setStudyMode(e.target.value as "cram")}
                  className="form-radio"
                />
                <div>
                  <div className="font-medium">Cram Mode</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Study all cards in the deck regardless of due date
                  </div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="studyMode"
                  value="new"
                  checked={studyMode === "new"}
                  onChange={(e) => setStudyMode(e.target.value as "new")}
                  className="form-radio"
                />
                <div>
                  <div className="font-medium">New Cards Only</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Study only cards that haven't been reviewed before
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Deck Statistics */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Deck Statistics</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {deck.statistics.totalCards}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Cards
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {deck.statistics.dueCards}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Due for Review
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {deck.statistics.totalCards - deck.statistics.dueCards}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Up to Date
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleStartSession}
              disabled={isStarting || deck.statistics.totalCards === 0}
              size="lg"
              className="px-8"
            >
              {isStarting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting...
                </div>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Study Session
                </>
              )}
            </Button>
          </div>

          {deck.statistics.totalCards === 0 && (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>This deck has no cards to study.</p>
              <p className="text-sm mt-1">Add some cards first!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
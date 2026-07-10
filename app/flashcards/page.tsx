"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/components/I18nProvider";
import { addDays } from "date-fns";

type Deck = { id: string; title: string; created_at: string };
type Card = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  interval_days: number;
  ease: number;
  next_review_at: string;
};

export default function FlashcardsPage() {
  const supabase = createClient();
  const { t, fmt } = useI18n();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const [reviewQueue, setReviewQueue] = useState<Card[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadDecks();
  }, []);

  async function loadDecks() {
    const { data } = await supabase
      .from("flashcard_decks")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });
    setDecks(data || []);
  }

  async function loadCards(deckId: string) {
    const { data } = await supabase
      .from("flashcards")
      .select("*")
      .eq("deck_id", deckId)
      .order("created_at", { ascending: true });
    setCards(data || []);
  }

  async function handleCreateDeck(e: React.FormEvent) {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("flashcard_decks")
      .insert({ user_id: user.id, title: newDeckTitle })
      .select()
      .single();
    setNewDeckTitle("");
    loadDecks();
    if (data) openDeck(data);
  }

  async function openDeck(deck: Deck) {
    setActiveDeck(deck);
    setReviewing(false);
    await loadCards(deck.id);
  }

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    if (!activeDeck || !front.trim() || !back.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("flashcards").insert({
      user_id: user.id,
      deck_id: activeDeck.id,
      front,
      back,
    });
    setFront("");
    setBack("");
    loadCards(activeDeck.id);
  }

  function startReview() {
    const now = new Date();
    const due = cards.filter((c) => new Date(c.next_review_at) <= now);
    setReviewQueue(due.length > 0 ? due : cards);
    setReviewIndex(0);
    setFlipped(false);
    setReviewing(true);
  }

  async function rate(quality: "again" | "good" | "easy") {
    const card = reviewQueue[reviewIndex];
    let interval = card.interval_days;
    let ease = card.ease;

    if (quality === "again") {
      interval = 1;
      ease = Math.max(1.3, ease - 0.2);
    } else if (quality === "good") {
      interval = Math.max(1, Math.round(interval * ease));
      ease = ease + 0.05;
    } else {
      interval = Math.max(1, Math.round(interval * ease * 1.3));
      ease = ease + 0.1;
    }

    await supabase
      .from("flashcards")
      .update({
        interval_days: interval,
        ease,
        next_review_at: addDays(new Date(), interval).toISOString(),
      })
      .eq("id", card.id);

    if (reviewIndex + 1 < reviewQueue.length) {
      setReviewIndex(reviewIndex + 1);
      setFlipped(false);
    } else {
      setReviewing(false);
      if (activeDeck) loadCards(activeDeck.id);
    }
  }

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-papyrus">{t.flashcards.title}</h1>
      <p className="mt-1 text-dusty">{t.flashcards.subtitle}</p>

      {!activeDeck ? (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form onSubmit={handleCreateDeck} className="papyrus-card p-6">
            <h2 className="font-display text-lg text-gold">{t.flashcards.newDeck}</h2>
            <input
              value={newDeckTitle}
              onChange={(e) => setNewDeckTitle(e.target.value)}
              placeholder={t.flashcards.deckTitlePlaceholder}
              className="mt-3 w-full rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none focus:border-gold"
            />
            <button className="mt-3 w-full rounded-full bg-gold py-2.5 font-semibold text-ink hover:bg-gold-soft">
              {t.flashcards.createDeck}
            </button>
          </form>

          {decks.map((deck) => (
            <button
              key={deck.id}
              onClick={() => openDeck(deck)}
              className="papyrus-card p-6 text-left transition hover:border-gold"
            >
              <h2 className="font-display text-lg text-gold">{deck.title}</h2>
              <p className="mt-1 text-sm text-dusty">{t.flashcards.openDeck}</p>
            </button>
          ))}
        </div>
      ) : reviewing ? (
        <div className="mx-auto mt-8 max-w-xl">
          <button
            onClick={() => setReviewing(false)}
            className="mb-4 text-xs text-dusty hover:text-gold"
          >
            {t.flashcards.exitReview}
          </button>
          <div
            onClick={() => setFlipped(!flipped)}
            className="papyrus-card flex min-h-[240px] cursor-pointer items-center justify-center p-10 text-center"
          >
            <p className="font-display text-xl text-papyrus">
              {flipped ? reviewQueue[reviewIndex].back : reviewQueue[reviewIndex].front}
            </p>
          </div>
          <p className="mt-2 text-center text-xs text-dusty">
            {fmt(t.flashcards.cardXofY, { current: reviewIndex + 1, total: reviewQueue.length })}
          </p>
          {flipped && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <button
                onClick={() => rate("again")}
                className="rounded-full border border-fail py-2.5 text-sm text-fail hover:bg-fail/10"
              >
                {t.flashcards.again}
              </button>
              <button
                onClick={() => rate("good")}
                className="rounded-full border border-gold py-2.5 text-sm text-gold hover:bg-gold/10"
              >
                {t.flashcards.good}
              </button>
              <button
                onClick={() => rate("easy")}
                className="rounded-full border border-lapis-soft py-2.5 text-sm text-lapis-soft hover:bg-lapis/10"
              >
                {t.flashcards.easy}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <button
            onClick={() => setActiveDeck(null)}
            className="mb-4 text-xs text-dusty hover:text-gold"
          >
            {t.flashcards.allDecks}
          </button>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-papyrus">{activeDeck.title}</h2>
            {cards.length > 0 && (
              <button
                onClick={startReview}
                className="rounded-full bg-gold px-6 py-2 text-sm font-semibold text-ink hover:bg-gold-soft"
              >
                {fmt(t.flashcards.startReview, { count: cards.length })}
              </button>
            )}
          </div>

          <form onSubmit={handleAddCard} className="papyrus-card mt-6 grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
            <input
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder={t.flashcards.frontPlaceholder}
              className="rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none focus:border-gold"
            />
            <input
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder={t.flashcards.backPlaceholder}
              className="rounded-lg border border-obsidian-line bg-obsidian px-4 py-2.5 text-papyrus outline-none focus:border-gold"
            />
            <button className="sm:col-span-2 rounded-full border border-gold-dim py-2.5 text-sm text-papyrus hover:border-gold">
              {t.flashcards.addCard}
            </button>
          </form>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <div key={c.id} className="papyrus-card p-4">
                <p className="text-sm font-medium text-papyrus">{c.front}</p>
                <p className="mt-1 text-sm text-dusty">{c.back}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

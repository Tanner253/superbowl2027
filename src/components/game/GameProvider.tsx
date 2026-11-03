"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useState } from "react";

// The kick-return game lives in the root layout, so it stays open (or minimized to a pill) while
// the visitor moves between pages. Its code is only downloaded the first time someone opens it.
const KickReturn = dynamic(() => import("./KickReturn"), { ssr: false, loading: () => null });

export type GameView = "closed" | "open" | "mini";
type GameState = { view: GameView; toggle: () => void; setView: (v: GameView) => void };

const Ctx = createContext<GameState>({ view: "closed", toggle: () => {}, setView: () => {} });

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<GameView>("closed");
  // Mounted after the first open and kept mounted, so minimizing keeps the run and the score.
  const [started, setStarted] = useState(false);
  const toggle = useCallback(() => {
    setStarted(true);
    setView((v) => (v === "open" ? "mini" : "open"));
  }, []);
  return (
    <Ctx.Provider value={{ view, toggle, setView }}>
      {children}
      {started && <KickReturn view={view} setView={setView} />}
    </Ctx.Provider>
  );
}

export const useGame = () => useContext(Ctx);

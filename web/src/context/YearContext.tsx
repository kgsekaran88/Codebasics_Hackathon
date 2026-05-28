import { createContext, useContext, useState, type ReactNode } from "react";
import type { Year } from "../components/YearToggle";

const YearContext = createContext<{
  year: Year;
  setYear: (y: Year) => void;
} | null>(null);

export function YearProvider({ children }: { children: ReactNode }) {
  const [year, setYear] = useState<Year>("2026");
  return (
    <YearContext.Provider value={{ year, setYear }}>{children}</YearContext.Provider>
  );
}

export function useYear() {
  const ctx = useContext(YearContext);
  if (!ctx) throw new Error("useYear must be used within YearProvider");
  return ctx;
}

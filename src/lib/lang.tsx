"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "da" | "en";

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
  lang: "da",
  setLang: () => {},
});

const STORAGE_KEY = "lang";

/** Holds the site language. Danish by default; the visitor's choice is remembered. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("da");

  // Read the saved choice after mount so the server render stays Danish.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (saved === "en") setLangState("en"); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Picks the text for the current language from a { da, en } pair or dictionary. */
export function useT<T>(texts: Record<Lang, T>): T {
  return texts[useLang().lang];
}

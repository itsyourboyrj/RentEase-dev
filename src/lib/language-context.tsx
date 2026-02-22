"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "hi";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
}>({
  language: "en",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Persist to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang") as Language | null;
      if (saved === "en" || saved === "hi") setLanguageState(saved);
    } catch {
      // localStorage unavailable (e.g., SSR or restricted environment)
    }
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    try {
      localStorage.setItem("lang", lang);
    } catch {
      // Persist failure is non-critical; state is already updated
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

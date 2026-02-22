"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const LanguageContext = createContext({
  lang: "en",
  setLang: (lang: string) => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState("en");
  const supabase = createClient();

  useEffect(() => {
    // 1. Check localStorage first for instant load
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);

    // 2. Then check DB as source of truth
    async function syncLang() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("owners")
          .select("preferred_lang")
          .eq("id", user.id)
          .single();
        if (data?.preferred_lang) {
          setLang(data.preferred_lang);
          localStorage.setItem("lang", data.preferred_lang);
        }
      }
    }
    syncLang();
  }, []);

  const handleSetLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

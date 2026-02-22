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
    try {
      const saved = localStorage.getItem("lang");
      if (saved) setLang(saved);
    } catch {}

    // 2. Then check DB as source of truth
    async function syncLang() {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user) {
        if (userErr) console.error("Failed to get user for lang sync:", userErr.message);
        return;
      }
      const { data, error } = await supabase
        .from("owners")
        .select("preferred_lang")
        .eq("id", userResp.user.id)
        .single();
      if (error) {
        console.error("Failed to fetch preferred language:", error.message);
        return;
      }
      if (data?.preferred_lang) {
        setLang(data.preferred_lang);
        try { localStorage.setItem("lang", data.preferred_lang); } catch {}
      }
    }
    syncLang();
  }, []);

  const handleSetLang = async (newLang: string) => {
    const previousLang = lang;
    setLang(newLang);
    try { localStorage.setItem("lang", newLang); } catch {}

    // Persist to DB if user is authenticated
    const { data: userResp, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userResp?.user) {
      if (userErr) console.error("Failed to get user for lang update:", userErr.message);
      return;
    }
    const { error: updateError } = await supabase
      .from("owners")
      .update({ preferred_lang: newLang })
      .eq("id", userResp.user.id);
    if (updateError) {
      console.error("Failed to persist language preference:", updateError.message);
      // Revert to previous language since DB update failed
      setLang(previousLang);
      try { localStorage.setItem("lang", previousLang); } catch {}
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

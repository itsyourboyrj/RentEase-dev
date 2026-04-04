"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext<any>({ user: null, owner: null, loading: true, refresh: () => {} });

const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ user: any; owner: any; loading: boolean }>({ user: null, owner: null, loading: true });

  const fetchAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let owner = null;
        try {
          const { data, error } = await supabase.from('owners').select('*').eq('id', user.id).single();
          if (error) {
            console.error("Failed to fetch owner profile:", error.message);
          } else {
            owner = data;
          }
        } catch (e) {
          console.error("Owner lookup failed:", e);
        }
        setState({ user, owner, loading: false });
      } else {
        setState({ user: null, owner: null, loading: false });
      }
    } catch {
      setState({ user: null, owner: null, loading: false });
    }
  }, []);

  useEffect(() => { fetchAuth(); }, [fetchAuth]);

  return (
    <AuthContext.Provider value={{ ...state, refresh: fetchAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

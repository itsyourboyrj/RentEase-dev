"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext<any>({ user: null, owner: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ user: any; owner: any; loading: boolean }>({ user: null, owner: null, loading: true });
  const supabase = createClient();

  useEffect(() => {
    async function getInitialAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: owner } = await supabase.from('owners').select('*').eq('id', user.id).single();
        setState({ user, owner, loading: false });
      } else {
        setState({ user: null, owner: null, loading: false });
      }
    }
    getInitialAuth();
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

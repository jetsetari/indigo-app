// data/store/userStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Session, User } from '@supabase/supabase-js';
import type { ClientRow } from '~/data/types';
import { getSupabase } from '../supabase/connection';

type AuthSlice = {
  session: Session | null;
  user: User | null;
};

type UserStore = AuthSlice & {
  client: ClientRow | null;
  setAuth: (auth: Partial<AuthSlice>) => void;
  setClient: (client: ClientRow | null) => void;
  hydrateFromSupabase: () => Promise<void>;
  reset: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      client: null,

      setAuth: (auth) =>
        set((s) => ({ ...s, ...auth })),

      setClient: (client) =>
        set((s) => ({ ...s, client })),

      hydrateFromSupabase: async () => {
        const supabase = getSupabase();
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          set({ session: data.session, user: data.session.user });
          // Optionally fetch the client by email or metadata here if needed
        }
      },

      reset: () => set({ session: null, user: null, client: null }),
    }),
    {
      name: 'indigo-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        session: s.session,
        user: s.user,
        client: s.client,
      }),
    }
  )
);

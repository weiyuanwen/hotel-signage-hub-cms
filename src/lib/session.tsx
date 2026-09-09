"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type CmsUser, type Hotel, getHotelId, getToken, setHotelId, setToken } from "./api";

type Session = {
  user: CmsUser | null;
  hotels: Hotel[];
  hotelId: number | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  selectHotel: (id: number) => void;
  refreshHotels: (selectId?: number) => Promise<void>;
};

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CmsUser | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelId, setHotel] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    api<{ user: CmsUser }>("/cms/me")
      .then(async ({ user }) => {
        setUser(user);
        const list = await api<{ data: Hotel[] }>("/cms/hotels");
        setHotels(list.data);
        const stored = getHotelId();
        const next = stored && list.data.some((h) => h.id === stored) ? stored : list.data[0]?.id ?? null;
        setHotel(next);
        if (next) setHotelId(next);
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<Session>(
    () => ({
      user,
      hotels,
      hotelId,
      ready,
      async login(email, password) {
        const res = await api<{ token: string; user: CmsUser }>("/cms/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(res.token);
        setUser(res.user);
        const list = await api<{ data: Hotel[] }>("/cms/hotels");
        setHotels(list.data);
        const next = list.data[0]?.id ?? null;
        setHotel(next);
        setHotelId(next);
      },
      logout() {
        setToken(null);
        setHotelId(null);
        setUser(null);
        setHotels([]);
        setHotel(null);
      },
      selectHotel(id) {
        setHotel(id);
        setHotelId(id);
      },
      async refreshHotels(selectId) {
        const list = await api<{ data: Hotel[] }>("/cms/hotels");
        setHotels(list.data);
        const stored = selectId ?? getHotelId();
        const next =
          stored && list.data.some((hotel) => hotel.id === stored)
            ? stored
            : (list.data[0]?.id ?? null);
        setHotel(next);
        setHotelId(next);
      },
    }),
    [user, hotels, hotelId, ready],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): Session {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession outside provider");
  return ctx;
}

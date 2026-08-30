"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { getCurrentUser } from "@/services/current-user-service";

import type {
  User,
  UserRole,
} from "@/types/user";

type CurrentUserContextValue = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
};

const CurrentUserContext =
  createContext<CurrentUserContextValue | null>(
    null,
  );

export const roleLabels: Record<
  UserRole,
  string
> = {
  admin: "Admin",
  accountant: "Accountant",
  balance: "Balance Officer",
  agent: "Agent",
  driver: "Driver",
  store: "Store Officer",
};

export function getUserInitials(
  name?: string | null,
) {
  if (!name?.trim()) {
    return "U";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");
}

export function CurrentUserProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const refreshUser =
    useCallback(async () => {
      setLoading(true);

      try {
        const current =
          await getCurrentUser();

        setUser(current);
      } catch (error) {
        console.error(
          "Unable to load /api/me:",
          error,
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  function clearUser() {
    setUser(null);
  }

  return (
    <CurrentUserContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        clearUser,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context =
    useContext(CurrentUserContext);

  if (!context) {
    throw new Error(
      "useCurrentUser must be used inside CurrentUserProvider",
    );
  }

  return context;
}

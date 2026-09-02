"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getDashboardOverview,
} from "@/services/dashboard-service";

import type {
  DashboardOverview,
} from "@/types/dashboard";

export function useDashboardOverview() {
  const [data, setData] =
    useState<DashboardOverview | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const refresh =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const result =
          await getDashboardOverview();

        setData(result);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}

"use client";

import { useSyncExternalStore } from "react";

import type { ApiError, LocalizeRequest, RewriteRequest } from "./api";
import type { ErrorCode, ProviderId } from "./engine/providers/types";
import type { LocalizeOutput, Preview } from "./engine/types";

export type LiveKey = { provider: ProviderId; key: string };

/** The key lives in sessionStorage: this tab only, gone when it closes. */
const STORAGE = "getlocalised-os.key";
const listeners = new Set<() => void>();
let cached: { raw: string | null; value: LiveKey | null } = { raw: null, value: null };

function read(): LiveKey | null {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(STORAGE);
  } catch {}
  if (raw !== cached.raw) {
    let value: LiveKey | null = null;
    try {
      value = raw ? (JSON.parse(raw) as LiveKey) : null;
    } catch {}
    cached = { raw, value };
  }
  return cached.value;
}

export function setLiveKey(value: LiveKey | null) {
  try {
    if (value) sessionStorage.setItem(STORAGE, JSON.stringify(value));
    else sessionStorage.removeItem(STORAGE);
  } catch {}
  listeners.forEach((fn) => fn());
}

export function useLiveKey(): LiveKey | null {
  return useSyncExternalStore(
    (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    read,
    () => null,
  );
}

export class LiveError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

async function post<T>(path: string, live: LiveKey, body: object): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json", "x-model-key": live.key },
      body: JSON.stringify({ ...body, provider: live.provider }),
    });
  } catch {
    throw new LiveError("provider_error", "Couldn't reach the server. Check your connection and try again.");
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (json as ApiError | null)?.error;
    throw new LiveError(err?.code ?? "provider_error", err?.message ?? `The request failed (${res.status}).`);
  }
  return json as T;
}

export async function runRewrite(live: LiveKey, body: Omit<RewriteRequest, "provider">): Promise<Preview[]> {
  return (await post<{ previews: Preview[] }>("/api/rewrite", live, body)).previews;
}

export async function runLocalize(live: LiveKey, body: Omit<LocalizeRequest, "provider">): Promise<LocalizeOutput> {
  return post<LocalizeOutput>("/api/localize", live, body);
}

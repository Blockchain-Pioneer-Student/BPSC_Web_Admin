"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type PreviewDrafts = Record<string, Record<string, unknown>>;

interface PreviewContextValue {
  drafts: PreviewDrafts;
  visibility: Record<string, boolean>;
  setDrafts: (drafts: PreviewDrafts) => void;
  setVisibility: (visibility: Record<string, boolean>) => void;
}

const PreviewContext = createContext<PreviewContextValue | null>(null);

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const [drafts, setDrafts] = useState<PreviewDrafts>({});
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const value = useMemo(
    () => ({ drafts, visibility, setDrafts, setVisibility }),
    [drafts, visibility],
  );

  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
}

export function usePreviewContext() {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error("usePreviewContext must be used inside PreviewProvider");
  }
  return context;
}

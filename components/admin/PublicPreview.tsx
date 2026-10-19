"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const routes = [
  { label: "Trang chủ", path: "/" },
  { label: "Sự kiện", path: "/events" },
  { label: "Đội ngũ", path: "/team" },
  { label: "Liên hệ", path: "/contact" },
];

export function PublicPreview() {
  const [path, setPath] = useState("/");
  const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:8081";
  const previewUrl = useMemo(() => `${clientUrl.replace(/\/$/, "")}${path}`, [clientUrl, path]);

  return (
    <aside
      className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[min(580px,40vw)] min-w-[420px] shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white xl:flex"
      aria-label="Bản xem trước website công khai"
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-950 px-4 text-white">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Eye className="h-4 w-4" />
          Bản xem trước
        </div>
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-md p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          title="Mở trang công khai"
          aria-label="Mở trang công khai"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-100 px-3 py-2">
        {routes.map((route) => (
          <Button
            key={route.path}
            type="button"
            size="sm"
            variant={path === route.path ? "default" : "ghost"}
            className="h-8 shrink-0 px-2.5 text-xs"
            onClick={() => setPath(route.path)}
          >
            {route.label}
          </Button>
        ))}
      </div>

      <div className="min-h-0 flex-1 bg-slate-50 p-3">
        <div className="h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <iframe
            key={previewUrl}
            src={previewUrl}
            title="Bản xem trước website công khai"
            className="origin-top-left bg-slate-50"
            style={{
              width: "217.4%",
              height: "217.4%",
              transform: "scale(0.46)",
            }}
          />
        </div>
      </div>
    </aside>
  );
}

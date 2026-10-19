"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Eye, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const routes = [
  { label: "Trang chủ", path: "/" },
  { label: "Sự kiện", path: "/events" },
  { label: "Đội ngũ", path: "/team" },
  { label: "Liên hệ", path: "/contact" },
];

export function PublicPreview() {
  const [open, setOpen] = useState(true);
  const [path, setPath] = useState("/");
  const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:8081";
  const previewUrl = useMemo(() => `${clientUrl.replace(/\/$/, "")}${path}`, [clientUrl, path]);

  return (
    <aside
      className={`fixed bottom-4 right-4 z-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl transition-[width,height] duration-200 ${
        open ? "h-[300px] w-[min(420px,calc(100vw-2rem))]" : "h-12 w-48"
      }`}
      aria-label="Bản xem trước website công khai"
    >
      <div className="flex h-12 items-center justify-between border-b border-slate-200 bg-slate-950 px-3 text-white">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Eye className="h-4 w-4" />
          Bản xem trước
        </div>
        <div className="flex items-center gap-1">
          {open && (
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
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-md p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            title={open ? "Thu gọn bản xem trước" : "Mở bản xem trước"}
            aria-label={open ? "Thu gọn bản xem trước" : "Mở bản xem trước"}
          >
            {open ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-2 py-2">
            {routes.map((route) => (
              <Button
                key={route.path}
                type="button"
                size="sm"
                variant={path === route.path ? "default" : "ghost"}
                className="h-7 shrink-0 px-2 text-xs"
                onClick={() => setPath(route.path)}
              >
                {route.label}
              </Button>
            ))}
          </div>
          <iframe
            key={previewUrl}
            src={previewUrl}
            title="Bản xem trước website công khai"
            className="h-[240px] w-full bg-slate-50"
          />
        </>
      )}
    </aside>
  );
}

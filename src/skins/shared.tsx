import {
  ChevronLeft,
  ChevronRight,
  FileText,
  LockKeyhole,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { SkinProps } from "../AppSkins";
import { safeMedia, type Item } from "../schema";
export type Props = SkinProps;
export const meta = (
  i: Pick<Item, "meta"> | undefined,
  key: string,
  fallback = "",
) => String(i?.meta?.[key] ?? fallback);
export function Header({ p, children }: { p: Props; children?: ReactNode }) {
  return (
    <header
      className="app-nav catalog-nav"
      data-authoring={p.creator}
      data-root={!p.thread}
    >
      <button aria-label="返回" onClick={p.onBack}>
        <ChevronLeft size={22} />
      </button>
      <strong>{p.name}</strong>
      <div>
        {children}
        {p.creator && (
          <button aria-label="新增内容" onClick={p.onAdd}>
            <Plus size={21} />
          </button>
        )}
      </div>
    </header>
  );
}
export function Tabs({
  tabs,
  value,
  set,
  icons,
}: {
  tabs: string[];
  value: string;
  set: (s: string) => void;
  icons?: ReactNode[];
}) {
  return (
    <nav className="catalog-tabs">
      {tabs.map((t, i) => (
        <button
          key={t}
          className={value === t ? "selected" : ""}
          onClick={() => set(t)}
        >
          {icons?.[i]}
          <span>{t}</span>
        </button>
      ))}
    </nav>
  );
}
export function SearchBox({
  value,
  set,
  placeholder = "搜索",
}: {
  value: string;
  set: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="catalog-search">
      <Search size={15} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => set(e.target.value)}
      />
    </label>
  );
}
export function Avatar({
  name,
  round = true,
  src = "",
}: {
  name: string;
  round?: boolean;
  src?: string;
}) {
  return (
    <span className={`catalog-avatar ${round ? "round" : ""}`}>
      {safeMedia(src) ? (
        <img src={safeMedia(src)} alt="" />
      ) : (
        name.slice(0, 1) || "人"
      )}
    </span>
  );
}
export function Media({
  item,
  className = "",
  autoPlayVideo = false,
  active = false,
}: {
  item: Item;
  className?: string;
  autoPlayVideo?: boolean;
  active?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Resolve known bundled photo filenames even when a legacy saved work item
  // has an empty/unsupported media field. The blank story's photo titles are
  // the asset basenames, so old local saves remain renderable.
  const raw = String(item.media || "").trim();
  const base = import.meta.env.BASE_URL;
  const basename = (raw || item.title).split("/").pop() || "";
  const knownAsset = /^[a-zA-Z0-9._-]+\\.(png|jpe?g|webp|gif)$/i.test(basename)
    ? basename
    : /^[a-zA-Z0-9._-]+$/i.test(item.title)
      ? `${item.title}.jpg`
      : "";
  const src = raw.startsWith("data:")
    ? safeMedia(raw)
    : raw.includes("story-assets/")
      ? `${base}story-assets/${basename}`
      : knownAsset
        ? `${base}story-assets/${knownAsset}`
        : safeMedia(raw);
  useEffect(() => {
    if (!autoPlayVideo || item.kind !== "video") return;
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    if (active) {
      // Try with sound first. If the browser blocks audible autoplay, fall back
      // to muted playback; the first direct tap can enable sound without pausing.
      video.muted = false;
      const playback = video.play();
      if (playback) {
        void playback.catch(() => {
          if (cancelled) return;
          video.muted = true;
          const fallback = video.play();
          if (fallback) void fallback.catch(() => {});
        });
      }
    } else {
      video.pause();
    }
    return () => {
      cancelled = true;
      video.pause();
    };
  }, [active, autoPlayVideo, item.id, item.kind, src]);
  return src ? (
    item.kind === "audio" ? (
      <audio className={className} controls src={src} />
    ) : item.kind === "video" ? (
      <video
        ref={videoRef}
        className={className}
        controls={!autoPlayVideo}
        autoPlay={autoPlayVideo && active}
        muted={false}
        loop={autoPlayVideo}
        playsInline
        src={src}
        onClick={(e) => {
          e.stopPropagation();
          if (!autoPlayVideo) return;
          const video = e.currentTarget;
          // If autoplay had to fall back to muted mode, the first tap unmutes
          // immediately and keeps playback going. Subsequent taps toggle play/pause.
          if (video.muted && !video.paused) {
            video.muted = false;
            return;
          }
          if (video.paused) {
            video.muted = false;
            const playback = video.play();
            if (playback) void playback.catch(() => {});
          } else {
            video.pause();
          }
        }}
      />
    ) : (
      <img
        className={className}
        loading="lazy"
        alt={item.title}
        src={src}
        onError={(e) => {
          const image = e.currentTarget;
          image.style.display = "none";
          const fallback = image.nextElementSibling;
          if (fallback instanceof HTMLElement) fallback.style.display = "grid";
        }}
      />
    )
  ) : (
    <div className={`catalog-art ${className}`}>
      <span>{item.title}</span>
    </div>
  );
}
export function Row({
  item,
  onItem,
  leading,
  children,
}: {
  item: Item;
  onItem: (i: Item) => void;
  leading?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <button className="catalog-row" onClick={() => onItem(item)}>
      {leading ?? <FileText size={22} />}
      <span>
        <strong>{item.title}</strong>
        <p>{item.body.split("\n")[0]}</p>
        <small>{item.time}</small>
      </span>
      {children ??
        (item.password ? (
          <LockKeyhole size={13} />
        ) : (
          <ChevronRight size={15} />
        ))}
    </button>
  );
}
export function Empty({
  items,
  label = "暂无内容",
}: {
  items: Item[];
  label?: string;
}) {
  return !items.length ? <p className="catalog-empty">{label}</p> : null;
}
export function Add({ p, label = "添加内容" }: { p: Props; label?: string }) {
  return p.creator ? (
    <button className="catalog-add" onClick={p.onAdd}>
      <Plus size={15} />
      {label}
    </button>
  ) : null;
}
export function useContent(p: Props, first: string) {
  const [tab, setTab] = useState(first),
    [q, setQ] = useState("");
  const items = p.items.filter((i) =>
    (
      i.title +
      i.body +
      i.sender +
      i.folder +
      Object.values(i.meta ?? {}).join(" ")
    )
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return { tab, setTab, q, setQ, items };
}
export function groupItems(items: Item[], fallback = "未分类") {
  return [...new Set(items.map((i) => i.folder || fallback))];
}

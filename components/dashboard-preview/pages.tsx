"use client";

import * as React from "react";
import {
  CheckCircle2,
  Gamepad2,
  Heart,
  MessageCircle,
  Play,
  Radio,
  Repeat2,
  Search,
  Timer,
  Users,
  Video,
} from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { usePreview } from "@/components/dashboard-preview/preview-context";
import { TimeSpendingChart, StatsRing } from "@/components/dashboard-preview/charts";

function Chips({
  options,
  active,
  onChange,
}: {
  options: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}) {
  const { v } = usePreview();
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[9px] font-semibold transition-colors",
            active === o.key ? v.chipActive : v.chip
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState() {
  const { t, v } = usePreview();
  return (
    <div className={cn("flex items-center justify-center gap-2 rounded-2xl py-10 text-[11px]", v.card, v.muted)}>
      <Search className="h-3.5 w-3.5" />
      {t("sections.noResults")}
    </div>
  );
}

/* ---------- Dashboard ---------- */

const COURSE_ROWS = [
  { labelColor: "#E6550D", progress: 76, chapters: 7 },
  { labelColor: "#1F78B4", progress: 42, chapters: 22 },
  { labelColor: "#31A354", progress: 88, chapters: 5 },
  { labelColor: "#008080", progress: 24, chapters: 6 },
];

export function DashboardPanel() {
  const { t, v } = usePreview();

  return (
    <>
      {/* Stat cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Timer, label: t("stats.inProgress"), value: "06", color: "text-teal-300 bg-teal-brand/15" },
          { icon: CheckCircle2, label: t("stats.completed"), value: "08", color: "text-green-brand bg-green-brand/15" },
          { icon: Play, label: t("stats.watchTime"), value: t("stats.hours"), color: "text-orange-brand bg-orange-brand/15" },
          { icon: Users, label: t("stats.online"), value: "10'052", color: "text-blue-brand bg-blue-brand/15" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={cn("flex items-center gap-2.5 rounded-2xl p-3", v.card)}
          >
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", s.color)}>
              <s.icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className={cn("truncate text-[9px]", v.muted)}>{s.label}</p>
              <p className="text-sm font-bold">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="mb-4 grid gap-3 lg:grid-cols-5">
        <div className={cn("rounded-2xl p-4 lg:col-span-3", v.card)}>
          <div className="mb-1 flex items-baseline justify-between">
            <p className={cn("text-xs font-semibold", v.subtle)}>{t("timeSpending.title")}</p>
            <p className="text-sm font-bold">{t("timeSpending.total")}</p>
          </div>
          <TimeSpendingChart />
        </div>
        <div className={cn("flex items-center justify-center gap-5 rounded-2xl p-4 lg:col-span-2", v.card)}>
          <StatsRing />
          <div className="flex flex-col gap-2 text-[10px]">
            {[
              { c: "#31A354", l: t("courseStats.complete"), p: "20%" },
              { c: "#1F78B4", l: t("courseStats.inProgress"), p: "30%" },
              { c: "#F59E0B", l: t("courseStats.notStarted"), p: "40%" },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.c }} />
                <span className={v.subtle}>{s.l}</span>
                <span className="ml-auto font-bold">{s.p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course table */}
      <div className={cn("rounded-2xl p-4", v.card)}>
        <div className="mb-3 flex items-center justify-between">
          <p className={cn("text-xs font-semibold", v.subtle)}>{t("courseStatus.title")}</p>
          <span className={cn("rounded-full border px-2.5 py-0.5 text-[9px]", v.line, v.subtle)}>
            {t("courseStatus.viewAll")}
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          {COURSE_ROWS.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
              className={cn("flex items-center gap-3 rounded-xl px-3 py-2", v.card)}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${row.labelColor}22` }}>
                <Play className="h-3 w-3" style={{ color: row.labelColor }} />
              </div>
              <span className="min-w-0 flex-1 truncate text-[11px] font-medium">Figma Course Part {i + 1}</span>
              <div className="hidden w-28 sm:block">
                <div className={cn("mb-1 text-right text-[9px]", v.muted)}>
                  {row.progress}
                  {t("courseStatus.complete")}
                </div>
                <div className={cn("h-1.5 w-full overflow-hidden rounded-full", v.input)}>
                  <motion.div
                    className="progress-brand h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${row.progress}%` }}
                    transition={{ delay: 0.35 + i * 0.07, duration: 0.7, ease: "easeOut" }}
                  />
                </div>
              </div>
              <span className={cn("text-[10px]", v.faint)}>{row.chapters}</span>
              <span className="rounded-full border border-orange-brand/50 px-3 py-0.5 text-[9px] font-semibold text-orange-brand">
                {t("courseStatus.play")}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------- Kurse ---------- */

const COURSES = [
  { key: "cards.c1Title", cat: "mgm", colors: ["#008080", "#2AA99B"], chapters: "07", progress: 76, price: "CHF 20" },
  { key: "cards.c2Title", cat: "trn", colors: ["#1F78B4", "#5FA9DC"], chapters: "22", progress: 42, price: "CHF 35" },
  { key: "cards.c3Title", cat: "trn", colors: ["#31A354", "#63B985"], chapters: "05", progress: 88, price: "CHF 18" },
  { key: "cards.c4Title", cat: "mgm", colors: ["#E6550D", "#F28A3D"], chapters: "06", progress: 24, price: "CHF 30" },
  { key: "cards.c5Title", cat: "mgm", colors: ["#2AA99B", "#008080"], chapters: "09", progress: 100, price: "CHF 25" },
  { key: "cards.c6Title", cat: "mgm", colors: ["#5FA9DC", "#1F78B4"], chapters: "12", progress: 0, price: "CHF 28" },
  { key: "cards.c7Title", cat: "trn", colors: ["#F28A3D", "#E6550D"], chapters: "04", progress: 0, price: "CHF 15" },
  { key: "cards.c8Title", cat: "mgm", colors: ["#63B985", "#31A354"], chapters: "08", progress: 100, price: "CHF 22" },
];

export function CoursesPanel() {
  const { t, v, query } = usePreview();
  const [cat, setCat] = React.useState("all");
  const [status, setStatus] = React.useState("all");

  const filtered = COURSES.filter((c) => {
    if (cat !== "all" && c.cat !== cat) return false;
    if (status === "inProgress" && !(c.progress > 0 && c.progress < 100)) return false;
    if (status === "completed" && c.progress !== 100) return false;
    if (status === "notStarted" && c.progress !== 0) return false;
    if (query && !t(c.key).toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className={cn("text-xs font-semibold", v.subtle)}>{t("sections.coursesHeader")}</p>
        <Chips
          options={[
            { key: "all", label: t("sections.all") },
            { key: "mgm", label: t("cards.categoryUiUx") },
            { key: "trn", label: t("cards.categoryTraining") },
          ]}
          active={cat}
          onChange={setCat}
        />
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={cn("text-[9px] font-bold uppercase tracking-widest", v.faint)}>
          {t("courseStatus.title")}
        </span>
        <Chips
          options={[
            { key: "all", label: t("sections.all") },
            { key: "inProgress", label: t("courseStats.inProgress") },
            { key: "completed", label: t("courseStats.complete") },
            { key: "notStarted", label: t("courseStats.notStarted") },
          ]}
          active={status}
          onChange={setStatus}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((c, i) => (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={cn("overflow-hidden rounded-2xl", v.card)}
            >
              <div
                className="relative aspect-video w-full"
                style={{ backgroundImage: `linear-gradient(135deg, ${c.colors[0]}, ${c.colors[1]})` }}
              >
                <Gamepad2 className="absolute left-2 top-2 h-4 w-4 text-white/80" />
                <span className="absolute right-2 top-2 rounded-full bg-navy-deep/70 px-2 py-0.5 text-[8px] font-bold text-white">
                  {c.price}
                </span>
                <Play className="absolute bottom-2 right-2 h-4 w-4 text-white/90" />
              </div>
              <div className="p-3">
                <p className="text-[8px] font-bold uppercase tracking-wide" style={{ color: c.colors[1] }}>
                  {t(c.cat === "mgm" ? "cards.categoryUiUx" : "cards.categoryTraining")}
                </p>
                <p className="mt-0.5 line-clamp-2 min-h-7 text-[10.5px] font-semibold leading-snug">{t(c.key)}</p>
                <p className={cn("mt-1 text-[8px]", v.muted)}>
                  {c.chapters} {t("courseStatus.colChapter").toLowerCase()}
                </p>
                <div className={cn("mt-2 h-1.5 w-full overflow-hidden rounded-full", v.input)}>
                  <motion.div
                    className="progress-brand h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${c.progress}%` }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- News (Twitter-Feed) ---------- */

type NewsComment = {
  id: string;
  author: string;
  key: string;
  likes: number;
  color: string;
  replies: { id: string; author: string; key: string; likes: number }[];
};

const POSTS: {
  id: string;
  author: string;
  handle: string;
  time: string;
  tagKey: string;
  key: string;
  likes: number;
  shares: number;
  color: string;
  comments: NewsComment[];
}[] = [
  {
    id: "p1", author: "Club Board", handle: "@coledia", time: "2h", tagKey: "news.tag1", key: "news.p1", likes: 24, shares: 3, color: "#008080",
    comments: [
      { id: "c1", author: "Lena B.", key: "news.c1", likes: 6, color: "#E6550D", replies: [{ id: "r1", author: "Tom K.", key: "news.c5", likes: 2 }] },
      { id: "c2", author: "Jonas R.", key: "news.c2", likes: 3, color: "#31A354", replies: [{ id: "r2", author: "Club Board", key: "news.c4", likes: 5 }] },
    ],
  },
  {
    id: "p2", author: "Sarah M.", handle: "@sarah", time: "5h", tagKey: "news.tag2", key: "news.p2", likes: 18, shares: 7, color: "#E6550D",
    comments: [
      { id: "c3", author: "Tom K.", key: "news.c3", likes: 4, color: "#1F78B4", replies: [] },
    ],
  },
  { id: "p3", author: "Mentoring Team", handle: "@mentoring", time: "8h", tagKey: "news.tag3", key: "news.p3", likes: 31, shares: 2, color: "#31A354", comments: [] },
  { id: "p4", author: "Admin", handle: "@admin", time: "1d", tagKey: "news.tag1", key: "news.p4", likes: 12, shares: 1, color: "#1F78B4", comments: [] },
];

function LikeButton({ base }: { base: number }) {
  const { v } = usePreview();
  const [liked, setLiked] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => setLiked(!liked)}
      className={cn("flex items-center gap-1 text-[9px] font-medium transition-colors", liked ? "text-orange-brand" : v.muted)}
    >
      <Heart className={cn("h-3 w-3", liked && "fill-orange-brand")} />
      {base + (liked ? 1 : 0)}
    </button>
  );
}

export function NewsPanel() {
  const { t, v, query } = usePreview();
  const [tag, setTag] = React.useState("all");
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  const filtered = POSTS.filter((p) => {
    if (tag !== "all" && p.tagKey !== `news.${tag}`) return false;
    if (query && !t(p.key).toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className={cn("text-xs font-semibold", v.subtle)}>{t("sections.newsHeader")}</p>
        <Chips
          options={[
            { key: "all", label: t("sections.all") },
            { key: "tag1", label: t("news.tag1") },
            { key: "tag2", label: t("news.tag2") },
            { key: "tag3", label: t("news.tag3") },
          ]}
          active={tag}
          onChange={setTag}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              className={cn("rounded-2xl p-3.5", v.card)}
            >
              <div className="flex gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: p.color }}
                >
                  {p.author.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px]">
                    <span className="font-bold">{p.author}</span>{" "}
                    <span className={v.muted}>
                      {p.handle} · {p.time}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] leading-snug">{t(p.key)}</p>
                  <p className="mt-1 text-[10px] font-semibold text-teal-300">{t(p.tagKey)}</p>
                  <div className={cn("mt-2.5 flex items-center gap-4 border-t pt-2", v.line)}>
                    <LikeButton base={p.likes} />
                    <button
                      type="button"
                      onClick={() => setOpen((s) => ({ ...s, [p.id]: !s[p.id] }))}
                      className={cn("flex items-center gap-1 text-[9px] font-medium", v.muted)}
                    >
                      <MessageCircle className="h-3 w-3" />
                      {p.comments.reduce((n, c) => n + 1 + c.replies.length, 0)}
                    </button>
                    <span className={cn("flex items-center gap-1 text-[9px] font-medium", v.muted)}>
                      <Repeat2 className="h-3 w-3" />
                      {p.shares}
                    </span>
                  </div>

                  {open[p.id] && p.comments.length > 0 && (
                    <div className="mt-2.5 flex flex-col gap-2">
                      {p.comments.map((c) => (
                        <div key={c.id}>
                          <div className="flex gap-2">
                            <div
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
                              style={{ backgroundColor: c.color }}
                            >
                              {c.author.slice(0, 1)}
                            </div>
                            <div className={cn("min-w-0 flex-1 rounded-xl px-2.5 py-1.5", v.input)}>
                              <p className="text-[9px]">
                                <span className="font-bold">{c.author}</span>
                              </p>
                              <p className="text-[10px] leading-snug">{t(c.key)}</p>
                              <div className="mt-1 flex items-center">
                                <LikeButton base={c.likes} />
                              </div>
                            </div>
                          </div>
                          {c.replies.map((r) => (
                            <div key={r.id} className="ml-7 mt-1.5 flex gap-2">
                              <div className={cn("min-w-0 flex-1 rounded-xl px-2.5 py-1.5", v.input)}>
                                <p className="text-[9px]">
                                  <span className="font-bold">{r.author}</span>{" "}
                                  <span className={v.muted}>→ {c.author}</span>
                                </p>
                                <p className="text-[10px] leading-snug">{t(r.key)}</p>
                                <div className="mt-1 flex items-center">
                                  <LikeButton base={r.likes} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- Live Events ---------- */

const EVENTS = [
  { key: "events.e1Title", metaKey: "events.e1Meta", cat: "trn", live: true, colors: ["#008080", "#2AA99B"] },
  { key: "events.e2Title", metaKey: "events.e2Meta", cat: "gen", live: false, colors: ["#1F78B4", "#5FA9DC"] },
  { key: "events.e3Title", metaKey: "events.e3Meta", cat: "soc", live: false, colors: ["#31A354", "#63B985"] },
];

const PAST_EVENTS = [
  { key: "events.e4Title", metaKey: "events.e4Meta", cat: "gen", live: false, colors: ["#E6550D", "#F28A3D"] },
  { key: "events.e5Title", metaKey: "events.e5Meta", cat: "soc", live: false, colors: ["#122A47", "#1F78B4"] },
];

export function EventsPanel() {
  const { t, v, query } = usePreview();
  const [tab, setTab] = React.useState<"upcoming" | "past">("upcoming");
  const [cat, setCat] = React.useState("all");

  const source = (tab === "upcoming" ? EVENTS : PAST_EVENTS).filter((e) => {
    if (cat !== "all" && e.cat !== cat) return false;
    if (query && !t(e.key).toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className={cn("text-xs font-semibold", v.subtle)}>{t("sections.eventsHeader")}</p>
        <div className={cn("flex rounded-full p-0.5", v.input)}>
          {(["upcoming", "past"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={cn(
                "rounded-full px-3 py-1 text-[9px] font-semibold transition-colors",
                tab === k ? v.chipActive : v.muted
              )}
            >
              {t(`sections.${k}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <Chips
          options={[
            { key: "all", label: t("sections.all") },
            { key: "trn", label: t("events.catTraining") },
            { key: "gen", label: t("events.catGeneral") },
            { key: "soc", label: t("events.catSocial") },
          ]}
          active={cat}
          onChange={setCat}
        />
      </div>

      {source.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {source.map((e, i) => {
            const isLive = e.live;
            return (
              <motion.div
                key={e.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                className={cn("overflow-hidden rounded-2xl", v.card, tab === "past" && "opacity-75")}
              >
                <div
                  className="relative aspect-video w-full"
                  style={{ backgroundImage: `linear-gradient(135deg, ${e.colors[0]}, ${e.colors[1]})` }}
                >
                  {isLive ? (
                    <Radio className="absolute left-2.5 top-2.5 h-4 w-4 text-white" />
                  ) : (
                    <Video className="absolute left-2.5 top-2.5 h-4 w-4 text-white/80" />
                  )}
                  <span className="absolute right-2.5 top-2.5 rounded-full bg-navy-deep/70 px-2 py-0.5 text-[8px] font-bold text-white">
                    {t(e.metaKey)}
                  </span>
                  {isLive && (
                    <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-orange-brand px-2 py-0.5 text-[8px] font-bold text-white">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      {t("sections.liveNow")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-semibold">{t(e.key)}</p>
                    <p className={cn("mt-0.5 text-[8.5px] font-medium uppercase tracking-wide", v.muted)}>
                      {t(`events.cat${e.cat === "trn" ? "Training" : e.cat === "gen" ? "General" : "Social"}`)}
                    </p>
                  </div>
                  {tab === "upcoming" ? (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1 text-[9px] font-bold",
                        isLive ? "bg-orange-brand text-white" : "border border-teal-brand/50 text-teal-300"
                      )}
                    >
                      {t("sections.join")}
                    </span>
                  ) : (
                    <span className={cn("flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-[9px] font-semibold", v.line, v.subtle)}>
                      <Play className="h-2.5 w-2.5" />
                      {t("sections.recording")}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}

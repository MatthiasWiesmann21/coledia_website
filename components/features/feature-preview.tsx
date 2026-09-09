"use client";

import * as React from "react";
import {
  CheckCircle2,
  FileText,
  Folder,
  Heart,
  MessageCircle,
  Play,
  Repeat2,
  Send,
  Smile,
  Timer,
  Users,
  Video,
} from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { TimeSpendingChart, StatsRing } from "@/components/dashboard-preview/charts";

type ModuleKey = "dashboard" | "courses" | "news" | "events" | "chat" | "documents";

type ExtraKey = "admin" | "payments";

const label: Record<ModuleKey | ExtraKey, string> = {
  dashboard: "Dashboard",
  courses: "Courses",
  news: "News",
  events: "Live Events",
  chat: "Chat",
  documents: "Documents",
  admin: "Admin Panel",
  payments: "Payments",
};

/* ---------- shared bits ---------- */

function Bar({ w, delay, color = "bg-teal-brand" }: { w: string; delay: number; color?: string }) {
  return (
    <motion.div
      className={cn("h-1.5 rounded-full", color)}
      initial={{ width: 0 }}
      whileInView={{ width: w }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
    />
  );
}

/* ---------- Dashboard ---------- */

function DashboardPreview() {
  const stats = [
    { icon: Timer, label: "In progress", value: "06", color: "text-teal-300 bg-teal-brand/15" },
    { icon: CheckCircle2, label: "Completed", value: "08", color: "text-green-brand bg-green-brand/15" },
    { icon: Play, label: "Watch time", value: "24h", color: "text-orange-brand bg-orange-brand/15" },
    { icon: Users, label: "Online", value: "142", color: "text-blue-brand bg-blue-brand/15" },
  ];
  const rows = [
    { color: "#008080", progress: 76 },
    { color: "#1F78B4", progress: 42 },
    { color: "#31A354", progress: 88 },
  ];

  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl bg-white/5 p-2"
          >
            <div className={cn("mb-1 flex h-6 w-6 items-center justify-center rounded-full", s.color)}>
              <s.icon className="h-3 w-3" />
            </div>
            <p className="text-[7px] text-white/50">{s.label}</p>
            <p className="text-xs font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-5 gap-2">
        <div className="col-span-3 rounded-xl bg-white/5 p-3">
          <p className="mb-2 text-[8px] font-semibold text-white/60">Time spending</p>
          <TimeSpendingChart />
        </div>
        <div className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-white/5 p-3">
          <StatsRing />
          <div className="flex flex-col gap-1.5 text-[7px]">
            {[
              { c: "#31A354", l: "Done", p: "20%" },
              { c: "#1F78B4", l: "Active", p: "30%" },
              { c: "#F59E0B", l: "New", p: "40%" },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.c }} />
                <span className="text-white/60">{s.l}</span>
                <span className="ml-auto font-bold">{s.p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-white/5 p-3">
        {rows.map((r, i) => (
          <div key={i} className="mb-1.5 flex items-center gap-2 last:mb-0">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded" style={{ backgroundColor: `${r.color}33` }}>
              <Play className="h-2 w-2" style={{ color: r.color }} />
            </div>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <Bar w={`${r.progress}%`} delay={0.4 + i * 0.1} />
            </div>
            <span className="text-[7px] text-white/40">{r.progress}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Courses ---------- */

function CoursesPreview() {
  const courses = [
    { colors: ["#008080", "#2AA99B"], progress: 76, price: "CHF 20" },
    { colors: ["#1F78B4", "#5FA9DC"], progress: 42, price: "CHF 35" },
    { colors: ["#31A354", "#63B985"], progress: 100, price: "CHF 18" },
    { colors: ["#E6550D", "#F28A3D"], progress: 24, price: "CHF 30" },
  ];
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="flex gap-1.5">
        {["All", "UI/UX", "Training"].map((c, i) => (
          <span
            key={c}
            className={cn(
              "rounded-full px-2.5 py-1 text-[8px] font-semibold",
              i === 0 ? "bg-teal-brand text-white" : "bg-white/8 text-white/60"
            )}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-2 gap-2.5">
        {courses.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="overflow-hidden rounded-xl bg-white/5"
          >
            <div
              className="relative aspect-video w-full"
              style={{ backgroundImage: `linear-gradient(135deg, ${c.colors[0]}, ${c.colors[1]})` }}
            >
              <div className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <Play className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="absolute right-1.5 top-1.5 rounded-full bg-navy-deep/70 px-1.5 py-0.5 text-[6px] font-bold text-white">
                {c.price}
              </span>
            </div>
            <div className="p-2">
              <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <Bar w={`${c.progress}%`} delay={0.3 + i * 0.08} />
              </div>
              <div className="h-1.5 w-3/4 rounded-full bg-white/10" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------- News ---------- */

function NewsPreview() {
  const posts = [
    { color: "#008080", name: "Club Board", likes: 24, comments: 3 },
    { color: "#E6550D", name: "Sarah M.", likes: 18, comments: 1 },
    { color: "#31A354", name: "Mentoring", likes: 31, comments: 0 },
  ];
  return (
    <div className="flex h-full flex-col gap-2.5 p-5">
      <div className="flex gap-1.5">
        {["All", "Announcements", "Updates"].map((c, i) => (
          <span
            key={c}
            className={cn(
              "rounded-full px-2.5 py-1 text-[8px] font-semibold",
              i === 0 ? "bg-teal-brand text-white" : "bg-white/8 text-white/60"
            )}
          >
            {c}
          </span>
        ))}
      </div>
      {posts.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="rounded-xl bg-white/5 p-3"
        >
          <div className="flex gap-2">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
              style={{ backgroundColor: p.color }}
            >
              {p.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[8px]">
                <span className="font-bold">{p.name}</span>{" "}
                <span className="text-white/40">@{p.name.toLowerCase().replace(/\s/g, "")} · 2h</span>
              </p>
              <div className="mt-1 space-y-1">
                <div className="h-1.5 w-full rounded-full bg-white/10" />
                <div className="h-1.5 w-4/5 rounded-full bg-white/10" />
              </div>
              <div className="mt-2 flex items-center gap-3 border-t border-white/8 pt-1.5">
                <span className="flex items-center gap-1 text-[7px] text-white/50">
                  <Heart className="h-2.5 w-2.5" /> {p.likes}
                </span>
                <span className="flex items-center gap-1 text-[7px] text-white/50">
                  <MessageCircle className="h-2.5 w-2.5" /> {p.comments}
                </span>
                <span className="flex items-center gap-1 text-[7px] text-white/50">
                  <Repeat2 className="h-2.5 w-2.5" /> 3
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- Events ---------- */

function EventsPreview() {
  const events = [
    { colors: ["#008080", "#2AA99B"], live: true, meta: "Today 18:00" },
    { colors: ["#1F78B4", "#5FA9DC"], live: false, meta: "Fri 20:00" },
    { colors: ["#31A354", "#63B985"], live: false, meta: "Sat 14:00" },
  ];
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="flex gap-1.5">
        {["Upcoming", "Past"].map((c, i) => (
          <span
            key={c}
            className={cn(
              "rounded-full px-2.5 py-1 text-[8px] font-semibold",
              i === 0 ? "bg-teal-brand text-white" : "bg-white/8 text-white/60"
            )}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        {events.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 overflow-hidden rounded-xl bg-white/5"
          >
            <div
              className="relative h-14 w-24 shrink-0"
              style={{ backgroundImage: `linear-gradient(135deg, ${e.colors[0]}, ${e.colors[1]})` }}
            >
              {e.live ? (
                <span className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded-full bg-orange-brand px-1.5 py-0.5 text-[6px] font-bold text-white">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
                  LIVE
                </span>
              ) : (
                <Video className="absolute left-1 top-1 h-3 w-3 text-white/80" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 h-1.5 w-3/4 rounded-full bg-white/15" />
              <div className="h-1 w-1/2 rounded-full bg-white/10" />
              <p className="mt-1 text-[7px] text-white/40">{e.meta}</p>
            </div>
            <span
              className={cn(
                "mr-2 shrink-0 rounded-full px-2 py-0.5 text-[7px] font-bold",
                e.live ? "bg-orange-brand text-white" : "border border-teal-brand/50 text-teal-300"
              )}
            >
              {e.live ? "Join" : "Set reminder"}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Chat ---------- */

function ChatPreview() {
  const channels = [
    { name: "general", unread: 0, active: true },
    { name: "training", unread: 2, active: false },
    { name: "board", unread: 0, active: false },
  ];
  const messages = [
    { me: false, author: "Sarah", color: "#E6550D", text: "Don't forget the meeting tomorrow!" },
    { me: true, text: "Thanks for the reminder! I'll be there." },
    { me: false, author: "Tom", color: "#1F78B4", text: "I prepared the slides already." },
  ];
  return (
    <div className="flex h-full gap-2 p-5">
      <div className="hidden w-24 shrink-0 flex-col gap-1.5 sm:flex">
        <p className="mb-1 px-1 text-[7px] font-bold uppercase tracking-widest text-white/40">Channels</p>
        {channels.map((ch) => (
          <div
            key={ch.name}
            className={cn(
              "flex items-center justify-between rounded-lg px-2 py-1.5 text-[8px] font-medium",
              ch.active ? "bg-teal-brand text-white" : "bg-white/5 text-white/60"
            )}
          >
            # {ch.name}
            {ch.unread > 0 && (
              <span className="rounded-full bg-orange-brand px-1 py-0.5 text-[6px] font-bold text-white">
                {ch.unread}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-2 overflow-hidden">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2",
                msg.me
                  ? "self-end rounded-tr-sm bg-teal-brand text-white"
                  : "self-start rounded-tl-sm bg-white/8"
              )}
            >
              {!msg.me && (
                <p className="text-[7px] font-bold text-teal-300">{msg.author}</p>
              )}
              <p className="text-[8px] leading-snug">{msg.text}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-1.5 rounded-full bg-white/8 px-2 py-1.5">
          <Smile className="h-3 w-3 shrink-0 text-white/40" />
          <div className="h-2 flex-1 rounded-full bg-white/10" />
          <Send className="h-3 w-3 shrink-0 text-orange-brand" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Documents ---------- */

function DocumentsPreview() {
  const folders = [
    { name: "Board", active: true },
    { name: "Meetings", active: false },
    { name: "Finance", active: false },
  ];
  const files = [
    { ext: "PDF", color: "#E6550D", size: "1.2 MB", w: "80%" },
    { ext: "XLSX", color: "#31A354", size: "860 KB", w: "60%" },
    { ext: "DOCX", color: "#1F78B4", size: "96 KB", w: "70%" },
    { ext: "ZIP", color: "#008080", size: "3.4 MB", w: "50%" },
  ];
  return (
    <div className="flex h-full gap-2 p-5">
      <div className="hidden w-24 shrink-0 flex-col gap-1.5 sm:flex">
        <p className="mb-1 px-1 text-[7px] font-bold uppercase tracking-widest text-white/40">Folders</p>
        {folders.map((f) => (
          <div
            key={f.name}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[8px] font-medium",
              f.active ? "bg-teal-brand text-white" : "bg-white/5 text-white/60"
            )}
          >
            <Folder className="h-3 w-3 shrink-0" style={{ color: f.active ? "white" : "#F59E0B" }} />
            {f.name}
          </div>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex gap-1.5">
          {["All", "PDF", "XLSX"].map((c, i) => (
            <span
              key={c}
              className={cn(
                "rounded-full px-2 py-0.5 text-[7px] font-semibold",
                i === 0 ? "bg-teal-brand text-white" : "bg-white/8 text-white/60"
              )}
            >
              {c}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {files.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2.5 rounded-lg bg-white/5 px-2.5 py-2"
            >
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: `${f.color}22` }}
              >
                <FileText className="h-3 w-3" style={{ color: f.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="h-1.5 rounded-full bg-white/15" style={{ width: f.w }} />
                <p className="mt-0.5 text-[6px] text-white/40">{f.size}</p>
              </div>
              <span
                className="rounded-full px-1.5 py-0.5 text-[6px] font-bold"
                style={{ backgroundColor: `${f.color}22`, color: f.color }}
              >
                {f.ext}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Admin ---------- */

function AdminPreview() {
  const users = [
    { name: "Sarah M.", role: "Admin", color: "#E6550D", active: true, progress: 85 },
    { name: "Tom K.", role: "Member", color: "#1F78B4", active: true, progress: 42 },
    { name: "Lena B.", role: "Member", color: "#31A354", active: false, progress: 100 },
    { name: "Jonas R.", role: "Moderator", color: "#008080", active: true, progress: 24 },
  ];
  const settings = [
    { label: "General", active: true },
    { label: "Members", active: false },
    { label: "Roles", active: false },
    { label: "Billing", active: false },
  ];
  return (
    <div className="flex h-full gap-2 p-5">
      <div className="hidden w-24 shrink-0 flex-col gap-1.5 sm:flex">
        <p className="mb-1 px-1 text-[7px] font-bold uppercase tracking-widest text-white/40">Settings</p>
        {settings.map((s) => (
          <div
            key={s.label}
            className={cn(
              "rounded-lg px-2 py-1.5 text-[8px] font-medium",
              s.active ? "bg-teal-brand text-white" : "bg-white/5 text-white/60"
            )}
          >
            {s.label}
          </div>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[8px] font-semibold text-white/60">User Analytics</p>
          <span className="rounded-full bg-white/8 px-2 py-0.5 text-[7px] text-white/50">4 users</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {users.map((u, i) => (
            <motion.div
              key={u.name}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2.5 rounded-lg bg-white/5 px-2.5 py-2"
            >
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[7px] font-bold text-white"
                style={{ backgroundColor: u.color }}
              >
                {u.name.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-semibold">{u.name}</p>
                <p className="text-[6px] text-white/40">{u.role}</p>
              </div>
              <div className="hidden w-16 sm:block">
                <div className="mb-0.5 text-right text-[6px] text-white/40">{u.progress}%</div>
                <div className="h-1 overflow-hidden rounded-full bg-white/10">
                  <Bar w={`${u.progress}%`} delay={0.2 + i * 0.08} />
                </div>
              </div>
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  u.active ? "bg-green-brand" : "bg-white/20"
                )}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Payments ---------- */

function PaymentsPreview() {
  const txns = [
    { course: "Figma Basics", amount: "CHF 20", status: "paid", color: "#31A354" },
    { course: "Leadership 101", amount: "CHF 35", status: "paid", color: "#31A354" },
    { course: "Excel Mastery", amount: "Free", status: "free", color: "#1F78B4" },
    { course: "Public Speaking", amount: "CHF 18", status: "pending", color: "#F59E0B" },
  ];
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
        <div>
          <p className="text-[7px] text-white/50">Total revenue</p>
          <p className="text-lg font-bold text-teal-300">CHF 1&apos;284</p>
        </div>
        <div className="text-right">
          <p className="text-[7px] text-white/50">This month</p>
          <p className="text-xs font-bold text-green-brand">+18%</p>
        </div>
      </div>
      <div className="mb-1 flex items-center gap-1.5">
        <span className="rounded-full bg-[#635BFF]/20 px-2 py-0.5 text-[7px] font-bold text-[#7A73FF]">Stripe</span>
        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[7px] text-white/50">Connected</span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        {txns.map((tx, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-2.5 rounded-lg bg-white/5 px-2.5 py-2"
          >
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: `${tx.color}22` }}
            >
              {tx.status === "free" ? (
                <span className="text-[8px] font-bold" style={{ color: tx.color }}>0</span>
              ) : (
                <span className="text-[7px] font-bold" style={{ color: tx.color }}>CHF</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[8px] font-semibold">{tx.course}</p>
              <p className="text-[6px] text-white/40">{tx.status === "paid" ? "Completed" : tx.status === "free" ? "Free course" : "Pending"}</p>
            </div>
            <span className="shrink-0 text-[8px] font-bold" style={{ color: tx.color }}>
              {tx.amount}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Export ---------- */

const PREVIEWS: Record<ModuleKey | ExtraKey, React.ComponentType> = {
  dashboard: DashboardPreview,
  courses: CoursesPreview,
  news: NewsPreview,
  events: EventsPreview,
  chat: ChatPreview,
  documents: DocumentsPreview,
  admin: AdminPreview,
  payments: PaymentsPreview,
};

export function FeaturePreview({ module }: { module: ModuleKey | ExtraKey }) {
  const Preview = PREVIEWS[module];
  return (
    <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-linear-to-br from-navy to-navy-deep">
      <Preview />
      <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between rounded-xl bg-white/8 px-3 py-2 backdrop-blur-md">
        <p className="text-[10px] font-semibold text-white/80">{label[module]}</p>
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-brand/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { FileText, Folder, FolderOpen } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { usePreview } from "@/components/dashboard-preview/preview-context";
import { EmptyState } from "@/components/dashboard-preview/pages";

const FOLDERS = [
  { key: "fBoard", nameKey: "docs.fBoard" },
  { key: "fMeetings", nameKey: "docs.fMeetings" },
  { key: "fFinance", nameKey: "docs.fFinance" },
];

const FILES = [
  { nameKey: "docs.d1", folder: "fBoard", ext: "PDF", size: "1.2 MB", date: "12.04", color: "#E6550D" },
  { nameKey: "docs.d2", folder: "fMeetings", ext: "PDF", size: "420 KB", date: "08.04", color: "#1F78B4" },
  { nameKey: "docs.d3", folder: "fFinance", ext: "XLSX", size: "860 KB", date: "02.04", color: "#31A354" },
  { nameKey: "docs.d4", folder: "fBoard", ext: "ZIP", size: "3.4 MB", date: "28.03", color: "#008080" },
  { name: "org-chart.docx", folder: "fBoard", ext: "DOCX", size: "96 KB", date: "21.03", color: "#1F78B4" },
  { name: "event-checklist.pdf", folder: "fMeetings", ext: "PDF", size: "210 KB", date: "14.03", color: "#E6550D" },
  { name: "expenses-march.xlsx", folder: "fFinance", ext: "XLSX", size: "340 KB", date: "31.03", color: "#31A354" },
];

const EXTS = ["PDF", "XLSX", "ZIP", "DOCX"];

export function DocumentsPanel() {
  const { t, v, query } = usePreview();
  const [folder, setFolder] = React.useState<string | null>(null);
  const [type, setType] = React.useState("all");

  const files = FILES.filter((f) => {
    if (folder && f.folder !== folder) return false;
    if (type !== "all" && f.ext !== type) return false;
    const name = f.nameKey ? t(f.nameKey) : f.name;
    if (query && !name!.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full gap-3">
      {/* Folder tree */}
      <div className="hidden w-32 shrink-0 flex-col gap-1 sm:flex">
        <p className={cn("mb-1 px-2 text-[9px] font-bold uppercase tracking-widest", v.faint)}>
          {t("sections.allFiles")}
        </p>
        <button
          type="button"
          onClick={() => setFolder(null)}
          className={cn(
            "flex items-center gap-2 rounded-xl px-2.5 py-2 text-[10px] font-medium transition-colors",
            folder === null ? "bg-teal-brand text-white" : cn(v.chip, "text-left")
          )}
        >
          <FolderOpen className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{t("sections.allFiles")}</span>
        </button>
        {FOLDERS.map((fo) => (
          <button
            key={fo.key}
            type="button"
            onClick={() => setFolder(fo.key)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-2.5 py-2 text-[10px] font-medium transition-colors",
              folder === fo.key ? "bg-teal-brand text-white" : cn(v.chip, "text-left")
            )}
          >
            <Folder className="h-3.5 w-3.5 shrink-0" style={{ color: "#F59E0B" }} />
            <span className="truncate">{t(fo.nameKey)}</span>
          </button>
        ))}
      </div>

      {/* Main area */}
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className={cn("text-xs font-semibold", v.subtle)}>
            {t("sections.docsHeader")}
            <span className={v.muted}>
              {" / "}
              {folder ? t(FOLDERS.find((f) => f.key === folder)!.nameKey) : t("sections.allFiles")}
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setType("all")}
              className={cn(
                "rounded-full px-2.5 py-1 text-[9px] font-semibold transition-colors",
                type === "all" ? v.chipActive : v.chip
              )}
            >
              {t("sections.all")}
            </button>
            {EXTS.map((ext) => (
              <button
                key={ext}
                type="button"
                onClick={() => setType(ext)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[9px] font-semibold transition-colors",
                  type === ext ? v.chipActive : v.chip
                )}
              >
                {ext}
              </button>
            ))}
          </div>
        </div>

        {files.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-1.5">
            {files.map((f, i) => {
              const name = f.nameKey ? t(f.nameKey) : f.name!;
              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className={cn("flex items-center gap-3 rounded-xl px-3 py-2", v.card)}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${f.color}22` }}
                  >
                    <FileText className="h-3.5 w-3.5" style={{ color: f.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-semibold">{name}</p>
                    <p className={cn("text-[8.5px]", v.muted)}>
                      {f.size} · {f.date}
                    </p>
                  </div>
                  <span className={cn("hidden sm:inline text-[9px]", v.faint)}>
                    {t(FOLDERS.find((fo) => fo.key === f.folder)!.nameKey)}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[8px] font-bold"
                    style={{ backgroundColor: `${f.color}22`, color: f.color }}
                  >
                    {f.ext}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

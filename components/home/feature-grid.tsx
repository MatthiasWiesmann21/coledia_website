"use client";

import {
  BarChart3,
  CalendarClock,
  FileText,
  GraduationCap,
  MessagesSquare,
  Newspaper,
} from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

type FeatureLabels = {
  kicker: string;
  title: string;
  subtitle: string;
  items: { title: string; text: string }[];
};

export function FeatureGrid({ labels }: { labels: FeatureLabels }) {
  const icons = [GraduationCap, Newspaper, CalendarClock, FileText, MessagesSquare, BarChart3];

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-brand">
            {labels.kicker}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {labels.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{labels.subtitle}</p>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {labels.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <StaggerItem key={item.title}>
                <div className="group h-full rounded-3xl border border-border bg-card p-7 transition-all hover:border-teal-brand/40 hover:shadow-xl hover:shadow-teal-brand/5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-brand/12 text-blue-brand transition-colors group-hover:bg-teal-brand group-hover:text-white">
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}

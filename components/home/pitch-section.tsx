"use client";

import { HandHeart, PiggyBank, SmilePlus } from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

type PitchLabels = {
  kicker: string;
  title: string;
  lead: string;
  points: { title: string; text: string }[];
};

export function PitchSection({ labels }: { labels: PitchLabels }) {
  const icons = [HandHeart, PiggyBank, SmilePlus];

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-teal-brand">
            {labels.kicker}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {labels.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{labels.lead}</p>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {labels.points.map((point, i) => {
            const Icon = icons[i];
            return (
              <StaggerItem key={point.title}>
                <div className="h-full rounded-3xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-xl hover:shadow-teal-brand/10">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-brand/12 text-teal-brand">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">{point.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {point.text}
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

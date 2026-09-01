"use client";

import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/reveal";

type CtaLabels = {
  title: string;
  subtitle: string;
  button: string;
  note: string;
};

export function CtaBanner({ labels }: { labels: CtaLabels }) {
  return (
    <section className="px-4 py-20">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-navy px-6 py-16 text-center text-white sm:px-16 sm:py-20">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal-brand/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-orange-brand/25 blur-3xl" />

          <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            {labels.title}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/70">
            {labels.subtitle}
          </p>
          <Link
            href="/contact"
            className="group relative mt-8 inline-flex h-13 items-center gap-2 rounded-full bg-orange-brand px-8 text-base font-semibold text-white shadow-lg shadow-orange-brand/40 transition-all hover:-translate-y-0.5 hover:bg-[#d14a0a]"
          >
            {labels.button}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="relative mt-4 text-xs font-medium text-white/50">{labels.note}</p>
        </div>
      </Reveal>
    </section>
  );
}

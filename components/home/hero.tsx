"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

import { Link } from "@/i18n/navigation";

type HeroLabels = {
  badge: string;
  titleA: string;
  titleB: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  stats: { value: string; label: string }[];
};

export function Hero({ labels }: { labels: HeroLabels }) {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-16 sm:pt-24">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-208 max-w-none -translate-x-1/2 rounded-full bg-teal-brand/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-40 -z-10 h-72 w-72 rounded-full bg-blue-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-24 -z-10 h-72 w-72 rounded-full bg-orange-brand/10 blur-3xl" />

      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-brand/30 bg-teal-brand/10 px-4 py-1.5 text-xs font-semibold text-teal-brand dark:text-teal-300"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {labels.badge}
        </motion.div>

        <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="block"
          >
            {labels.titleA}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="text-brand-gradient block"
          >
            {labels.titleB}
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
        >
          {labels.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/contact"
            className="group inline-flex h-13 items-center gap-2 rounded-full bg-orange-brand px-8 text-base font-semibold text-white shadow-lg shadow-orange-brand/30 transition-all hover:-translate-y-0.5 hover:bg-[#d14a0a] hover:shadow-orange-brand/45"
          >
            {labels.ctaPrimary}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/features"
            className="inline-flex h-13 items-center rounded-full border-2 border-border px-8 text-base font-semibold transition-all hover:-translate-y-0.5 hover:bg-muted"
          >
            {labels.ctaSecondary}
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="mx-auto mt-14 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
          {labels.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card px-6 py-4"
            >
              <p className="text-brand-gradient text-2xl font-extrabold">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

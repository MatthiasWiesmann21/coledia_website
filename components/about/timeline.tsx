"use client";

import { motion } from "motion/react";

import { Reveal } from "@/components/motion/reveal";

type Milestone = { year: string; title: string; text: string };

export function Timeline({ title, milestones }: { title: string; milestones: Milestone[] }) {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <Reveal className="mb-12 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
        </Reveal>

        <div className="relative">
          <motion.div
            className="absolute left-5 top-0 h-full w-0.5 origin-top bg-linear-to-b from-teal-brand via-blue-brand to-orange-brand sm:left-1/2"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
          <div className="flex flex-col gap-10">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                className={`relative flex gap-6 pl-14 sm:w-1/2 sm:pl-0 ${
                  i % 2 === 0
                    ? "sm:pr-12 sm:text-right"
                    : "sm:ml-auto sm:pl-12"
                }`}
              >
                <span
                  className={`absolute left-5 top-1 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-teal-brand ring-4 ring-teal-brand/20 ${
                    i % 2 === 0
                      ? "sm:left-auto sm:right-0 sm:translate-x-1/2"
                      : "sm:left-0 sm:-translate-x-1/2"
                  }`}
                />
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <span className="text-xs font-extrabold tracking-widest text-orange-brand">
                    {m.year}
                  </span>
                  <h3 className="mt-1 font-bold">{m.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

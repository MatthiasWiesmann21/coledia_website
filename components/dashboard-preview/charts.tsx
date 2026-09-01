"use client";

import { motion } from "motion/react";

const POINTS = [
  { x: 0, y: 150 },
  { x: 60, y: 80 },
  { x: 120, y: 110 },
  { x: 180, y: 70 },
  { x: 240, y: 85 },
  { x: 300, y: 45 },
  { x: 360, y: 25 },
];

const PATH = `M ${POINTS.map((p) => `${p.x},${p.y}`).join(" L ")}`;

export function TimeSpendingChart() {
  return (
    <svg viewBox="0 0 360 170" className="h-40 w-full">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F78B4" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#008080" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1F78B4" />
          <stop offset="100%" stopColor="#2AA99B" />
        </linearGradient>
      </defs>
      {[150, 116, 82, 48].map((y) => (
        <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="currentColor" strokeOpacity="0.08" />
      ))}
      <motion.path
        d={`${PATH} L 360,170 L 0,170 Z`}
        fill="url(#areaGradient)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        viewport={{ once: true }}
      />
      <motion.path
        d={PATH}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
        viewport={{ once: true }}
      />
      {POINTS.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#008080"
          stroke="#fff"
          strokeWidth="2"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.3 + i * 0.12 }}
          viewport={{ once: true }}
        />
      ))}
    </svg>
  );
}

const RING_SEGMENTS = [
  { value: 20, color: "#31A354" },
  { value: 30, color: "#1F78B4" },
  { value: 40, color: "#F59E0B" },
];

export function StatsRing() {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="10" />
        {RING_SEGMENTS.map((seg, i) => {
          const length = (seg.value / 90) * circumference;
          const currentOffset = RING_SEGMENTS.slice(0, i).reduce(
            (sum, s) => sum + (s.value / 90) * circumference,
            0
          );
          return (
            <motion.circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${length} ${circumference - length}`}
              initial={{ strokeDashoffset: -currentOffset }}
              whileInView={{ strokeDashoffset: -currentOffset }}
              viewport={{ once: true }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold">22</span>
      </div>
    </div>
  );
}

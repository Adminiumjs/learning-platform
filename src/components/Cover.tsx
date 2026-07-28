/*
 * Cover — the procedural "image" system.
 *
 * The app loads no bitmaps and plays no video (spec 20 D9). Every course
 * cover, lesson thumbnail and player surface is three stacked gradients
 * derived from a per-course hex tint, with an oversized Lucide icon and a
 * mono filename chip so it reads as media without pretending to be any.
 *
 * How the tint gets in without breaking the no-raw-hex rule
 * --------------------------------------------------------
 * The tint is data — it lives on the course record, and a customer editing
 * a course in the generated dashboard would change it. So it arrives as the
 * `--tint` CSS custom property (the design system's sanctioned escape hatch
 * for dynamic values) and every alpha step is a `color-mix()` in the
 * stylesheet. No screen ever writes a colour literal, and the light/dark
 * treatments live in CSS where they belong.
 */

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./Icon";

export interface CoverProps {
  /** Hex tint from the course record. */
  tint: string;
  /** Kebab-case Lucide name for the oversized glyph. */
  icon: string;
  /** Glyph size in px. */
  iconSize?: number;
  /** Gradient angle; the comp uses 156deg for cards and 168deg for the player. */
  angle?: string;
  /** Mono filename chip, e.g. "lesson_03_grids.mp4". */
  filename?: string;
  className?: string;
  children?: ReactNode;
}

/** The big gradient surface — course covers and the lesson player shell. */
export function Cover({
  tint,
  icon,
  iconSize = 56,
  angle = "156deg",
  filename,
  className,
  children,
}: CoverProps) {
  return (
    <div
      className={`lp-cover${className ? ` ${className}` : ""}`}
      style={{ "--tint": tint, "--cover-angle": angle } as CSSProperties}
    >
      <Icon name={icon} size={iconSize} className="lp-cover__glyph" />
      {filename ? <span className="lp-cover__file">{filename}</span> : null}
      {children}
    </div>
  );
}

export interface CoverChipProps {
  tint: string;
  icon: string;
  /** "sm" 40 · "md" 52 · "lg" 62. */
  size?: "sm" | "md" | "lg";
  iconSize?: number;
  className?: string;
}

/** The small tinted square that precedes a course row. */
export function CoverChip({ tint, icon, size = "md", iconSize, className }: CoverChipProps) {
  const fallback = size === "sm" ? 18 : size === "lg" ? 26 : 22;
  return (
    <span
      className={`lp-coverchip lp-coverchip--${size}${className ? ` ${className}` : ""}`}
      style={{ "--tint": tint } as CSSProperties}
    >
      <Icon name={icon} size={iconSize ?? fallback} className="lp-cover__glyph" />
    </span>
  );
}

/**
 * The lesson player shell.
 *
 * A play/pause button, a scrub bar and a time readout over a `Cover`. There
 * is deliberately no `<video>` element and no external media: the demo has to
 * work offline and make zero third-party requests.
 */
export interface PlayerShellProps {
  tint: string;
  icon: string;
  filename: string;
  playing: boolean;
  onTogglePlay: () => void;
  /** Playhead position, 0–1. */
  pos: number;
  onScrub: (fraction: number) => void;
  /** Pre-formatted "07:12 / 18:30". */
  time: string;
  className?: string;
}

export function PlayerShell({
  tint, icon, filename, playing, onTogglePlay, pos, onScrub, time, className,
}: PlayerShellProps) {
  const pct = `${(Math.max(0, Math.min(1, pos)) * 100).toFixed(2)}%`;

  return (
    <div
      className={`lp-player${className ? ` ${className}` : ""}`}
      style={{ "--tint": tint, "--cover-angle": "168deg" } as CSSProperties}
    >
      <Icon name={icon} size={120} className="lp-player__glyph" />

      <button
        type="button"
        className={`lp-player__play${playing ? " is-playing" : ""}`}
        onClick={onTogglePlay}
        aria-label={playing ? "Pause" : "Play"}
      >
        <Icon name={playing ? "pause" : "play"} size={30} />
      </button>

      <div className="lp-player__bar">
        <button
          type="button"
          className="lp-player__toggle"
          onClick={onTogglePlay}
          aria-label={playing ? "Pause" : "Play"}
        >
          <Icon name={playing ? "pause" : "play"} size={15} />
        </button>

        <div
          className="lp-player__scrub"
          role="slider"
          aria-label="Seek"
          aria-valuenow={Math.round(pos * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            onScrub((e.clientX - r.left) / r.width);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") onScrub(Math.min(1, pos + 0.05));
            if (e.key === "ArrowLeft") onScrub(Math.max(0, pos - 0.05));
          }}
        >
          <span className="lp-player__fill" style={{ inlineSize: pct }} />
          <span className="lp-player__knob" style={{ insetInlineStart: pct }} />
        </div>

        <span className="lp-player__time">{time}</span>
        <span className="lp-player__file">{filename}</span>
      </div>
    </div>
  );
}

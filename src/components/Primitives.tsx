/*
 * The shared primitives every screen builds from.
 *
 * These exist so 54 screens can't each invent their own button. Anything that
 * appears on more than a couple of screens lives here; anything genuinely
 * one-off stays in the screen with its own class in `screen-<view>.css`.
 *
 * House rules these enforce:
 *   • no raw hex in a screen — tone props take token names ("--pos"), and the
 *     one sanctioned escape hatch is a per-record tint passed as a CSS custom
 *     property (see `Cover`), never a colour literal in a style prop;
 *   • no inline layout — every class here is defined in components.css;
 *   • logical properties throughout, so RTL is free.
 */

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./Icon";

/* ------------------------------------------------------------------ card */

export interface CardProps {
  className?: string;
  children: ReactNode;
  /** Adds the hover-lift treatment. Use for anything clickable. */
  interactive?: boolean;
  /** Accent-tinted border and wash — the "this one matters" card. */
  accent?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Card({ className, children, interactive, accent, onClick, style }: CardProps) {
  const cls = [
    "lp-cardbox",
    interactive ? "lp-card" : "",
    accent ? "lp-cardbox--accent" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick} style={style}>
        {children}
      </button>
    );
  }
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}

/* --------------------------------------------------------------- buttons */

export interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  icon?: string;
  iconSize?: number;
  /** Icon after the label instead of before it. */
  iconEnd?: boolean;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
  /** Accessible name when the button is icon-only. */
  label?: string;
}

/** The accent-filled call to action. One per view, ideally. */
export function ButtonPrimary({
  children, onClick, icon, iconSize = 16, iconEnd, className, disabled, type = "button", title, label,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`lp-btn lp-btn--primary${className ? ` ${className}` : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={label}
    >
      {icon && !iconEnd ? <Icon name={icon} size={iconSize} /> : null}
      {children}
      {icon && iconEnd ? <Icon name={icon} size={iconSize} /> : null}
    </button>
  );
}

/** The bordered, surface-coloured button. Everything else. */
export function ButtonSecondary({
  children, onClick, icon, iconSize = 16, iconEnd, className, disabled, type = "button", title, label,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`lp-gi lp-btn--secondary${className ? ` ${className}` : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={label}
    >
      {icon && !iconEnd ? <Icon name={icon} size={iconSize} /> : null}
      {children}
      {icon && iconEnd ? <Icon name={icon} size={iconSize} /> : null}
    </button>
  );
}

/** A square icon-only button — close, menu, theme toggle. */
export function IconButton({ icon, onClick, className, title, label, iconSize = 17 }: ButtonProps & { icon: string }) {
  return (
    <button
      type="button"
      className={`lp-gi lp-iconbtn${className ? ` ${className}` : ""}`}
      onClick={onClick}
      title={title}
      aria-label={label ?? title}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
}

/* ------------------------------------------------------------------ pills */

/** Token names a pill can be toned with. */
export type Tone = "pos" | "warn" | "danger" | "info" | "accent" | "neutral";

export interface PillProps {
  children: ReactNode;
  tone?: Tone;
  icon?: string;
  iconSize?: number;
  className?: string;
}

/**
 * The soft status pill — "Answered", "Overdue", "Cohort · starts 3 Aug".
 *
 * `tone` picks a token pair (`--pos` on `--pos-soft` and so on); "neutral"
 * is the muted surface-3 treatment the comp uses for inert metadata.
 */
export function Pill({ children, tone = "neutral", icon, iconSize = 12, className }: PillProps) {
  return (
    <span className={`lp-pill lp-pill--${tone}${className ? ` ${className}` : ""}`}>
      {icon ? <Icon name={icon} size={iconSize} /> : null}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ chips */

export interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: string;
  iconSize?: number;
  className?: string;
}

/** A filter chip — the pill-shaped toggle above a list. */
export function Chip({ children, active, onClick, icon, iconSize = 14, className }: ChipProps) {
  return (
    <button
      type="button"
      className={`lp-chip lp-filterchip${active ? " is-active" : ""}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {icon ? <Icon name={icon} size={iconSize} /> : null}
      {children}
    </button>
  );
}

export function ChipRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`lp-chiprow${className ? ` ${className}` : ""}`}>{children}</div>;
}

/* ---------------------------------------------------------------- segments */

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  icon?: string;
}

export interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  className?: string;
}

/** The inset segmented control — persona switch, course mode, view toggles. */
export function Segmented<T extends string>({ options, value, onChange, label, className }: SegmentedProps<T>) {
  return (
    <div className={`lp-seg${className ? ` ${className}` : ""}`} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`lp-chip lp-seg__btn${o.id === value ? " is-active" : ""}`}
          onClick={() => onChange(o.id)}
          aria-pressed={o.id === value}
        >
          {o.icon ? <Icon name={o.icon} size={14} /> : null}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- tabs */

export interface TabOption<T extends string> {
  id: T;
  label: string;
  /** Optional mono count badge. */
  count?: number;
}

export interface TabsProps<T extends string> {
  options: TabOption<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  className?: string;
}

/** The underlined tab strip used inside the classroom and the detail panes. */
export function Tabs<T extends string>({ options, value, onChange, label, className }: TabsProps<T>) {
  return (
    <div className={`lp-tabs${className ? ` ${className}` : ""}`} role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={o.id === value}
          className={`lp-tabs__tab${o.id === value ? " is-active" : ""}`}
          onClick={() => onChange(o.id)}
        >
          {o.label}
          {o.count !== undefined ? <span className="lp-tabs__count">{o.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- avatars */

export interface AvatarProps {
  initials: string;
  /** "sm" 32 · "md" 38 · "lg" 44. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Accent-filled instead of the neutral surface — used for the instructor. */
  accent?: boolean;
  className?: string;
}

export function Avatar({ initials, size = "md", accent, className }: AvatarProps) {
  return (
    <span
      className={`lp-avatar lp-avatar--${size}${accent ? " lp-avatar--accent" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/* --------------------------------------------------------------- progress */

export interface ProgressBarProps {
  /** 0–100. */
  pct: number;
  className?: string;
  /** Tone token for the fill; defaults to the accent. */
  tone?: Tone;
  label?: string;
}

export function ProgressBar({ pct, className, tone = "accent", label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      className={`lp-bar${className ? ` ${className}` : ""}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span
        className={`lp-bar__fill lp-bar__fill--${tone}`}
        style={{ inlineSize: `${clamped}%` }}
      />
    </div>
  );
}

export interface ProgressRingProps {
  /** 0–100. */
  pct: number;
  /** "sm" 56 · "md" 62 · "lg" 132. */
  size?: "sm" | "md" | "lg";
  /** Tone token for the sweep; defaults to the accent. */
  tone?: Tone;
  children?: ReactNode;
  className?: string;
  label?: string;
}

/**
 * The conic-gradient completion ring.
 *
 * The sweep angle is the one genuinely dynamic value, passed as the
 * `--ring-deg` custom property — the colours stay in CSS.
 */
export function ProgressRing({ pct, size = "md", tone = "accent", children, className, label }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      className={`lp-ring lp-ring--${size} lp-ring--${tone}${className ? ` ${className}` : ""}`}
      style={{ "--ring-deg": `${clamped * 3.6}deg` } as CSSProperties}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span className="lp-ring__inner">{children ?? `${clamped}%`}</span>
    </div>
  );
}

/* ------------------------------------------------------------- stat tiles */

export interface StatTileProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: string;
  tone?: Tone;
  onClick?: () => void;
  className?: string;
}

export function StatTile({ label, value, sub, icon, tone = "accent", onClick, className }: StatTileProps) {
  const body = (
    <>
      {icon ? (
        <span className={`lp-stat__ico lp-stat__ico--${tone}`}>
          <Icon name={icon} size={18} />
        </span>
      ) : null}
      <span className="lp-stat__label">{label}</span>
      <span className="lp-stat__value">{value}</span>
      {sub ? <span className="lp-stat__sub">{sub}</span> : null}
    </>
  );
  return onClick ? (
    <button type="button" className={`lp-stat lp-card${className ? ` ${className}` : ""}`} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className={`lp-stat${className ? ` ${className}` : ""}`}>{body}</div>
  );
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`lp-statgrid${className ? ` ${className}` : ""}`}>{children}</div>;
}

/* ------------------------------------------------------------ empty state */

export interface EmptyStateProps {
  icon: string;
  title: string;
  body?: ReactNode;
  action?: { label: string; onClick: () => void; icon?: string };
  className?: string;
  /** Compact variant for inside a card or a list. */
  inset?: boolean;
}

export function EmptyState({ icon, title, body, action, className, inset }: EmptyStateProps) {
  return (
    <div className={`lp-empty${inset ? " lp-empty--inset" : ""}${className ? ` ${className}` : ""}`}>
      <span className="lp-empty__ico">
        <Icon name={icon} size={inset ? 22 : 26} />
      </span>
      <p className="lp-empty__title">{title}</p>
      {body ? <p className="lp-empty__body">{body}</p> : null}
      {action ? (
        <ButtonSecondary icon={action.icon} onClick={action.onClick}>
          {action.label}
        </ButtonSecondary>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ forms */

export interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
  /** Renders the hint in the warn tone. */
  error?: boolean;
  className?: string;
  htmlFor?: string;
}

export function Field({ label, children, hint, error, className, htmlFor }: FieldProps) {
  return (
    <div className={`lp-field${className ? ` ${className}` : ""}`}>
      <label className="lp-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? (
        <span className={`lp-field__hint${error ? " lp-field__hint--error" : ""}`}>{hint}</span>
      ) : null}
    </div>
  );
}

export interface TextInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
  type?: string;
  className?: string;
  /** Renders the value in JetBrains Mono — card numbers, codes, times. */
  mono?: boolean;
  inputMode?: "text" | "numeric" | "email" | "decimal";
  ariaLabel?: string;
  disabled?: boolean;
}

export function TextInput({
  value, onChange, placeholder, id, type = "text", className, mono, inputMode, ariaLabel, disabled,
}: TextInputProps) {
  return (
    <input
      id={id}
      type={type}
      className={`lp-fld lp-input${mono ? " lp-input--mono" : ""}${className ? ` ${className}` : ""}`}
      value={value}
      placeholder={placeholder}
      inputMode={inputMode}
      aria-label={ariaLabel}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export interface TextAreaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
  rows?: number;
  className?: string;
  ariaLabel?: string;
}

export function TextArea({ value, onChange, placeholder, id, rows = 5, className, ariaLabel }: TextAreaProps) {
  return (
    <textarea
      id={id}
      rows={rows}
      className={`lp-fld lp-textarea${className ? ` ${className}` : ""}`}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export interface SelectFieldProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  id?: string;
  className?: string;
  ariaLabel?: string;
}

export function SelectField({ value, onChange, options, id, className, ariaLabel }: SelectFieldProps) {
  return (
    <select
      id={id}
      className={`lp-fld lp-select${className ? ` ${className}` : ""}`}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  /** Hide the visible label but keep it for screen readers. */
  hideLabel?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, hideLabel, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={hideLabel ? label : undefined}
      className={`lp-toggle${checked ? " is-on" : ""}${className ? ` ${className}` : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="lp-toggle__track">
        <span className="lp-toggle__knob" />
      </span>
      {hideLabel ? null : <span className="lp-toggle__label">{label}</span>}
    </button>
  );
}

export interface CheckRowProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: ReactNode;
  /** Round instead of square — the single-choice variant. */
  radio?: boolean;
  className?: string;
}

/** The bordered option row used by the exam, onboarding and the wizards. */
export function CheckRow({ checked, onChange, children, radio, className }: CheckRowProps) {
  return (
    <button
      type="button"
      role={radio ? "radio" : "checkbox"}
      aria-checked={checked}
      className={`lp-checkrow${checked ? " is-on" : ""}${className ? ` ${className}` : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className={`lp-checkrow__mark${radio ? " lp-checkrow__mark--radio" : ""}`}>
        {checked ? <Icon name={radio ? "circle-dot" : "check"} size={14} /> : null}
      </span>
      <span className="lp-checkrow__body">{children}</span>
    </button>
  );
}

/* ----------------------------------------------------------- file chips */

export interface AttachmentChipProps {
  name: string;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

/** The mono filename chip. Nothing downloads — there are no real files. */
export function AttachmentChip({ name, onRemove, onClick, className }: AttachmentChipProps) {
  return (
    <span className={`lp-file${className ? ` ${className}` : ""}`}>
      <Icon name="paperclip" size={13} />
      {onClick ? (
        <button type="button" className="lp-file__name lp-file__name--btn" onClick={onClick}>
          {name}
        </button>
      ) : (
        <span className="lp-file__name">{name}</span>
      )}
      {onRemove ? (
        <button type="button" className="lp-file__x" onClick={onRemove} aria-label={`Remove ${name}`}>
          <Icon name="x" size={13} />
        </button>
      ) : null}
    </span>
  );
}

/* ---------------------------------------------------------------- section */

export function SectionHead({
  title, sub, action, className,
}: {
  title: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`lp-sechead${className ? ` ${className}` : ""}`}>
      <div className="lp-sechead__text">
        <h2 className="lp-sechead__title">{title}</h2>
        {sub ? <p className="lp-sechead__sub">{sub}</p> : null}
      </div>
      {action ? <div className="lp-sechead__action">{action}</div> : null}
    </div>
  );
}

/** The page title block at the top of a screen. */
export function PageHead({
  title, lede, action, eyebrow, className,
}: {
  title: ReactNode;
  lede?: ReactNode;
  action?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`lp-pagehead${className ? ` ${className}` : ""}`}>
      <div className="lp-pagehead__text">
        {eyebrow ? <span className="lp-pagehead__eyebrow">{eyebrow}</span> : null}
        <h1 className="lp-pagehead__title">{title}</h1>
        {lede ? <p className="lp-pagehead__lede">{lede}</p> : null}
      </div>
      {action ? <div className="lp-pagehead__action">{action}</div> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- callout */

export interface CalloutProps {
  children: ReactNode;
  tone?: Tone;
  icon?: string;
  title?: ReactNode;
  className?: string;
}

/** The tinted notice block — the checkout disclaimer, the offline strip. */
export function Callout({ children, tone = "info", icon, title, className }: CalloutProps) {
  return (
    <div className={`lp-callout lp-callout--${tone}${className ? ` ${className}` : ""}`}>
      {icon ? (
        <span className="lp-callout__ico">
          <Icon name={icon} size={17} />
        </span>
      ) : null}
      <div className="lp-callout__body">
        {title ? <span className="lp-callout__title">{title}</span> : null}
        <span className="lp-callout__text">{children}</span>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- fact rows */

export function FactRow({ k, v, mono, className }: { k: ReactNode; v: ReactNode; mono?: boolean; className?: string }) {
  return (
    <div className={`lp-fact${className ? ` ${className}` : ""}`}>
      <span className="lp-fact__k">{k}</span>
      <span className={`lp-fact__v${mono ? " lp-mono" : ""}`}>{v}</span>
    </div>
  );
}

/* --------------------------------------------------------------- skeleton */

/** One shimmering block. Used while a list "reloads". */
export function Skel({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span className={`lp-skel${className ? ` ${className}` : ""}`} style={style} aria-hidden="true" />;
}

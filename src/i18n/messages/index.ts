/*
 * Message composition.
 *
 * The app's strings are authored in four area modules so they can be worked on
 * in parallel without four agents fighting over one 4,000-line file. This file
 * is the only place they meet: it flattens the areas into one bundle per
 * locale, and derives the key union from the ENGLISH objects.
 *
 * Keys are global — an area prefix (`dock.`, `catalog.`, `roster.`) is a
 * convention, not a namespace — so two areas defining the same key is a
 * last-one-wins collision rather than an error. Keep prefixes distinct.
 */
import type { Translated } from "../untranslated.ts";
import { LOCALE_TAGS, type LocaleTag } from '../locales';
import { chrome } from '../strings/chrome';
import { screensA } from '../strings/screensA';
import { screensB } from '../strings/screensB';
import { data } from '../strings/data';

/**
 * Parity guard. `en-US` defines the keys; the other seven must each carry a
 * string for every one of them. A translation module that is missing an English
 * key is a COMPILE error here rather than a silent per-key fallback to English
 * at runtime — which is the failure mode this whole layer exists to prevent.
 */
type Area<EN extends Record<string, string>> = { 'en-US': EN } & Record<
  Exclude<LocaleTag, 'en-US'>,
  Translated<EN>
>;

const AREAS: [Area<(typeof chrome)["en-US"]>, Area<(typeof screensA)["en-US"]>, Area<(typeof screensB)["en-US"]>, Area<(typeof data)["en-US"]>] = [chrome, screensA, screensB, data];
export const MESSAGES = Object.fromEntries(
  LOCALE_TAGS.map((t) => [t, Object.assign({}, ...AREAS.map((a) => a[t] ?? {}))]),
) as Record<LocaleTag, Record<string, string>>;

/** Keys are typed off English — the source of truth — so a typo is a compile error. */
export type MessageKey =
  | keyof (typeof chrome)['en-US']
  | keyof (typeof screensA)['en-US']
  | keyof (typeof screensB)['en-US']
  | keyof (typeof data)['en-US'];

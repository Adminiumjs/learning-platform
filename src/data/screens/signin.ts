/*
 * Page-local seed for sign in.
 *
 * Marketing copy for the left panel and the two social buttons. Neither
 * provider is wired to anything — this is a demo with no accounts and no
 * network, so each button says so in a toast.
 *
 * The buttons and their toasts are interface. "Google" is a product name and
 * stays; Ingrid's sentence is hers and stays too.
 */

import { t } from "../../i18n/ambient";

export interface SignInProvider {
  label: string;
  /** Kebab-case lucide name. */
  icon: string;
  /** What the button does instead of an auth round-trip. */
  toast: string;
  toastIcon: string;
}

export const SIGNIN_PROVIDERS: SignInProvider[] = [
  {
    get label() {
      return t("data.signin.google");
    },
    icon: "chrome",
    get toast() {
      return t("data.signin.googleToast");
    },
    toastIcon: "info",
  },
  {
    get label() {
      return t("data.signin.magicLink");
    },
    icon: "mail",
    get toast() {
      return t("data.signin.magicLinkToast");
    },
    toastIcon: "mail",
  },
];

/** The past-student quote on the left panel. */
export const TESTIMONIAL = {
  quote:
    "“I came in with a folder of components and left with a system I can defend in a meeting.”",
  name: "Ingrid Halvorsen",
  ini: "IH",
  /** "Cohort 02 · Design Systems" — the noun moves, the course name does not. */
  get cohort() {
    return t("data.signin.cohort", { no: "02", course: "Design Systems" });
  },
};

/** How long the fake sign-in spins before it lands on My learning. */
export const SIGNIN_MS = 800;

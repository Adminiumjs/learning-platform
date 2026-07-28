/*
 * Page-local seed for sign in.
 *
 * Marketing copy for the left panel and the two social buttons. Neither
 * provider is wired to anything — this is a demo with no accounts and no
 * network, so each button says so in a toast.
 */

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
    label: "Continue with Google",
    icon: "chrome",
    toast: "Demo — no provider is wired up.",
    toastIcon: "info",
  },
  {
    label: "Magic link",
    icon: "mail",
    toast: "A demo link would land in your inbox.",
    toastIcon: "mail",
  },
];

/** The past-student quote on the left panel. */
export const TESTIMONIAL = {
  quote:
    "“I came in with a folder of components and left with a system I can defend in a meeting.”",
  name: "Ingrid Halvorsen",
  ini: "IH",
  cohort: "Cohort 02 · Design Systems",
} as const;

/** How long the fake sign-in spins before it lands on My learning. */
export const SIGNIN_MS = 800;

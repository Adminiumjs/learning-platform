/*
 * Certificates — page-local seed copy.
 *
 * Five certificates awarded across cohorts 01 and 02. The wording template
 * itself is store state (`ctWording`), because the screen exists to let the
 * instructor edit it.
 */

export interface AwardedCertificate {
  /** The verification code, printed on the certificate itself. */
  id: string;
  who: string;
  at: string;
}

export const AWARDED: AwardedCertificate[] = [
  { who: "Freya Nilsen", id: "YA-CERT-1994-DS", at: "12 Jun 2026" },
  { who: "Adaeze Nwosu", id: "YA-CERT-1988-DS", at: "12 Jun 2026" },
  { who: "Ingrid Halvorsen", id: "YA-CERT-1972-TY", at: "30 May 2026" },
  { who: "Chidera Obi", id: "YA-CERT-1960-DS", at: "12 Jun 2026" },
  { who: "Nora Lindgren", id: "YA-CERT-1941-TY", at: "18 Apr 2026" },
];

/** Where a certificate's code can be checked. Nothing here makes a request. */
export const VERIFY_URL = "adminium.dev/verify";

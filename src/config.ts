export interface ContactLink {
  readonly label: string;
  readonly href: string;
  /**
   * What a plain left click does. Omit to just follow the href.
   *
   * - `copy`     — copies `href` (minus any `mailto:`) to the clipboard.
   *                Modified clicks still open the href, so `mailto:` keeps working.
   * - `download` — saves the file at `href` under `filename`.
   */
  readonly action?: "copy" | "download";
  /** Saved-as name for a `download` link. */
  readonly filename?: string;
}

export const site = {
  domain: "pratikraut.in",
  owner: "Pratik Raut",

  /** Rotating line under the title. Each one scrambles into the next. */
  phrases: [
    "site under construction",
    "Software Engineer",
    "shipping something soon",
    "thanks for stopping by",
  ],

  /** How long a resolved phrase sits before the next one glitches in, ms. */
  phraseHold: 2600,

  /** How long the title sits resolved before it re-glitches, ms. */
  titleHold: 5200,

  links: [
    {
      label: "email",
      href: "mailto:pratikraut41200.pr@gmail.com",
      action: "copy",
    },
    { label: "github", href: "https://github.com/" },
    { label: "linkedin", href: "https://www.linkedin.com/in/pratikgraut/" },
    // Served straight out of public/, so the file lives at public/resume.pdf.
    {
      label: "resume",
      href: "/resume.pdf",
      action: "download",
      filename: "Pratik-Raut-Resume.pdf",
    },
  ] as const satisfies readonly ContactLink[],
} as const;

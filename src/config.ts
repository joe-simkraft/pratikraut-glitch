export interface ContactLink {
  readonly label: string;
  readonly href: string;
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
    { label: "email", href: "mailto:hello@pratikraut.in" },
    { label: "github", href: "https://github.com/" },
    { label: "linkedin", href: "https://linkedin.com/in/" },
  ] as const satisfies readonly ContactLink[],
} as const;

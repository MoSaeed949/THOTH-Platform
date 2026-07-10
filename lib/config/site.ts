// ============================================================================
// Single source of truth for contact + brand configuration.
// Edit this file to update every place these details appear (Contact page,
// footer, support links, etc.). No code changes required elsewhere.
// ============================================================================

export const siteConfig = {
  name: "Thoth",
  /** Public-facing URL, used for canonical links / metadata if needed. */
  url: "https://thoth.study",

  contact: {
    // Displayed number, and the tel: href (digits only, with country code).
    phone: "+1 (555) 019-2834",
    phoneHref: "tel:+15550192834",

    email: "support@thoth.study",

    // WhatsApp display number and click-to-chat link (wa.me/<digits>).
    whatsapp: "+1 (555) 019-2834",
    whatsappHref: "https://wa.me/15550192834",

    // Business hours. Free-form so you can phrase it however you like.
    // (The "Business hours" label itself is translated per language.)
    hours: "Monday – Friday, 9:00 – 18:00 (GMT)",

    // Postal address. Newlines are rendered as line breaks.
    address: "1 Library Court, Suite 400\nAlexandria, 21500\nEgypt",

    // Google Maps: leave `mapEmbedUrl` empty to show a styled placeholder.
    // To enable the map later, paste the `src` from Google Maps → Share →
    // "Embed a map" here. `mapsLink` opens the location in a new tab.
    mapEmbedUrl: "",
    mapsLink: "https://www.google.com/maps/search/?api=1&query=Bibliotheca+Alexandrina",
  },

  social: {
    twitter: "https://twitter.com/",
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
  },
} as const;

export type SiteConfig = typeof siteConfig;

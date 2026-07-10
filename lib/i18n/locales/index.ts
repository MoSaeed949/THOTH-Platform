import type { Locale } from "../config";
import type { Messages } from "./en";
import { en } from "./en";
import { ar } from "./ar";
import { fr } from "./fr";
import { de } from "./de";
import { es } from "./es";

// All bundled dictionaries. Because every non-English dictionary is typed as
// `Messages`, the build fails if any of them is missing a key.
export const MESSAGES: Record<Locale, Messages> = { en, ar, fr, de, es };

export type { Messages };

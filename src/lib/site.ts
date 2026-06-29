import { DATA } from "@/data/resume";

/** Absolute site URL. Falls back to the local dev server until DATA.url is filled in. */
export const SITE_URL = (DATA.url || "http://localhost:3000").replace(/\/$/, "");

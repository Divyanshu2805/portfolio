import { DATA } from "@/data/resume";
import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = DATA.writing.title;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ eyebrow: "/blog", title: DATA.writing.title, subtitle: DATA.writing.description });
}

import { DATA } from "@/data/resume";
import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = DATA.name;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ eyebrow: "Portfolio", title: DATA.name, subtitle: DATA.description });
}

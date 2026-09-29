import { DATA } from "@/data/resume";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Dark-theme values from globals.css; OG images have no CSS variables. */
const C = {
  bg: "#0b0c0f",
  panel: "#13151a",
  line: "#272b34",
  ink: "#ecedf0",
  fog: "#9a9fab",
  dim: "#6b707c",
  acc: "#93a8ff",
  products: ["#b5e853", "#ee9458", "#e0b95a", "#45d9b3", "#ff6a5c", "#5cc8ff"],
};

/**
 * Fetch a Google font subset containing only `text`. Images render at build time,
 * so this runs once per image; offline builds fall back to the default font.
 */
async function googleFont(family: string, weight: 400 | 500 | 800, text: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    return { name: family, data: await (await fetch(src)).arrayBuffer(), weight, style: "normal" as const };
  } catch {
    return null;
  }
}

/** One card for every page: a drawing-sheet frame, a mono eyebrow, a big display title. */
export async function ogImage({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  const footer = DATA.name;
  const fonts = (
    await Promise.all([
      googleFont("Bricolage Grotesque", 800, title),
      googleFont("JetBrains Mono", 500, eyebrow + footer),
      googleFont("Geist", 400, subtitle ?? ""),
    ])
  ).filter((f) => f !== null);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: C.bg, padding: 36 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            border: `1px solid ${C.line}`,
            borderRadius: 20,
            background: C.panel,
            padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "JetBrains Mono", fontSize: 22, color: C.acc }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: C.acc }} />
            {eyebrow}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                fontFamily: "Bricolage Grotesque",
                fontSize: title.length > 40 ? 64 : 84,
                lineHeight: 1.02,
                letterSpacing: "-0.04em",
                color: C.ink,
                maxWidth: 980,
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div style={{ fontFamily: "Geist", fontSize: 28, lineHeight: 1.4, color: C.fog, maxWidth: 900 }}>{subtitle}</div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 20, color: C.dim }}>{footer}</div>
            <div style={{ display: "flex", gap: 10 }}>
              {C.products.map((c) => (
                <div key={c} style={{ width: 28, height: 6, borderRadius: 999, background: c }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}

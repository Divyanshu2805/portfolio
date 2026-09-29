import { ButtonLink } from "@/components/site/button";

export default function NotFound() {
  return (
    <main id="main" data-sheet="404" className="grid min-h-[80svh] place-items-center px-5 pt-28 pb-16 sm:px-8">
      <div className="grid max-w-md justify-items-center gap-5 text-center">
        <span className="font-mono text-[12.5px] text-acc">GET {"→"} 404</span>
        <h1 className="font-display text-[clamp(3rem,10vw,5.5rem)] leading-[0.9] font-extrabold tracking-[-0.055em]">
          Nothing here.
        </h1>
        <p className="text-[16px] leading-relaxed text-fog">This page doesn&apos;t exist, or it moved. The work is on the home page.</p>
        <ButtonLink href="/" icon="right" className="mt-2">
          Back home
        </ButtonLink>
      </div>
    </main>
  );
}

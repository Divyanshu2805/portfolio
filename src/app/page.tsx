import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Journey } from "@/components/sections/journey";
import { MoreBuilds } from "@/components/sections/more-builds";
import { Proveout } from "@/components/sections/proveout";
import { Skills } from "@/components/sections/skills";
import { Work } from "@/components/sections/work";

/** Build date, shown in the footer. */
const UPDATED = new Date().toISOString().slice(0, 10);

export default function Page() {
  return (
    <>
      <main id="main">
        <Hero />
        <Work />
        <MoreBuilds />
        <Proveout />
        <Journey />
        <Skills />
        <Contact />
      </main>
      <Footer updated={UPDATED} />
    </>
  );
}

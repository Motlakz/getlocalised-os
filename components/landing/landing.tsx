import { ArrowRight01Icon, GithubIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { CopyButton } from "@/components/playground/copy-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { COMMANDS } from "@/lib/engine/commands";
import { GITHUB_URL, PLAYGROUND_URL } from "@/lib/site";

import { HeroFlow, type HeroFlowData } from "./hero-flow";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "how-it-works", label: "How it works" },
  { id: "skills", label: "Skills & commands" },
  { id: "run-locally", label: "Run it locally" },
  { id: "boundaries", label: "What it doesn't do" },
] as const;

export function Landing({ hero, skillExcerpt }: { hero: HeroFlowData; skillExcerpt: string }) {
  return (
    <div className="min-h-screen bg-mk-bg text-mk-fg">
      <SiteHeader />
      <Hero hero={hero} />
      <div className="mx-auto grid max-w-7xl grid-cols-1 border-x border-mk-line lg:grid-cols-[220px_minmax(0,1fr)]">
        <SectionNav />
        <div className="min-w-0 lg:border-l lg:border-mk-line">
          <Overview />
          <HowItWorks />
          <Skills excerpt={skillExcerpt} />
          <RunLocally />
          <Boundaries />
        </div>
      </div>
      <Footer />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-mk-line bg-mk-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-heading text-[15px] font-bold tracking-tight">GetLocalised</span>
          <span className="font-mono text-[11px] text-mk-subtle">OS</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-mk-muted md:flex" aria-label="Sections">
          {SECTIONS.slice(0, 4).map((s) => (
            <a key={s.id} href={`#${s.id}`} className="hover:text-mk-fg">
              {s.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Button asChild variant="ghost" size="icon-sm" aria-label="GitHub repository">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              <HugeiconsIcon icon={GithubIcon} strokeWidth={1.8} />
            </a>
          </Button>
          <ThemeToggle />
          <Button asChild size="sm" className="ml-1">
            <Link href={PLAYGROUND_URL}>Playground</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero({ hero }: { hero: HeroFlowData }) {
  return (
    <section className="mx-auto max-w-7xl border-x border-b border-mk-line">
      <div className="grid grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-[0.2em] text-mk-subtle uppercase">[ open-source localization agent ]</p>
          <h1 className="mt-6 font-heading text-[clamp(2.5rem,6vw,4.6rem)] leading-[0.95] font-black tracking-tight uppercase">
            Native listings.
            <br />
            <span className="text-transparent [-webkit-text-stroke:1.5px_var(--mk-fg)]">Not translations.</span>
          </h1>
          <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-mk-muted">
            Turn one Google Play listing into a native one for every market, written in the words people there search, shaped by skills you
            can read and edit.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-11 px-5 text-[15px]">
              <Link href={PLAYGROUND_URL}>
                Open Playground
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-5 text-[15px]">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                <HugeiconsIcon icon={GithubIcon} strokeWidth={1.8} />
                GitHub
              </a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-mk-subtle">No sign-up and no key needed to try it. Bring your own Gemini or OpenAI key to run it live.</p>
        </div>
        <HeroFlow data={hero} />
      </div>
    </section>
  );
}

function SectionNav() {
  return (
    <nav aria-label="On this page" className="hidden lg:block">
      <div className="sticky top-14 space-y-1 p-6">
        <p className="mb-3 font-mono text-[11px] tracking-[0.14em] text-mk-subtle uppercase">On this page</p>
        {SECTIONS.map((s, i) => (
          <a key={s.id} href={`#${s.id}`} className="flex gap-3 py-1 text-sm text-mk-muted hover:text-mk-fg">
            <span className="font-mono text-xs text-mk-subtle">0{i + 1}</span>
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function Section({ id, index, title, lede, children }: { id: string; index: number; title: string; lede: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-14 border-b border-mk-line px-4 py-14 sm:px-8 md:py-20">
      <p className="font-mono text-xs tracking-[0.2em] text-mk-subtle uppercase">[ 0{index} ]</p>
      <h2 className="mt-4 font-heading text-[clamp(1.8rem,3.6vw,2.8rem)] leading-none font-black tracking-tight uppercase">{title}</h2>
      <p className="mt-4 max-w-2xl text-mk-muted">{lede}</p>
      <div className="mt-10">{children}</div>
    </section>
  );
}

function Overview() {
  const items = [
    {
      title: "Native, not translated",
      body: "Keeps your listing's meaning and promises, but writes it the way a local copywriter would, in the words people in that market use.",
    },
    {
      title: "Skills you can read",
      body: "Brand, audience and store rules live in plain Markdown files. Edit a skill and the output follows it. No hidden prompt to reverse-engineer.",
    },
    {
      title: "Checked against the store",
      body: "Every field is counted against Google Play's limits, search phrases are tracked field by field, and overused words are flagged.",
    },
  ];
  return (
    <Section
      id="overview"
      index={1}
      title="What it does"
      lede="GetLocalised OS is a localization agent for mobile app store listings. Give it an English Play listing and a market; it gives you a native listing, with notes on why each key word was chosen."
    >
      <ul className="grid grid-cols-1 border-t border-l border-mk-line md:grid-cols-3">
        {items.map((it, i) => (
          <li key={it.title} className="group border-r border-b border-mk-line p-5 transition-colors hover:bg-mk-fg hover:text-mk-bg">
            <span className="font-mono text-xs text-mk-subtle group-hover:text-mk-bg/60">0{i + 1}</span>
            <h3 className="mt-6 font-heading text-lg font-extrabold uppercase">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mk-muted group-hover:text-mk-bg/75">{it.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function HowItWorks() {
  const steps = [
    { name: "Listing", body: "Your English title, short description and full description." },
    { name: "Market phrases", body: "Real Google Play search suggestions for that market." },
    { name: "Skills + command", body: "Your brand, audience and store rules, plus what to do." },
    { name: "Native + findings", body: "A native listing, notes on key terms, and store checks." },
  ];
  return (
    <Section
      id="how-it-works"
      index={2}
      title="How it works"
      lede="One engine, three ways to run it: the Playground replays prepared runs with no key, runs live with your key, and the same code runs on your machine."
    >
      <ol className="grid grid-cols-1 border-t border-l border-mk-line sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.name} className="border-r border-b border-mk-line p-5">
            <span className="font-mono text-xs text-mk-subtle">0{i + 1}</span>
            <h3 className="mt-5 font-heading font-extrabold uppercase">{s.name}</h3>
            <p className="mt-2 text-sm text-mk-muted">{s.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 max-w-2xl text-sm text-mk-subtle">
        The wording comes from the model plus your skills. GetLocalised OS uses real search suggestions to know which phrases exist; it does
        not measure or estimate search volume.
      </p>
    </Section>
  );
}

function Skills({ excerpt }: { excerpt: string }) {
  return (
    <Section
      id="skills"
      index={3}
      title="Skills & commands"
      lede="A skill is a Markdown file that teaches the agent about your app. Commands reshape one field at a time, with a preview before anything changes."
    >
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="min-w-0">
          <div className="flex items-center justify-between border border-b-0 border-mk-line px-3 py-2">
            <span className="font-mono text-xs text-mk-subtle">data/examples/bellyclock/skills/brand.md</span>
          </div>
          <pre className="max-h-80 overflow-auto border border-mk-line bg-mk-raised p-4 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">
            {excerpt}
          </pre>
        </div>
        <ul className="border-t border-mk-line">
          {COMMANDS.map((c) => (
            <li key={c.id} className="flex items-baseline gap-4 border-b border-mk-line py-2.5 text-sm">
              <span className="w-40 shrink-0 font-medium">{c.label}</span>
              <span className="min-w-0 flex-1 text-mk-muted">{c.description}</span>
              <span className="font-mono text-[10px] text-mk-subtle uppercase">{c.seeded ? "no key" : "your key"}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function Code({ label, code }: { label: string; code: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between border border-b-0 border-mk-line px-3 py-1.5">
        <span className="text-xs text-mk-muted">{label}</span>
        <CopyButton text={code} label={label} />
      </div>
      <pre className="overflow-x-auto border border-mk-line bg-mk-raised p-4 font-mono text-[13px] leading-relaxed">{code}</pre>
    </div>
  );
}

function RunLocally() {
  return (
    <Section
      id="run-locally"
      index={4}
      title="Run it locally"
      lede="Clone the repo and run the same engine with your own key. Your key stays on your machine, in .env.local."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Code label="Install and start the Playground" code={`git clone ${GITHUB_URL}\ncd getlocalised-os\nbun install\nbun dev`} />
        <Code label="Add your key" code={`cp .env.example .env.local\n# then set GEMINI_API_KEY=… or OPENAI_API_KEY=…`} />
        <Code label="Localize an example app" code={`bun run localize --app bellyclock --to de-DE`} />
        <Code
          label="Your own listing, or one command on one field"
          code={`bun run localize --listing my-listing.json --to fr-FR\nbun run localize --app bellyclock --to es-ES \\\n  --command punchier --field short`}
        />
      </div>
    </Section>
  );
}

function Boundaries() {
  const does = [
    "Writes native Play Store metadata: title, short and full description",
    "Uses real Google Play search suggestions, captured and dated",
    "Follows skill files you can read, edit and version with your code",
    "Runs with your own Gemini or OpenAI key, in the browser or locally",
  ];
  const doesnt = [
    "Measure or estimate search volume, rankings or competition",
    "Upload to or connect with Google Play Console",
    "Store your key, your listings or anything about you",
    "Require an account",
  ];
  return (
    <Section
      id="boundaries"
      index={5}
      title="What it doesn't do"
      lede="Clear edges make it easier to trust. Here is exactly where GetLocalised OS stops."
    >
      <div className="grid grid-cols-1 border-t border-l border-mk-line md:grid-cols-2">
        {[
          { title: "It does", items: does },
          { title: "It doesn't", items: doesnt },
        ].map((col) => (
          <div key={col.title} className="border-r border-b border-mk-line p-5">
            <h3 className="font-heading font-extrabold uppercase">{col.title}</h3>
            <ul className="mt-4 space-y-2 text-sm text-mk-muted">
              {col.items.map((it) => (
                <li key={it} className="flex gap-2">
                  <span className="font-mono text-mk-subtle">{col.title === "It does" ? "+" : "–"}</span>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Button asChild size="lg" className="h-11 px-5 text-[15px]">
          <Link href={PLAYGROUND_URL}>
            Try it in the Playground
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 border-x border-mk-line px-4 py-8 text-sm text-mk-subtle sm:px-6">
      <span className="font-heading font-bold text-mk-fg">GetLocalised OS</span>
      <span>Open-source localization for mobile app store listings.</span>
      <span className="ml-auto flex gap-5">
        <Link href={PLAYGROUND_URL} className="hover:text-mk-fg">
          Playground
        </Link>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-mk-fg">
          GitHub
        </a>
      </span>
    </footer>
  );
}

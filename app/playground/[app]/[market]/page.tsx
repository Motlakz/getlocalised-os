import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Playground } from "@/components/playground/playground";
import { MARKET_INFO, MARKETS, type Market } from "@/lib/engine/types";
import { availableExamples, loadPlaygroundData } from "@/lib/playground-data";

/** One static page per seeded app × market; seed files are read at build time only. */
export const dynamicParams = false;

export function generateStaticParams() {
  return availableExamples().flatMap(({ app, markets }) => markets.map((market) => ({ app, market })));
}

export async function generateMetadata({ params }: PageProps<"/playground/[app]/[market]">): Promise<Metadata> {
  const { app, market } = await params;
  const data = (MARKETS as readonly string[]).includes(market) ? loadPlaygroundData(app, market as Market) : undefined;
  return { title: data ? `${data.name} in ${MARKET_INFO[data.market].language} · Playground` : "Playground" };
}

export default async function PlaygroundPage({ params }: PageProps<"/playground/[app]/[market]">) {
  const { app, market } = await params;
  if (!(MARKETS as readonly string[]).includes(market)) notFound();
  const data = loadPlaygroundData(app, market as Market);
  if (!data) notFound();
  return <Playground data={data} />;
}

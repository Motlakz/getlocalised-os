/** Small function-word lists, enough to keep repetition findings about content words. */
const LISTS: Record<string, string> = {
  en: "a an and are as at be but by can do for from has have how in into is it its more of on or our so than that the their them then there these they this to up use was we what when which while who will with you your all any each every just only also about over after before not no yes very",
  de: "der die das den dem des ein eine einen einem einer eines und oder aber als auch auf aus bei bis damit dass du dein deine deinen deinem deiner dich dir durch für hat haben ich im in ist ja mit nach nicht noch nur ob sich sie sind so über um uns unser von vor was wenn wie wir wird zu zum zur jede jeden jeder alle alles mehr sehr ohne",
  fr: "le la les un une des et ou mais pour par avec sans dans sur sous de du au aux ce ces cette ton ta tes votre vos notre nos que qui quoi est sont être avoir a as tu te toi vous nous il elle ils elles se son sa ses en ne pas plus très tout tous toute toutes comme",
  es: "el la los las un una unos unas y o pero para por con sin en sobre de del al que quien es son ser estar está tu tus te ti tú su sus nuestro nuestra se lo le les no más muy todo todos toda todas como cada",
};

const cache = new Map<string, Set<string>>();

export function stopwords(lang: string): Set<string> {
  const key = lang.slice(0, 2);
  if (!cache.has(key)) cache.set(key, new Set((LISTS[key] ?? LISTS.en).split(" ")));
  return cache.get(key)!;
}

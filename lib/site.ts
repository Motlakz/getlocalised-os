export const GITHUB_URL = "https://github.com/Motlakz/getlocalised-os";
export const SITE_URL = "https://dev.getlocalised.com";
/** The example the landing page replays, and where "Open Playground" lands. */
export const HERO_EXAMPLE = { app: "bellyclock", market: "de-DE" } as const;
export const PLAYGROUND_URL = `/playground/${HERO_EXAMPLE.app}/${HERO_EXAMPLE.market}` as const;

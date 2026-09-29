import { redirect } from "next/navigation";

/** The Playground opens on BellyClock → German, the example the landing page replays. */
export default function PlaygroundIndex() {
  redirect("/playground/bellyclock/de-DE");
}

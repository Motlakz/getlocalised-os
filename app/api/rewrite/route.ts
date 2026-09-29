import { errorResponse, parseBody, requireKeyHeader, RewriteRequest } from "@/lib/api";
import { createProvider, EngineError, getCommand, rewriteField } from "@/lib/engine";

/** Model calls can take a while, especially "Variants" on a full description. */
export const maxDuration = 60;

/**
 * One field + one command → previews, with the visitor's own key.
 * The key is read from the request header, used for this call only, and never logged or returned.
 */
export async function POST(req: Request) {
  try {
    const key = requireKeyHeader(req);
    const body = await parseBody(req, RewriteRequest);
    const command = getCommand(body.command);
    if (!command) throw new EngineError("bad_input", `Unknown command "${body.command}".`);

    const previews = await rewriteField({
      field: body.field,
      text: body.text,
      sourceText: body.sourceText,
      market: body.market,
      skills: body.skills,
      phrases: body.phrases,
      command,
      freeText: body.freeText,
      provider: createProvider(body.provider, key),
    });
    return Response.json({ previews });
  } catch (err) {
    return errorResponse(err);
  }
}

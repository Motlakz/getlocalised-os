import { errorResponse, LocalizeRequest, parseBody, requireKeyHeader } from "@/lib/api";
import { createProvider, localizeListing } from "@/lib/engine";

export const maxDuration = 60;

/**
 * A pasted English listing → native listing, with the visitor's own key.
 * The key is read from the request header, used for this call only, and never logged or returned.
 */
export async function POST(req: Request) {
  try {
    const key = requireKeyHeader(req);
    const body = await parseBody(req, LocalizeRequest);
    const result = await localizeListing({
      source: body.listing,
      market: body.market,
      skills: body.skills,
      phrases: [],
      provider: createProvider(body.provider, key),
    });
    return Response.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}

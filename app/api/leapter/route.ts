import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy to the Leapter MCP endpoint.
 *
 * Keeps the LEAPTER_API_KEY secret — it is never sent to the browser.
 *
 * POST body shape:
 *   {
 *     tool: string;          // Leapter tool name
 *     arguments: object;     // Tool-specific arguments
 *   }
 *
 * Response shape (from Leapter):
 *   { calculatedTotalPoints: number; awardedBadge: string }
 *   or whatever the specific tool returns.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.LEAPTER_API_KEY;
  const mcpUrl = process.env.LEAPTER_MCP_URL;

  if (!apiKey || !mcpUrl) {
    return NextResponse.json(
      { error: 'Leapter is not configured. Check LEAPTER_API_KEY and LEAPTER_MCP_URL in .env.local.' },
      { status: 500 }
    );
  }

  // Parse the incoming request body
  let body: { tool: string; arguments: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body.tool || !body.arguments) {
    return NextResponse.json(
      { error: 'Request must include "tool" and "arguments" fields.' },
      { status: 400 }
    );
  }

  // Build the JSON-RPC 2.0 payload for Leapter
  const jsonRpcPayload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: body.tool,
      arguments: body.arguments,
    },
  };

  // Forward to Leapter
  let leapterResponse: Response;
  try {
    leapterResponse = await fetch(mcpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(jsonRpcPayload),
    });
  } catch (err) {
    console.error('[Leapter] Network error calling MCP endpoint:', err);
    return NextResponse.json({ error: 'Failed to reach Leapter MCP.' }, { status: 502 });
  }

  if (!leapterResponse.ok) {
    const text = await leapterResponse.text();
    console.error(`[Leapter] Non-OK response (${leapterResponse.status}):`, text);
    return NextResponse.json(
      { error: `Leapter returned status ${leapterResponse.status}.` },
      { status: 502 }
    );
  }

  // Leapter returns JSON-RPC; extract the result content
  const jsonRpc = await leapterResponse.json();

  if (jsonRpc.error) {
    console.error('[Leapter] JSON-RPC error:', jsonRpc.error);
    return NextResponse.json({ error: jsonRpc.error.message || 'Leapter error.' }, { status: 500 });
  }

  // The tool result is nested inside result.content[0].text as a JSON string
  const rawContent: string = jsonRpc.result?.content?.[0]?.text ?? '{}';
  let parsedResult: Record<string, unknown>;
  try {
    parsedResult = JSON.parse(rawContent);
  } catch {
    console.error('[Leapter] Could not parse tool result text:', rawContent);
    return NextResponse.json({ error: 'Unexpected Leapter response format.' }, { status: 500 });
  }

  return NextResponse.json(parsedResult);
}

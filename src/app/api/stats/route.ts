import { MongoClient } from "mongodb";
import { SITE } from "@/config/site";

// Read-only window onto the stats the crank saves in MongoDB (database "president2028",
// collection "stats", document "current"). Set MONGODB_URI in Vercel to a read-only user.
// The burned total is read straight from the chain instead, so every burn (the crank's or a
// manual one) shows up right away. Responses are cached at Vercel's edge for 30 seconds.

export const dynamic = "force-dynamic";

const CACHE = "public, s-maxage=30, stale-while-revalidate=120";
const RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

// Reused across invocations of a warm function.
let client: Promise<MongoClient> | null = null;

function connect(uri: string) {
  client ??= new MongoClient(uri, { maxPoolSize: 1, serverSelectionTimeoutMS: 5_000 })
    .connect()
    .catch((e) => {
      client = null;
      throw e;
    });
  return client;
}

async function readDoc(): Promise<Record<string, unknown> | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  try {
    const db = (await connect(uri)).db("president2028");
    return await db.collection<{ _id: string }>("stats").findOne({ _id: "current" }, { projection: { _id: 0 } });
  } catch {
    return null;
  }
}

// Every pump.fun coin starts with exactly 1,000,000,000 tokens (6 decimals); what's missing from
// the supply now has been burned.
async function burnedOnChain(mint: string): Promise<number | null> {
  try {
    const res = await fetch(RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getTokenSupply", params: [mint] }),
      signal: AbortSignal.timeout(4_000),
      cache: "no-store",
    });
    const amount = (await res.json())?.result?.value?.amount;
    if (typeof amount !== "string") return null;
    const burned = BigInt("1000000000000000") - BigInt(amount);
    return burned > BigInt(0) ? Number(burned) / 1e6 : 0;
  } catch {
    return null;
  }
}

export async function GET() {
  const doc = await readDoc();
  const coins = Array.isArray(doc?.coins) ? (doc.coins as { mint?: string; main?: boolean }[]) : [];
  const mint = SITE.mainMint || coins.find((c) => c.main)?.mint;
  const burned = mint ? await burnedOnChain(mint) : null;
  if (!doc && burned === null) return Response.json({ error: "no stats yet" }, { status: 404, headers: { "Cache-Control": CACHE } });
  return Response.json({ ...doc, ...(burned === null ? {} : { totalBurned: burned }) }, { headers: { "Cache-Control": CACHE } });
}

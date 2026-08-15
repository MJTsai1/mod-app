import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getUserSession();
  return NextResponse.json({
    discordUsername: session?.discordUsername ?? null,
  });
}

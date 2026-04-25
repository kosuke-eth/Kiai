import { NextResponse } from "next/server"

import { getAdminSession } from "@/lib/admin-auth"

export async function GET() {
  return NextResponse.json(await getAdminSession())
}

import { syncExistingUsers } from "@/lib/sync-users";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await syncExistingUsers();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing users:", error);
    return NextResponse.json({ error: "Failed to sync users" }, { status: 500 });
  }
} 
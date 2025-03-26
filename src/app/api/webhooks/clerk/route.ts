import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { ConvexClient } from "convex/browser";
import { v } from "convex/values";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  if (eventType === "user.created") {
    const { id, first_name, last_name, email_addresses, image_url } = evt.data;

    // Get the primary email
    const primaryEmail = email_addresses?.[0]?.email_address;

    if (!primaryEmail) {
      return new Response("No email address found", { status: 400 });
    }

    // Create a Convex client
    const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Call the syncUser mutation
    await convex.mutation(api.users.syncUser, {
      name: `${first_name || ""} ${last_name || ""}`.trim() || "Anonymous",
      email: primaryEmail,
      clerkId: id,
      image: image_url,
    });
  }

  return new Response("Success", { status: 200 });
} 
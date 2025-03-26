import { ConvexClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export async function syncExistingUsers() {
  const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  
  // Get all users from Clerk
  const response = await fetch("https://api.clerk.dev/v1/users", {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  });
  
  const users = await response.json();
  
  // Sync each user to Convex
  for (const user of users.data) {
    const primaryEmail = user.email_addresses?.[0]?.email_address;
    if (!primaryEmail) continue;
    
    await convex.mutation(api.users.syncUser, {
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Anonymous",
      email: primaryEmail,
      clerkId: user.id,
      image: user.image_url,
    });
  }
} 
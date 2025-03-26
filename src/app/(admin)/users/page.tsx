"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LoaderUI from "@/components/LoaderUI";
import toast from "react-hot-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";

type User = Doc<"users">;

export default function UsersPage() {
  const router = useRouter();
  const { isInterviewer, isLoading } = useUserRole();
  const users = useQuery(api.users.getUsers);
  const updateUserRole = useMutation(api.users.updateUserRole);

  if (isLoading) return <LoaderUI />;
  if (!isInterviewer) {
    router.push("/");
    return null;
  }

  const handleRoleUpdate = async (clerkId: string, newRole: "candidate" | "interviewer") => {
    try {
      await updateUserRole({ clerkId, role: newRole });
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  if (!users) {
    return (
      <div className="container mx-auto py-10">
        <LoaderUI />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user: User) => (
          <Card key={user._id} className="hover:shadow-md transition-all">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image} />
                  <AvatarFallback>
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={user.role === "interviewer" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={user.role === "candidate" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoleUpdate(user.clerkId, "candidate")}
                >
                  Set as Candidate
                </Button>
                <Button
                  variant={user.role === "interviewer" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoleUpdate(user.clerkId, "interviewer")}
                >
                  Set as Interviewer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
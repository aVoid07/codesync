import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Doc } from "../../convex/_generated/dataModel";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type User = Doc<"users">;

export default function UserRoleToggle({ user }: { user: User }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateUserRole = useMutation(api.users.updateUserRole);

  const handleRoleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateUserRole({
        clerkId: user.clerkId,
        role: user.role === "candidate" ? "interviewer" : "candidate",
      });
      toast.success(`User role updated to ${user.role === "candidate" ? "interviewer" : "candidate"}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user role");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRoleUpdate}
      disabled={isUpdating}
      className="ml-2"
    >
      {isUpdating ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : (
        `Set as ${user.role === "candidate" ? "Interviewer" : "Candidate"}`
      )}
    </Button>
  );
} 
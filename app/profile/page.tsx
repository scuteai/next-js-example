"use server";
import { Profile } from "@/components/profile/profile";

export default async function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <Profile />
    </div>
  );
}

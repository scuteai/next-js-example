"use server";
import { Profile } from "@/components/profile/profile";

export default async function ProfilePage() {
  return (
    <div className="container mx-auto">
      <Profile />
    </div>
  );
}

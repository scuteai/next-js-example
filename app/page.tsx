"use server";
import { Auth } from "@/components/auth/auth";

export default async function Home() {
  return <Auth />;
}

import HeroSection from "@/components/hero";
import { Navbar } from "@/components/navbar";
import MainLayout from "@/layout/main-layout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/apps");
  }

  return (
    <HydrateClient>
      <MainLayout>
        <Navbar />
        <HeroSection />
      </MainLayout>
    </HydrateClient>
  );
}

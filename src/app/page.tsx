import HeroSection from "@/components/hero";
import { Navbar } from "@/components/navbar";
import MainLayout from "@/layout/main-layout";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/apps");
  }

  return (
    <MainLayout>
      <Navbar />
      <HeroSection />
    </MainLayout>
  );
}

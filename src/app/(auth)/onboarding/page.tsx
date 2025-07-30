import { auth } from "@/lib/auth";
import OnboardingView from "@/views/onboarding";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding - Get Started",
  description: "Complete your onboarding process to get started with the application",
  robots: "noindex, nofollow",
};

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <OnboardingView />;
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Leaf, ShieldCheck, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/ui/footer";
import { useRouter } from "next/navigation";

const features = [
  {
    value: "step1",
    icon: <Leaf className="w-8 h-8 text-green-500" />,
    title: "GHG ISCC Calculation",
    desc: "Green house gas",
  },
  {
    value: "step2",
    icon: <Zap className="w-8 h-8 text-blue-500" />,
    title: "Gas Karbon",
    desc: "Perhitungan emisi gas karbon",
  },
  {
    value: "step3",
    icon: <ShieldCheck className="w-8 h-8 text-yellow-500" />,
    title: "Other",
    desc: "Kasus Lainnya",
  },
];

const Welcome = () => {
  const router = useRouter();

  const goDashboard = (value: string) => {
    switch (value) {
      case "step1":
        router.push("/apps/carbon-emission/iscc/dashboard");
        break;
      case "step2":
        router.push("/apps/carbon-emission/carbon/dashboard");
        break;
      case "step3":
        router.push("/apps/carbon-emission/other/dashboard");
        break;
      default:
        router.push("/apps");
    }
  };

  return (
    <motion.section
      className="min-h-screen flex flex-col text-gray-900 mb-16"
      style={{ minHeight: "100vh" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="bg-gradient-to-b from-blue-700 via-sky-700 to-white">
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px- mt-35">
          <section className="text-center pb-12">
            <div className="mt-12">
              <h1 className="text-4xl md:text-5xl font-bold drop-shadow-md text-white">
                Carbon Emission Calculator
              </h1>
              <p className="mt-4 text-lg max-w-2xl mx-auto leading-relaxed text-white">
                Inovasi terbaru dalam pengelolaan dan distribusi gas yang ramah
                lingkungan dan efisien.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {features.map((item) => (
                <motion.div
                  key={item.value}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 180 }}
                >
                  <Card
                    className="cursor-pointer rounded-3xl shadow-md hover:shadow-2xl transition-all bg-white border border-gray-200"
                    onClick={() => goDashboard(item.value)}
                  >
                    <div className="flex justify-center my-4">{item.icon}</div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {item.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">{item.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </motion.section>
  );
};

export default Welcome;

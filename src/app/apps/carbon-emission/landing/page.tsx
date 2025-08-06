"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Footer } from "@/components/ui/footer";
import { ChevronRight } from "lucide-react";

const LandingPage = () => {
  const router = useRouter();

  return (
    <main className="bg-gradient-to-b from-blue-500 via-sky-500 to-blue-200 text-gray-800 min-h-screen">
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 pt-35 pb-20 gap-12">
        <div className="text-center md:text-left md:w-1/2">
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-sm"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Jelajahi Dunia <br />
            <span className="text-yellow-500">Carbon Emission</span>
          </motion.h1>
          <p className="mt-4 text-gray-600 text-lg max-w-xl leading-relaxed">
            Temukan solusi inovatif dan ramah lingkungan untuk masa depan
            berkelanjutan.
          </p>
          <Button
            onClick={() => router.push("/apps/carbon-emission/welcome")}
            className="mt-8 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full flex items-center gap-2 shadow mx-auto md:mx-0"
          >
            Mulai Sekarang <ChevronRight />
          </Button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="/images/co2-logo.svg"
            alt="Ilustrasi Emisi Karbon"
            width={400}
            height={400}
            className="drop-shadow-xl w-full max-w-sm sm:max-w-md h-auto"
          />
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default LandingPage;

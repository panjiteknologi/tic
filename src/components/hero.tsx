"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BVLogo, ScofLogo, SgsLogo, TSILogo } from "../../public";
import Image from "next/image";

const HeroSection = () => {
  // State for card hover effects
  const [hoveredCard, setHoveredCard] = useState<null | number>(null);

  // Feature card data
  const features = [
    {
      id: 1,
      title: "TSI",
      description: "TSI Sertifikasi Internasional",
      icon: TSILogo,
    },
    {
      id: 2,
      title: "SGS",
      description: "SGS Description",
      icon: SgsLogo,
    },
    {
      id: 3,
      title: "BV",
      description: "BV Description",
      icon: BVLogo,
    },
    {
      id: 4,
      title: "SCOF",
      description: "SCOF Description",
      icon: ScofLogo,
    },
  ];

  return (
    <div className="relative overflow-hidden py-16">
      {/* New Release Tag */}
      <div className="flex justify-center mb-6">
        <div className="inline-block px-4 py-1 border border-gray-300 text-sm font-medium rounded-md bg-white">
          Hi Welcome!
        </div>
      </div>

      {/* Hero Title and Description with Gradient Behind */}
      <div className="relative text-center max-w-4xl mx-auto mb-16">
        {/* Centered Gradient Behind Title */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-gradient-animation rounded-full opacity-70 filter blur-xl"></div>

        <div className="relative z-10">
          <h1 className="text-3xl sm:text-7xl font-black tracking-tight text-gray-900 mb-6">
            Testing Inpection & Certification
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Powered by Dharma Mitra Solusi
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.id}
            className="transition-all duration-500 ease-out"
            style={{
              transform:
                hoveredCard === feature.id
                  ? "translateY(-10px)"
                  : "translateY(0)",
              boxShadow:
                hoveredCard === feature.id
                  ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            }}
            onMouseEnter={() => setHoveredCard(feature.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardHeader className="pb-0 pt-6">
              <div className="mx-auto">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  style={{
                    width: feature?.icon === BVLogo ? 80 : 50,
                    height: 50,
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <CardTitle className="text-xl text-center">
                {feature.title}
              </CardTitle>

              <p className="text-gray-600">{feature.description}</p>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <a
                href="#"
                className="inline-flex items-center text-gray-900 font-medium hover:text-gray-700 transition-colors"
              >
                See more
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* CSS for the animated gradient background */}
      <style jsx>{`
        .bg-gradient-animation {
          background: linear-gradient(
            45deg,
            #ee7752,
            #e73c7e,
            #23a6d5,
            #23d5ab
          );
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  BarChart3,
  Database,
  FileText,
  Globe2,
  Landmark,
  Leaf,
  Shield,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Footer } from '@/components/ui/footer';
import { useRouter } from 'next/navigation';

const features = [
  {
    key: 'iscc',
    icon: <Leaf className="w-8 h-8 text-green-500" />,
    title: 'GHG ISCC Calculation',
    desc: 'Green house gas',
    href: '/apps/carbon-emission/iscc/dashboard'
  },
  {
    key: 'iscc-ai',
    icon: <Sparkles className="w-8 h-8 text-purple-500" />,
    title: 'GHG ISCC Calculation (AI)',
    desc: 'Green house gas dengan perhitungan berbasis AI',
    href: '/apps/carbon-emission/iscc-ai/dashboard'
  },
  {
    key: 'carbon',
    icon: <Zap className="w-8 h-8 text-blue-500" />,
    title: 'Gas Karbon',
    desc: 'Perhitungan emisi gas karbon',
    href: '/apps/carbon-emission/carbon/dashboard'
  },
  {
    key: 'ipcc',
    icon: <Globe2 className="w-8 h-8 text-sky-600" />,
    title: 'IPCC',
    desc: 'Pedoman inventaris gas rumah kaca global dari IPCC.',
    href: '/apps/carbon-emission/ipcc/dashboard'
  },
  {
    key: 'defra',
    icon: <Landmark className="w-8 h-8 text-emerald-600" />,
    title: 'DEFRA',
    desc: 'Faktor emisi resmi Department for Environment, Food & Rural Affairs UK.',
    href: '/apps/carbon-emission/defra/dashboard'
  },
  {
    key: 'ghg-protocol',
    icon: <BarChart3 className="w-8 h-8 text-indigo-600" />,
    title: 'GHG Protocol',
    desc: 'Standar akuntansi gas rumah kaca yang diakui internasional.'
  },
  {
    key: 'iso-14064-1-2018',
    icon: <BadgeCheck className="w-8 h-8 text-violet-600" />,
    title: 'ISO 14064 1-2018',
    desc: 'Kerangka verifikasi emisi gas rumah kaca untuk organisasi.'
  },
  {
    key: 'pas-2050',
    icon: <FileText className="w-8 h-8 text-orange-500" />,
    title: 'PAS 2050',
    desc: 'Metodologi penilaian jejak karbon produk dan layanan.'
  },
  {
    key: 'usepa',
    icon: <Shield className="w-8 h-8 text-cyan-600" />,
    title: 'USEPA',
    desc: 'Data faktor emisi dari United States Environmental Protection Agency.'
  },
  {
    key: 'ecolnven',
    icon: <Database className="w-8 h-8 text-teal-600" />,
    title: 'Ecolnven',
    desc: 'Database inventaris siklus hidup Ecolnven untuk analisis emisi.'
  }
];

const Welcome = () => {
  const router = useRouter();

  return (
    <motion.section
      className="min-h-screen flex flex-col text-gray-900 mb-16"
      style={{ minHeight: '100vh' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
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
              {features.map((item) => {
                const clickable = Boolean(item.href);
                return (
                  <motion.div
                    key={item.key}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 180 }}
                  >
                    <Card
                      className={`rounded-3xl px-2 shadow-md transition-all bg-white border border-gray-200 ${
                        clickable
                          ? 'cursor-pointer hover:shadow-2xl'
                          : 'cursor-default'
                      }`}
                      onClick={() => {
                        if (item.href) {
                          router.push(item.href);
                        }
                      }}
                    >
                      <div className="flex justify-center my-4">
                        {item.icon}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {item.title}
                      </h2>
                      <p className="text-gray-600 text-sm mb-4">{item.desc}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </motion.section>
  );
};

export default Welcome;

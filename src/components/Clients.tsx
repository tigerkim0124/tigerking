import { motion } from 'motion/react';

const clients = [
  "현대자동차",
  "KOTRA",
  "국방기술품질원",
  "대구광역시",
  "교촌 F&B",
  "한국농어촌공사",
  "기획재정부",
  "방위사업청",
  "HMGMA",
  "글로벌 프로젝트"
];

export default function Clients() {
  return (
    <section className="py-24 border-y border-black/5 overflow-hidden bg-white relative">
      <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-white to-transparent z-10" />
      
      <div className="max-w-7xl mx-auto px-6 mb-12 flex items-center justify-between">
        <span className="font-mono text-[10px] text-black/30 uppercase tracking-[0.3em]">공공 및 민간 분야의 신뢰받는 파트너</span>
      </div>

      <div className="flex gap-20 items-center">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
          className="flex gap-20 whitespace-nowrap"
        >
          {[...clients, ...clients].map((client, index) => (
            <div
              key={index}
              className="text-3xl md:text-5xl font-display font-bold text-black/10 hover:text-black/40 transition-colors uppercase tracking-tighter"
            >
              {client}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

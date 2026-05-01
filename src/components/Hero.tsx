import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const BACKGROUND_IMAGES = [
  "https://lh3.googleusercontent.com/d/119fww8ag6yp2gXTmzANOm12fba3M0_fp",
  "https://lh3.googleusercontent.com/d/1SrN0delqq88m2P0ZtIS7Ous7glsRLrSF",
  "https://lh3.googleusercontent.com/d/1EnoWjJUX3GpeIMJT5vWrtEGMcvB3r-yl",
  "https://lh3.googleusercontent.com/d/11lRZDrqVddFc5x9TnO_qp3WzGFt2VC8A",
  "https://lh3.googleusercontent.com/d/1OZOp4rXdAuxwF0HV8QDfveRK_KhytvaO"
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5800); // 10% faster (6.5s -> 5.8s)
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-white isolate">
      {/* Background Elements - Absolute lowest layer */}
      <div className="absolute inset-0 -z-10 bg-white">
        {/* User Requested Hero Background Images with Gradual Zoom Transition */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ 
                opacity: (BACKGROUND_IMAGES[currentIndex] === "https://lh3.googleusercontent.com/d/11lRZDrqVddFc5x9TnO_qp3WzGFt2VC8A" || 
                         BACKGROUND_IMAGES[currentIndex] === "https://lh3.googleusercontent.com/d/1OZOp4rXdAuxwF0HV8QDfveRK_KhytvaO") 
                         ? 0.22 : 0.20,
                scale: 1.0
              }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ 
                opacity: { duration: 0.5, ease: "linear" }, // Snappy transition to remove dissolve feel
                scale: { duration: 10, ease: "linear" }
              }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url("${BACKGROUND_IMAGES[currentIndex]}")` }}
            />
          </AnimatePresence>
        </div>
        {/* Technical Grid Strategy - Darkened for visibility */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:100px_100px]" />
        
        {/* AI Processing Simulation: Pulsing Center Glow - Lightened */}
        <motion.div 
          animate={{ 
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-brand/5 blur-[120px] rounded-full pointer-events-none"
        />

        {/* Technical Hud Markers - Minimalist approach */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <div className="absolute top-1/2 left-6 w-3 h-[1px] bg-black/40" />
          <div className="absolute top-1/2 right-6 w-3 h-[1px] bg-black/40" />
          <div className="absolute top-6 left-1/2 w-[1px] h-3 bg-black/40" />
          <div className="absolute bottom-6 left-1/2 w-[1px] h-3 bg-black/40" />
        </div>
      </div>

      {/* Overlay Content - Placed at the very front */}
      <div className="relative z-50 max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="font-display font-bold leading-[0.9] tracking-[-0.05em] text-black mb-48 flex flex-col items-center">
            <span className="text-[0.85rem] md:text-[1.06rem] lg:text-[1.27rem] mb-4 text-black/85 font-display font-bold tracking-[-0.05em] [word-spacing:-0.15em] translate-y-[5px]">
              AI + KOREA + CONTENTS
            </span>
            <span className="text-[2.48rem] md:text-[3.73rem] lg:text-[7.04rem] font-black tracking-[-0.07em] leading-none">
              AIK <span className="text-brand">CONTENTS</span>
            </span>
          </h1>
          
          <div className="flex flex-col items-center mt-20">
            <div className="bg-brand/85 px-2 py-[0.53rem] rounded-full shadow-lg backdrop-blur-sm">
              <p className="text-[0.79rem] md:text-[0.89rem] lg:text-[0.97rem] text-white font-display font-medium tracking-normal">
                - <span className="font-bold text-[0.85rem] md:text-[0.97rem] lg:text-[1.08rem] tracking-normal">AI기술</span>에 <span className="font-bold text-[0.85rem] md:text-[0.97rem] lg:text-[1.08rem] tracking-normal">따뜻한 사람</span>의 <span className="font-bold text-[0.85rem] md:text-[0.97rem] lg:text-[1.08rem] tracking-normal">감성</span>을 더합니다 -
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

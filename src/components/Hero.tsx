import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-white isolate">
      {/* Background Elements - Absolute lowest layer */}
      <div className="absolute inset-0 -z-10 bg-white">
        {/* User Requested Hero Background Image */}
        <div 
          className="absolute inset-0 opacity-15 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/d/1SrN0delqq88m2P0ZtIS7Ous7glsRLrSF")' }}
        />
        {/* Technical Grid Strategy */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:100px_100px]" />
        
        {/* AI Processing Simulation: Pulsing Center Glow */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-brand/5 blur-[120px] rounded-full pointer-events-none"
        />

        {/* Media Frame Scanning (Media Symbolism) */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`frame-${i}`}
            initial={{ opacity: 0, scale: 0.8, x: "-10%", y: "-10%" }}
            animate={{ 
              opacity: [0, 0.1, 0],
              scale: [0.8, 1.1, 0.8],
              x: ["-10%", "10%", "-10%"],
              y: ["-10%", "10%", "-10%"]
            }}
            transition={{ 
              duration: 15 + i * 5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 4
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[25vw] border border-black/20 rounded-xl"
            style={{ rotate: `${i * 15}deg` }}
          />
        ))}

        {/* Neural Network: Dynamic Connecting Lines */}
        <div className="absolute inset-0 opacity-[0.05]">
          <svg className="w-full h-full">
            <motion.path
              d="M 100 200 Q 400 100 700 300 T 1200 200"
              fill="transparent"
              stroke="black"
              strokeWidth="1"
              strokeDasharray="5,5"
              animate={{ strokeDashoffset: [0, -50] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
              d="M 0 500 Q 500 400 900 600 T 1500 500"
              fill="transparent"
              stroke="black"
              strokeWidth="0.5"
              strokeDasharray="10,10"
              animate={{ strokeDashoffset: [0, 100] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </div>

        {/* Processing Vertical Streams */}
        <div className="absolute inset-0 flex justify-around opacity-[0.04] pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={`stream-${i}`} className="w-[1px] h-full bg-black relative overflow-hidden">
              <motion.div
                animate={{ y: ["-100%", "200%"] }}
                transition={{ 
                  duration: 10 + i * 2, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: i * 1.5
                }}
                className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-transparent via-black to-transparent"
              />
            </div>
          ))}
        </div>

        {/* Technical Hud Markers */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <div className="absolute top-20 left-20 flex flex-col gap-1 text-[8px] font-mono text-black">
            <span>[ SYSTEM: OPERATIONAL ]</span>
            <span>[ LATENCY: 2ms ]</span>
            <span>[ CORE_AI_ACTIVE ]</span>
          </div>
          <div className="absolute bottom-20 right-20 flex flex-col gap-1 text-[8px] font-mono text-black text-right">
            <span>[ RESOLUTION: 8K_DYNAMIC ]</span>
            <span>[ FPS: 120 ]</span>
            <span>[ SCAN_NORMAL ]</span>
          </div>
          {/* Edge Crosshair Markers */}
          <div className="absolute top-1/2 left-6 w-3 h-[1px] bg-black/40" />
          <div className="absolute top-1/2 right-6 w-3 h-[1px] bg-black/40" />
          <div className="absolute top-6 left-1/2 w-[1px] h-3 bg-black/40" />
          <div className="absolute bottom-6 left-1/2 w-[1px] h-3 bg-black/40" />
        </div>

        {/* Dynamic Data Nodes */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`node-${i}`}
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.05, 0.15, 0.05],
                y: [0, -40, 0]
              }}
              transition={{ 
                duration: 5 + Math.random() * 5, 
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              className="absolute w-1 h-1 bg-black rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Overlay Content - Placed at the very front */}
      <div className="relative z-50 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center"
        >
          <h1 className="font-display font-bold leading-[0.9] tracking-[-0.05em] text-black mb-8 flex flex-col items-center">
            <span className="text-[1.215rem] md:text-[1.51875rem] lg:text-[1.8225rem] mb-4 text-[#5e5e5e]/90 font-ethno font-normal tracking-normal">
              AI+KOREA+CONTENTS
            </span>
            <span className="text-[2.76rem] md:text-[4.14rem] lg:text-[7.82rem] font-black tracking-[-0.07em] leading-none">
              AIK <span className="text-brand">CONTENTS</span>
            </span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-3xl mx-auto text-[0.92rem] md:text-[1.04rem] lg:text-[1.17rem] text-black/80 font-display font-medium leading-relaxed tracking-normal"
          >
            - 우리는 <span className="font-bold text-[1.01rem] md:text-[1.14rem] lg:text-[1.29rem]">AI기술의 정점에서 따뜻한 사람의 감성</span>을 더합니다 -<br className="hidden md:block" />
            - 우리는 <span className="font-bold text-[1.06rem] md:text-[1.20rem] lg:text-[1.35rem] text-black">따뜻한 디지털 영상 경험</span>을 설계합니다 -
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="pt-14 flex flex-col sm:flex-row items-center justify-center gap-6 pointer-events-auto"
          >
            <a 
              href="#portfolio"
              className="w-full sm:w-auto px-12 py-5 bg-white text-black font-bold uppercase tracking-widest transition-all rounded-full border-3 border-white hover:bg-[#0c468c] hover:text-white shadow-xl shadow-black/5"
            >
              포트폴리오 보기
            </a>
            <a 
              href="#contact"
              className="w-full sm:w-auto px-12 py-5 bg-white text-black font-bold uppercase tracking-widest transition-all rounded-full border-3 border-white hover:bg-[#cb7004] hover:text-white shadow-xl shadow-black/5"
            >
              제작 문의하기
            </a>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}

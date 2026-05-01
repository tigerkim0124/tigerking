import { motion } from 'motion/react';
import { ArrowUpRight, Zap, Edit3, Camera, Sparkles } from 'lucide-react';

const services = [
  {
    icon: <Zap size={24} />,
    title: "대형 시네마 프로젝트에서 AI영상까지",
    content: "기획부터 AI 생성까지, 브랜드 메시지를 극대화하는 수준 높은 커스텀 광고를 제작합니다.",
    tag: "영상제작",
    bgImage: "https://lh3.googleusercontent.com/u/0/d/1SUXYnX8jSPNRfZfT_XzV0tXYRHfQEceg",
    isDark: true
  },
  {
    icon: <Edit3 size={24} />,
    title: "AI 비디오 에디팅",
    content: "기존 소스에 AI 효과, 음악, 목소리들을 접목하여 더욱 화려하고 감각적인 영상미를 구현합니다.",
    tag: "후반 작업",
    bgImage: "https://lh3.googleusercontent.com/u/0/d/1by2oDov7BuUdTlenMo9FyHM5ggTA1s45",
    isDark: true
  },
  {
    icon: <Camera size={24} />,
    title: "AI 시네마 & 콘텐츠",
    content: "독자적인 시나리오와 AI 기술을 결합하여 시네마틱한 감성을 담은 오리지널 콘텐츠를 제작합니다.",
    tag: "오리지널",
    bgImage: "https://lh3.googleusercontent.com/u/0/d/1I9F-KD2X19ZGjnuJaPwbBJ8f2JsDVAK1",
    isDark: true
  },
  {
    icon: <Sparkles size={24} />,
    title: "중소기업 & 소상공인을 위한 영상서비스",
    content: "소상공인 및 중소기업을 위해 제작 장벽을 낮춘 초저가 AI 영상 제작 패키지를 제공합니다.",
    tag: "SME 특별 플랜",
    bgImage: "https://lh3.googleusercontent.com/u/0/d/1Pm77MYSd94kIy4210G1dXUYO1Fz5xtEJ",
    isDark: true
  }
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <span className="font-sans font-medium text-brand text-sm uppercase tracking-[-0.02em] block mb-4">01 // Services</span>
            <h2 className="text-5xl md:text-6xl font-display font-bold tracking-tighter uppercase text-black">주요 서비스</h2>
          </div>
          <p className="text-[#676868] max-w-md text-[14.84px] font-sans font-medium tracking-[-0.02em] leading-relaxed">
            AIK 콘텐츠는 고도화된 AI 파이프라인을 통해 <br />
            모든 예산 범위에서 최상의 영상 솔루션을 제안합니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-black/5 border border-black/5">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group p-10 transition-all duration-500 relative overflow-hidden ${service.isDark || service.bgImage ? 'bg-black text-white' : 'bg-white hover:bg-brand/5 text-black'}`}
            >
              {service.bgImage && (
                <div className="absolute inset-0 z-0">
                  <img 
                    src={service.bgImage} 
                    alt={service.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-700" />
                </div>
              )}
              <div className={`relative z-10 ${service.isDark ? 'text-white' : 'text-black'}`}>
                <div 
                  className={`${service.isDark ? 'text-white' : 'text-brand'} mb-8 group-hover:scale-110 transition-transform duration-500`}
                  aria-hidden="true"
                >
                  {service.icon}
                </div>
                <div className={`text-[10px] font-sans ${service.isDark ? 'text-white' : 'text-black/30'} uppercase font-bold ${service.tag === 'SME 특별 플랜' ? 'tracking-[-0.02em]' : 'tracking-widest'} mb-2 drop-shadow-md`}>
                  {service.tag}
                </div>
                <h3 className="text-xl font-display font-bold mb-4 tracking-[-0.02em] leading-tight text-accent drop-shadow-lg">
                  {service.title}
                </h3>
                <p className={`text-sm ${service.isDark ? 'text-white/80' : 'text-black/50'} leading-relaxed font-medium mb-8 tracking-[-0.03em] drop-shadow-md`}>
                  {service.content}
                </p>
              </div>
              
              <div className={`absolute bottom-10 right-10 ${service.isDark ? 'text-white/40' : 'opacity-10'} group-hover:opacity-100 group-hover:text-brand transition-all`}>
                <ArrowUpRight size={24} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

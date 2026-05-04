import { motion } from 'motion/react';
import { History, Cpu, Film, FileDown } from 'lucide-react';

const strengths = [
  {
    icon: <History className="text-[#c47801]" size={32} />,
    title: "오로지 영상과 함께 해 온 삶",
    description: "TVCF부터 글로벌 대형 프로젝트까지, 10년 이상 검증된 전문 연출팀의 노하우를 보유하고 있습니다."
  },
  {
    icon: <Cpu className="text-[#c47801]" size={32} />,
    title: "독자적 AI 파이프라인",
    description: "제작 기간 단축과 비용 절감을 실현하는 동시에, 표현의 한계를 허무는 AI 기술을 실무에 적용합니다."
  },
  {
    icon: <Film className="text-[#c47801]" size={32} />,
    title: "누구나 가질 수 있는 시네마 퀄리티",
    description: "합리적 가격의 AI 고품질 후보정과 연출로 영화 같은 느낌을 보장합니다."
  }
];

export default function About() {
  return (
    <section id="about" className="relative pt-20 pb-12 bg-white border-y border-black/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="font-sans font-medium text-brand text-sm uppercase tracking-[-0.02em] block mb-4">02 // ABOUT</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-8 tracking-[-0.05em] text-black">
              PROFESSIONALISM <br />
              <span className="opacity-20">MEETS</span> INNOVATION
            </h2>
            <div className="h-px w-20 bg-brand mb-8" />
            <p className="text-[0.9rem] text-black leading-relaxed max-w-xl font-sans font-medium tracking-[-0.022em] [word-spacing:-0.02em]">
              AIK 콘텐츠는 영상 제작의 본질인 '전문성'과 시대의 흐름인 '혁신'이 만나는 지점에 있습니다. 우리는 AI와 10년 이상 쌓아온 대한민국(KOREA) 스텝진의 경험이 만나 새로운 시각적 상상 그리고 따뜻한 안정감을 선사합니다.
              <br /><br />
              <span className="text-[1.1rem] font-bold text-black">"세상이 변해도 영상과 이야기는 남습니다."</span>
            </p>

            <motion.a
              href="https://drive.google.com/file/d/1gaHH-IXFsqvp1j9vFyjXJ10fxJ0LJ1PR/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 mt-10 p-1 group no-underline"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-11 h-11 rounded-full bg-black/5 flex items-center justify-center text-black group-hover:bg-brand group-hover:text-white transition-all duration-300 border border-black/5">
                <FileDown size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.75rem] font-sans font-bold text-black/40 uppercase tracking-wider leading-none mb-1">Company Profile</span>
                <span className="text-[1rem] font-sans font-bold text-black group-hover:text-brand transition-colors duration-300 tracking-tighter">회사소개서 다운로드</span>
              </div>
            </motion.a>
          </motion.div>

          <div className="grid gap-12">
            {strengths.map((item, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="mt-1">{item.icon}</div>
                <div>
                  <h3 className="text-[1.3rem] font-sans font-bold mb-2 tracking-[-0.1em] text-[#c47801] [word-spacing:-0.06em]">{item.title}</h3>
                  <p className="text-black text-[0.94rem] leading-relaxed font-medium tracking-[-0.033em] [word-spacing:-0.055em]">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

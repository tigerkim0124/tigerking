import { motion } from 'motion/react';

const projects = [
  {
    title: "DSEC Brand Film",
    client: "DSEC - Agency : 아트판타지아",
    category: "글로벌 프로젝트",
    videoUrl: "https://www.youtube.com/embed/XLDSiqB6uvk",
    highlight: "글로벌 프로젝트 규모의 연출 및 실행"
  },
  {
    title: "홍수예경보시스템(AI 홍보영상)",
    client: "한국농어촌공사 - Agency : 위디비",
    category: "정부/공공기관",
    videoUrl: "https://www.youtube.com/embed/7Sh6bBAApLY",
    highlight: "공공 섹터의 신뢰도를 높이는 AI 연출"
  },
  {
    title: "사이버위협 능동대응 시스템(AI 영화)",
    client: "방위사업청 / 한국전자통신연구원 - Agency : 이글루코퍼레이션",
    category: "AI 시네마 광고",
    videoUrl: "https://www.youtube.com/embed/WtGx3bUFXSA",
    highlight: "국방 분야에 특화된 시네마적 감성"
  },
  {
    title: "2025 대한민국 예산안(AI 활용)",
    client: "재정경제부 - Agency : 프레인글로벌",
    category: "비주얼 프로모",
    videoUrl: "https://www.youtube.com/embed/ooBS3NxGE1Y",
    highlight: "강렬한 브랜드 임팩트 선사"
  },
  {
    title: "USG공유대학2.0(AI 홍보영상)",
    client: "경상국립대학교 RISE사업단 - Agency : 아트판타지아",
    category: "산업 기술 홍보",
    videoUrl: "https://www.youtube.com/embed/oB2vHRMtV-w",
    highlight: "첨단 물류 시스템의 시각화"
  },
  {
    title: "배달쑤맨(AI 활용)",
    client: "대구광역시 - Agency : 인성데이타",
    category: "브랜드 필름",
    videoUrl: "https://www.youtube.com/embed/jrrlHPVjhws",
    highlight: "지속 가능한 미래 에너지 가치 전달"
  },
  {
    title: "현대자동차 메타플랜트 아메리카(HMGMA)",
    client: "현대자동차 - Agency : 아트판타지아",
    category: "정부 프로젝트",
    videoUrl: "https://www.youtube.com/embed/8mZYPmPVXTM",
    highlight: "미래 도시의 청사진을 그리는 시각화"
  },
  {
    title: "어떤 선택을 하시겠습니까?",
    client: "사행산업통합감독위원회 - Agency : 팟빵",
    category: "브랜드 홍보",
    videoUrl: "https://www.youtube.com/embed/uSoU1KIodMI",
    highlight: "글로벌 시장의 혁신을 알리는 고감도 영상"
  }
];

const aiProducts = [
  {
    title: "AI애니메이션 광고",
    client: "AI상품예시",
    category: "AI 영상 상품",
    videoUrl: "https://www.youtube.com/embed/XFYng730qO0",
    highlight: "최신 AI 기술이 집약된 시네마틱 연출"
  },
  {
    title: "AI브랜드 광고",
    client: "AI상품예시",
    category: "AI 영상 상품",
    videoUrl: "https://www.youtube.com/embed/BmfxnWELGZ8",
    highlight: "자연스러운 AI 목소리와 결합된 정교한 인터뷰"
  },
  {
    title: "AI상품광고",
    client: "AI상품예시",
    category: "AI 영상 상품",
    videoUrl: "https://www.youtube.com/embed/B3oUmhq3JO0",
    highlight: "커머스에 특화된 고효율 AI 영상 제작"
  },
  {
    title: "AI소상공인 광고",
    client: "AI상품예시",
    category: "AI 영상 상품",
    videoUrl: "https://www.youtube.com/embed/NwLAqC_fbuo",
    highlight: "바이럴에 최적화된 트렌디한 AI 영상"
  }
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <span className="font-sans font-medium text-brand text-sm uppercase tracking-[-0.02em] block mb-4">03 // Track Record</span>
            <h2 className="text-5xl md:text-6xl font-display font-bold tracking-[-0.05em] uppercase text-black">포트폴리오</h2>
          </div>
          <p className="text-[#676868] max-w-md text-[14.84px] font-sans font-medium tracking-[-0.02em] leading-relaxed">
            AIK 콘텐츠는 글로벌 프로젝트, 정부기관, 대기업 및 <br />
            대형 제작사, 대행사와 함께 한 역량을 가지고 있습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative aspect-video overflow-hidden mb-6 bg-black">
                <iframe 
                  src={project.videoUrl}
                  title={project.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-sans font-bold mb-1 text-black group-hover:text-[#0c468c] transition-colors tracking-[-0.02em]">{project.title}</h3>
                  <p className="text-black/40 text-sm font-sans font-medium uppercase tracking-[-0.02em]">{project.client}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-black/20 uppercase tracking-[-0.02em] font-sans font-medium">Portfolio</p>
                </div>
              </div>
              
              <div className="mt-4 h-px w-full bg-black/5 group-hover:bg-brand transition-colors duration-500" />
            </motion.div>
          ))}
        </div>

        <div id="ai-products" className="mt-32 pt-20 border-t border-black/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <span className="font-sans font-medium text-brand text-sm uppercase tracking-[-0.02em] block mb-4">05 // AI Products</span>
              <h2 className="text-5xl md:text-6xl font-display font-bold tracking-[-0.05em] uppercase text-black">저가형 AI영상 예시</h2>
            </div>
            <p className="text-[#676868] max-w-md text-[14.84px] font-sans font-medium tracking-[-0.02em] leading-relaxed">
              AIK 콘텐츠의 합리적 가격의 AI영상 솔루션을 만나보세요. <br />
              - 아래의 영상은 100% AI로 제작되었습니다 -
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {aiProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative aspect-video overflow-hidden mb-6 bg-black">
                  <iframe
                    src={product.videoUrl}
                    title={product.title}
                    className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-sans font-bold text-black group-hover:text-[#0c468c] transition-colors tracking-[-0.03em]">{product.title}</h3>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[13.1px] text-black uppercase tracking-[-0.03em] font-sans font-medium">저가형 AI영상 예시</p>
                  </div>
                </div>
                
                <div className="mt-4 h-px w-full bg-black/5 group-hover:bg-[#0c468c] transition-colors duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

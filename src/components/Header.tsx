import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Menu, X } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: '서비스', id: 'services' },
    { label: '회사소개', id: 'about' },
    { label: '포트폴리오', id: 'portfolio' },
    { label: '저가형 AI영상 예시', id: 'ai-products' }
  ];

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${isOpen ? 'bg-white' : 'glass border-b border-black/5'}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
        <a href="https://aikcontents.kr/" className="flex items-center gap-3 md:gap-4 hover:opacity-80 transition-opacity z-50">
          <div className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] flex items-center justify-center overflow-hidden rounded-sm">
            <img 
              src="https://lh3.googleusercontent.com/u/0/d/1cdXX4dH2mytWkM9pUae7ebviCLUfb5Ds" 
              alt="AIK CONTENTS Korea - AI 전문 영상 제작사 로고" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-display font-bold text-[1.2rem] md:text-[1.45rem] tracking-tight uppercase text-black">
            AIK <span className="text-brand">콘텐츠</span>
          </span>
        </a>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-[1rem] font-medium text-black/60 hover:text-black hover:font-bold transition-all uppercase tracking-[-0.03em]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:gap-6">
          <a
            href="#contact"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all rounded-sm shadow-sm"
          >
            문의하기
            <ExternalLink size={14} />
          </a>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-black hover:bg-black/5 rounded-full transition-colors z-50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-white z-40 lg:hidden flex flex-col pt-24 px-10"
            >
              <div className="flex flex-col gap-3.5">
                {navItems.map((item, idx) => (
                  <motion.a
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={handleNavClick}
                    className="text-[1.12rem] font-bold text-black tracking-tighter hover:text-brand transition-colors"
                  >
                    {item.label}
                  </motion.a>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + navItems.length * 0.1 }}
                  className="mt-4 pt-4 border-t border-black/5"
                >
                  <a
                    href="#contact"
                    onClick={handleNavClick}
                    className="inline-flex items-center justify-between w-full px-4 py-3 bg-brand text-white rounded-xl font-bold text-base group"
                  >
                    문의하기
                    <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>
                
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

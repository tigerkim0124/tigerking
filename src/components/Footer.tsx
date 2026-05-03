import { motion } from 'motion/react';
import { Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white py-8 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <a href="https://aikcontents.kr/" className="hover:opacity-80 transition-opacity">
              <img 
                src="https://lh3.googleusercontent.com/d/1jD8BUIBu-rhvg_kPqt7Id_wWPuKmjpda" 
                alt="AIK CONTENTS" 
                style={{ width: '90px' }}
                className="object-contain"
                referrerPolicy="no-referrer"
              />
            </a>
            <p className="text-black tracking-[-0.05em] max-w-lg">
              <span className="text-[17.419px] font-medium">
                우리에게 최고의 브랜드는 바로 <span className="text-[19.16px] font-bold text-brand">여러분</span>입니다.
              </span>
            </p>
          </div>

          <div className="flex gap-8">
            <a 
              href="https://www.youtube.com/@aikcontents" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-black/30 hover:text-black transition-colors flex items-center gap-2"
              aria-label="Youtube"
            >
              <Youtube size={20} />
              <span className="text-[10px] font-mono uppercase tracking-widest">Youtube</span>
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-end items-center gap-6">
          
          <p className="text-[12.75px] font-sans font-medium tracking-normal text-[#8b8c8e]">
            © {currentYear} AIK CONTENTS KOREA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

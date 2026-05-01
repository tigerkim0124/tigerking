import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, Mail, Phone } from 'lucide-react';

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/xpqkkedl", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-12 bg-white relative overflow-hidden isolate">
      {/* Background Image with gradient opacity (10% left to 30% right) and horizontal flip */}
      <div 
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat -scale-x-100"
        style={{ 
          backgroundImage: 'url("https://lh3.googleusercontent.com/d/1MnzdxM7hhwqmIF9wAaQPJYwr7aVqnZD4")',
          maskImage: 'linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0.3))',
          WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0.3))'
        }}
      />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-sans font-medium text-brand text-sm uppercase tracking-[-0.02em] block mb-4">04 // Contact</span>
            <h2 className="text-5xl md:text-7xl font-display font-bold leading-none mb-8 text-black">
              LET'S CREATE <br />
              YOUR <span className="text-gradient">STORY</span>
            </h2>
            
            <div className="-mt-2">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-brand">
                  <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                    <Mail size={20} className="text-brand" />
                  </div>
                  <span className="text-[1.375rem] font-display font-bold tracking-tight">aik@aikcontents.kr</span>
                </div>
                <div className="flex items-center gap-4 text-brand">
                  <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-brand" />
                  </div>
                  <span className="text-[1.375rem] font-display font-bold tracking-tight">070-8098-1896</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 md:p-14 rounded-2xl border border-black/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] min-h-[500px] flex flex-col justify-center relative overflow-hidden"
          >
            {/* Decorative background element for the form */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center space-y-8 py-10"
                >
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={40} className="text-brand" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-display font-bold text-black tracking-tight">신청이 완료되었습니다</h3>
                    <p className="text-black/60 font-sans text-base leading-relaxed">
                      담당자가 확인 후 빠른 시일 내에 <br />
                      기재해주신 연락처로 안내해 드리겠습니다.
                    </p>
                  </div>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="px-8 py-3 rounded-full border border-black/10 text-sm font-sans font-semibold text-black hover:bg-black hover:text-white transition-all duration-300"
                  >
                    새로운 문의 작성하기
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  className="space-y-10"
                >
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="relative group">
                      <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-black block mb-1">Company / Name</label>
                      <input 
                        type="text" 
                        name="company_name"
                        required
                        placeholder="업체명 또는 성함" 
                        className="w-full bg-transparent border-b-2 border-black/10 py-4 focus:border-brand outline-none transition-all duration-300 text-base text-black placeholder:text-black/40 font-medium"
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-focus-within:w-full" />
                    </div>
                    <div className="relative group">
                      <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-black block mb-1">Contact</label>
                      <input 
                        type="text" 
                        name="contact_info"
                        required
                        placeholder="이메일 또는 전화번호" 
                        className="w-full bg-transparent border-b-2 border-black/10 py-4 focus:border-brand outline-none transition-all duration-300 text-base text-black placeholder:text-black/40 font-medium"
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-focus-within:w-full" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="relative group">
                      <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-black block mb-1">Budget Range</label>
                      <div className="relative">
                        <select 
                          name="budget"
                          required
                          className="w-full bg-transparent border-b-2 border-black/5 py-4 appearance-none focus:border-brand outline-none transition-all duration-300 cursor-pointer text-base font-medium text-black"
                        >
                          <option value="" className="bg-white">예산 범위 선택</option>
                          <option value="100-500" className="bg-white text-sm">100만원 - 500만원 (SME)</option>
                          <option value="1000-3000" className="bg-white text-sm">1,000만원 - 3,000만원</option>
                          <option value="5000+" className="bg-white text-sm">5,000만원 이상</option>
                        </select>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2"/></svg>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-focus-within:w-full" />
                    </div>
                    <div className="relative group">
                      <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-black block mb-1">Objective</label>
                      <input 
                        type="text" 
                        name="purpose"
                        required
                        placeholder="예: TVCF, SNS 바이럴, 오리지널" 
                        className="w-full bg-transparent border-b-2 border-black/10 py-4 focus:border-brand outline-none transition-all duration-300 text-base text-black placeholder:text-black/40 font-medium"
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-focus-within:w-full" />
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-black block mb-1">Reference Link</label>
                    <input 
                      type="url" 
                      name="reference_link"
                      placeholder="제작하고 싶은 스타일의 영상 링크 (YouTube, Vimeo 등)" 
                      className="w-full bg-transparent border-b-2 border-black/10 py-4 focus:border-brand outline-none transition-all duration-300 text-base text-black placeholder:text-black/40 font-medium"
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-focus-within:w-full" />
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={status === 'submitting'}
                      className="group relative w-full py-6 bg-[#0c468c] text-white font-bold uppercase tracking-[0.2em] text-sm overflow-hidden rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-2xl shadow-black/20"
                    >
                      <div className="absolute inset-0 bg-[#c47801] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {status === 'submitting' ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            전송 중...
                          </>
                        ) : (
                          <>
                            제작 예약 신청
                            <Send size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </>
                        )}
                      </span>
                    </button>
                    
                    <AnimatePresence>
                      {status === 'error' && (
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-6 text-xs text-red-500 text-center font-bold uppercase tracking-tight"
                        >
                          전송에 실패했습니다. <a href="mailto:aik@aikcontents.kr" className="underline underline-offset-4">aik@aikcontents.kr</a>으로 직접 문의 부탁드립니다.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

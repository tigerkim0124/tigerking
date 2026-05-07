import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  ExternalLink, 
  Clock, 
  ChevronRight,
  Megaphone,
  Bell,
  ArrowRight
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  isNew: boolean;
  createdAt: any;
}

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BoardModal({ isOpen, onClose }: BoardModalProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !db) return;

    setLoading(true);
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notice[];
      setNotices(docs);
      setLoading(false);
    }, (error) => {
      console.error("Board sync error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 md:p-6 lg:p-10 pointer-events-none">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
      />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto border border-white/20 font-sans"
      >
        {/* Header */}
        <header className="h-[72px] flex items-center justify-between px-8 bg-white border-b border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0c468c] rounded-2xl flex items-center justify-center rotate-3 shadow-lg">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">공지사항</h2>
              <p className="text-[10px] font-bold text-[#0c468c] uppercase tracking-widest mt-0.5 opacity-60">AIK Contents Notice Board</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer group"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-gray-900" />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* List Section */}
          <div className={`flex-1 overflow-y-auto bg-white transition-all duration-300 ${selectedNotice ? 'hidden lg:block lg:w-[40%] bg-gray-50/30 border-r border-gray-50' : 'w-full'}`}>
            <div className="p-6 md:p-8 space-y-4">
              {loading ? (
                <div className="py-20 flex justify-center">
                  <div className="w-8 h-8 border-3 border-[#0c468c]/20 border-t-[#0c468c] rounded-full animate-spin" />
                </div>
              ) : notices.length > 0 ? (
                <div className="grid gap-3">
                  {notices.map((notice) => (
                    <motion.button
                      key={notice.id}
                      onClick={() => setSelectedNotice(notice)}
                      layoutId={`notice-${notice.id}`}
                      className={`w-full text-left p-5 rounded-3xl transition-all border ${
                        selectedNotice?.id === notice.id 
                          ? 'bg-white border-white shadow-xl ring-1 ring-gray-100' 
                          : 'bg-white border-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {notice.isNew && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0c468c] text-white text-[9px] font-bold rounded-full">
                                <Bell className="w-2.5 h-2.5" /> NEW
                              </span>
                            )}
                            <span className="text-[11px] font-bold text-gray-400 tracking-tighter uppercase">
                              {notice.date || notice.createdAt?.toDate().toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <h3 className={`text-base font-bold leading-tight line-clamp-2 ${selectedNotice?.id === notice.id ? 'text-[#0c468c]' : 'text-gray-800'}`}>
                            {notice.title}
                          </h3>
                        </div>
                        <div className={`p-2 rounded-xl transition-colors shrink-0 ${selectedNotice?.id === notice.id ? 'bg-[#0c468c] text-white' : 'bg-gray-50 text-gray-400 group-hover:text-gray-900 group-hover:bg-gray-100'}`}>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center text-gray-300">
                  <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-medium tracking-tight">등록된 공지사항이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* Viewer Section */}
          <div className={`flex-1 overflow-y-auto bg-white transition-all duration-500 ${selectedNotice ? 'block' : 'hidden lg:flex items-center justify-center bg-gray-50/50'}`}>
            <AnimatePresence mode="wait">
              {selectedNotice ? (
                <motion.div 
                  key={selectedNotice.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col p-8 md:p-12"
                >
                  <button 
                    onClick={() => setSelectedNotice(null)}
                    className="lg:hidden flex items-center gap-2 text-sm font-bold text-[#0c468c] mb-8 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" /> 목록으로 돌아가기
                  </button>

                  <div className="max-w-2xl mx-auto w-full">
                    <div className="space-y-4 mb-10 pb-10 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        {selectedNotice.isNew && <span className="px-2 py-0.5 bg-[#0c468c] text-white text-[9px] font-bold rounded-full">NEW NOTICE</span>}
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          {selectedNotice.date || selectedNotice.createdAt?.toDate().toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-[1.2] tracking-tight">
                        {selectedNotice.title}
                      </h1>
                    </div>

                    <article className="prose prose-blue max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-img:rounded-3xl prose-img:shadow-lg prose-a:text-[#0c468c] prose-a:no-underline hover:prose-a:underline">
                      <div className="markdown-content text-gray-600">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                          {selectedNotice.content}
                        </ReactMarkdown>
                      </div>
                    </article>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center p-20 space-y-4 max-w-xs opacity-40">
                  <div className="w-16 h-16 bg-gray-100 rounded-3xl mx-auto flex items-center justify-center">
                    <Bell className="w-8 h-8 text-gray-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-gray-900 tracking-tight">공지를 선택하세요</p>
                    <p className="text-[11px] font-medium text-gray-400">좌측 리스트에서 상세 내용을 확인하고 싶은 소식을 클릭해주세요.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

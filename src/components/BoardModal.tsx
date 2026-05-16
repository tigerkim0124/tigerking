import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  ChevronRight,
  FileText
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto border border-white/20 font-sans text-sans"
      >
        {/* Header */}
        <header className="h-[72px] flex items-center justify-between px-8 bg-white border-b border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0c468c] rounded-2xl flex items-center justify-center rotate-3 shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">AIK스토리</h2>
              <p className="text-[10px] font-bold text-[#0c468c] uppercase tracking-widest mt-0.5 opacity-60">AIK CONTENTS STORY</p>
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
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-6 md:p-8 space-y-4">
            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-3 border-[#0c468c]/20 border-t-[#0c468c] rounded-full animate-spin" />
              </div>
            ) : notices.length > 0 ? (
              <div className="grid gap-3">
                {notices.map((notice) => (
                  <motion.div
                    key={notice.id}
                    className="w-full p-6 rounded-[2rem] transition-all border group flex items-center justify-between gap-4 bg-white border-gray-50 hover:border-gray-100 hover:shadow-lg"
                  >
                    <button 
                      onClick={() => {
                        const index = notices.findIndex(n => n.id === notice.id) + 1;
                        onClose();
                        navigate(`/${index}`);
                      }}
                      className="flex-1 min-w-0 text-left cursor-pointer group/title"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {notice.isNew && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0c468c] text-white text-[9px] font-bold rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm md:text-base font-black text-gray-900 leading-tight group-hover/title:text-[#0c468c] transition-colors text-left">
                        {notice.title}
                      </h3>
                    </button>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => {
                          const index = notices.findIndex(n => n.id === notice.id) + 1;
                          onClose();
                          navigate(`/${index}`);
                        }}
                        className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center text-gray-300">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="text-sm font-medium tracking-tight">등록된 게시글이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

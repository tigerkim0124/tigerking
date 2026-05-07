import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Notice {
  id: string;
  date: string;
  title: string;
  content: string;
  isNew?: boolean;
}

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum OperationType {
  LIST = 'list',
}

export function NoticeModal({ isOpen, onClose }: NoticeModalProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (!db) {
      setLoading(false);
      return;
    }

    const path = 'notices';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(20));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notice[];
      setNotices(docs);
      setLoading(false);
    }, (error) => {
      console.error('Firestore Error Listing Notices: ', JSON.stringify({
        error: error.message,
        operationType: OperationType.LIST,
        path
      }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-[10001] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#0c468c] px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">AIK CONTENTS 공지사항</h2>
              <button 
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content List */}
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
              {loading ? (
                <div className="text-center py-10 text-black/40">불러오는 중...</div>
              ) : notices.length > 0 ? (
                notices.map((notice) => (
                  <div key={notice.id} className="border-b border-black/5 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[12px] font-mono font-medium text-[#0c468c] bg-[#0c468c]/5 px-2 py-0.5 rounded">
                        {notice.date}
                      </span>
                      {notice.isNew && (
                        <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-sm animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <h3 className="text-[1.1rem] font-bold text-black mb-2">{notice.title}</h3>
                    <p className="text-[0.95rem] text-black/60 leading-relaxed break-keep">
                      {notice.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-black/40">등록된 공지사항이 없습니다.</div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-black/80 transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  FileText,
  Loader2
} from 'lucide-react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useParams, useNavigate } from 'react-router-dom';

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  isNew: boolean;
  createdAt: any;
}

export function StandaloneStoryViewer() {
  const { id: indexParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStoryByIndex() {
      if (!db || !indexParam) return;
      const index = parseInt(indexParam);
      if (isNaN(index) || index < 1) {
        setError(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch all stories to find the one by index (ordered by date desc)
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notice[];

        if (docs.length >= index) {
          setStory(docs[index - 1]);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Fetch story error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchStoryByIndex();
  }, [indexParam]);

  const handleClose = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[20000] bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#0c468c] animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Story...</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="fixed inset-0 z-[20000] bg-white flex flex-col items-center justify-center p-8 text-center text-sans">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <X className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">스토리를 찾을 수 없습니다.</h1>
        <p className="text-gray-500 mb-8">삭제되었거나 잘못된 경로입니다.</p>
        <button 
          onClick={handleClose}
          className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold transition-all hover:bg-[#0c468c]"
        >
          메인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[20000] bg-white flex flex-col overflow-hidden font-sans">
      <header className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 md:px-12 py-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#0c468c] rounded-2xl flex items-center justify-center rotate-3 shadow-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="hidden md:block">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">AIK스토리</h2>
            <p className="text-[10px] font-black text-[#0c468c] uppercase tracking-widest">Aik Story View</p>
          </div>
        </div>
        
        <button 
          onClick={handleClose}
          className="w-12 h-12 bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-400 rounded-full flex items-center justify-center cursor-pointer transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-[#fafafa]">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <article className="max-w-6xl mx-auto px-6 md:px-12 py-10 md:py-16 relative z-10">
          {/* Editorial Header */}
          <header className="mb-12 space-y-6 text-left">
            <div className="flex items-center justify-start gap-4">
              {story.isNew && (
                <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-blue-600/20 uppercase tracking-widest">
                  New Story
                </span>
              )}
              <div className="h-px w-8 bg-gray-100" />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em]">Aik Professional Content</span>
            </div>
            
            <h1 className="text-xl md:text-3xl font-black text-gray-900 leading-[1.05] tracking-tight">
              {story.title}
            </h1>
          </header>

          {/* Blog Content Rendering */}
          <div className="aik-article-content">
            <div 
              className="aik-rich-text-body"
              dangerouslySetInnerHTML={{ __html: story.content }} 
            />
          </div>

          {/* Article Footer Signature */}
          <footer className="mt-20 pt-10 border-t border-gray-100 flex flex-col items-start">
            <button 
              onClick={handleClose}
              className="px-12 py-5 bg-gray-900 text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#0c468c] transition-all cursor-pointer transform hover:-translate-y-1 shadow-xl hover:shadow-2xl"
            >
              Back to main website
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
}

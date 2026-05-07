import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ExternalLink, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Post {
  id: string;
  date: string;
  title: string;
  content: string;
  category?: string;
  isNew?: boolean;
}

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum OperationType {
  LIST = 'list',
}

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export function BoardModal({ isOpen, onClose }: BoardModalProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
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

    const path = 'posts';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(20));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(docs);
      setLoading(false);
    }, (error) => {
      console.error('Firestore Error Listing Posts: ', JSON.stringify({
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
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: selectedPost ? '100%' : 'auto',
              maxWidth: selectedPost ? '100%' : '42rem',
              height: selectedPost ? '100%' : 'auto',
              borderRadius: selectedPost ? '0px' : '1rem'
            }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className={`relative w-full bg-white shadow-2xl z-[10001] overflow-hidden transition-all duration-300 ${selectedPost ? 'm-0 p-0' : 'max-w-2xl rounded-2xl'}`}
          >
            {/* Header */}
            <div className={`bg-[#0c468c] px-6 py-4 flex items-center justify-between ${selectedPost ? 'sticky top-0 z-20' : ''}`}>
              <div className="flex items-center gap-2">
                {selectedPost && (
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="mr-2 text-white/80 hover:text-white transition-colors cursor-pointer p-1 hover:bg-white/10 rounded-full"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                <h2 className="text-white font-bold text-lg">
                  {selectedPost ? '게시글 상세' : 'AIK CONTENTS 게시판'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {selectedPost && (
                  <button 
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer text-sm font-medium"
                  >
                    <Home className="w-4 h-4" />
                    메인으로
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className={`${selectedPost ? 'h-[calc(100vh-64px)]' : 'max-h-[75vh]'} overflow-y-auto overflow-x-hidden`}>
              <AnimatePresence mode="wait">
                {!selectedPost ? (
                  <motion.div 
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-6"
                  >
                    {loading ? (
                      <div className="text-center py-10 text-black/40">불러오는 중...</div>
                    ) : posts.length > 0 ? (
                      posts.map((post) => (
                        <div 
                          key={post.id} 
                          onClick={() => setSelectedPost(post)}
                          className="group border-b border-black/5 pb-6 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50/50 transition-colors p-3 rounded-xl -m-3"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {post.isNew && (
                              <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-sm animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>
                          <h3 className="text-[1.1rem] font-bold text-black mb-2 group-hover:text-[#0c468c] transition-colors">{post.title}</h3>
                          <p className="text-[0.9rem] text-black/40 line-clamp-2 font-light">
                            {post.content.replace(/[#*`<>\/]/g, '').replace(/style="[^"]*"/g, '')}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-black/40">등록된 게시글이 없습니다.</div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-8 max-w-4xl mx-auto"
                  >
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        {selectedPost.isNew && (
                          <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-sm">
                            NEW
                          </span>
                        )}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold text-black leading-tight border-b-4 border-[#0c468c]/10 pb-6">
                        {selectedPost.title}
                      </h3>
                    </div>
                    
                    <div className="prose prose-blue max-w-none prose-img:rounded-2xl prose-img:shadow-xl prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-p:text-gray-700 prose-p:leading-relaxed">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          a: ({ node, ...props }) => {
                            const youtubeId = props.href ? getYoutubeId(props.href) : null;
                            if (youtubeId) {
                              return (
                                <div className="my-8 aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black">
                                  <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${youtubeId}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              );
                            }
                            return (
                              <a target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline" {...props}>
                                <ExternalLink className="w-3 h-3" />
                                {props.children}
                              </a>
                            );
                          },
                          img: ({ node, ...props }) => <img className="max-w-full h-auto" loading="lazy" {...props} />
                        }}
                      >
                        {selectedPost.content}
                      </ReactMarkdown>
                    </div>

                    <div className="mt-20 flex justify-center pb-10">
                      <button 
                        onClick={() => setSelectedPost(null)}
                        className="flex items-center gap-2 px-8 py-3 bg-[#0c468c] text-white rounded-full font-bold hover:bg-[#0c468c]/90 transition-all shadow-lg active:scale-95 cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        목록으로 돌아가기
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer - Only show in list mode */}
            {!selectedPost && (
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-black/80 transition-colors cursor-pointer"
                >
                  닫기
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

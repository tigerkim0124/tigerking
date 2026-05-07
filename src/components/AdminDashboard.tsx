import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  LayoutDashboard, 
  ChevronLeft, 
  Save, 
  Settings2,
  FileText,
  Clock,
  History,
  Check,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Admin dashboard should be a stable, high-performance workspace.
// This version uses a full-screen layout with a document-centric editor.

interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
  isNew: boolean;
  createdAt: any;
  updatedAt?: any;
}

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({});
  const [mounted, setMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const ADMIN_PASSWORD = '1234';

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'video', 'code-block'],
      ['clean']
    ],
  }), []);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image', 'video', 'code-block'
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !db) return;

    setLoading(true);
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore sync error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("인증에 실패했습니다. 비밀번호를 확인해주세요.");
    }
  };

  const handleSave = async () => {
    if (!currentPost.title || !currentPost.content) {
      alert('제목과 내용을 모두 작성해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (currentPost.id && db) {
        // Update existing
        await updateDoc(doc(db, 'posts', currentPost.id), {
          title: currentPost.title,
          content: currentPost.content,
          isNew: !!currentPost.isNew,
          updatedAt: serverTimestamp()
        });
      } else if (db) {
        // Create new
        await addDoc(collection(db, 'posts'), {
          title: currentPost.title,
          content: currentPost.content,
          isNew: !!currentPost.isNew,
          date: new Date().toLocaleDateString('ko-KR'),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setView('list');
      setCurrentPost({});
      setShowSettings(false);
    } catch (error) {
      console.error("Save failed:", error);
      alert("발행 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('이 게시글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.')) {
      try {
        if (db) await deleteDoc(doc(db, 'posts', id));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  if (!mounted) return null;

  const LoginView = () => (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa] p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8 text-center bg-[#0c468c] text-white">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">AIK 관리자 센터</h1>
            <p className="text-white/70 text-sm mt-1 uppercase tracking-widest font-medium">Blogger Console</p>
          </div>
          
          <div className="p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Access Password</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0c468c] focus:bg-white transition-all text-center text-3xl tracking-widest outline-none"
                  placeholder="••••"
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-[#0c468c] text-white rounded-xl font-bold hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer text-lg"
              >
                관리자 시스템 로그인
              </button>
            </form>
            <button 
              onClick={onClose}
              className="mt-8 text-sm text-gray-400 hover:text-gray-600 block mx-auto transition-colors cursor-pointer"
            >
              홈페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const EditorView = () => (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      {/* Workspace Header */}
      <header className="h-[64px] bg-white border-b border-gray-200 shrink-0 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button 
            onClick={() => setView('list')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="목록으로 이동"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="w-10 h-10 bg-[#0c468c] rounded flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1 ml-2">
            <input 
              type="text"
              placeholder="제목 없는 포스트"
              value={currentPost.title || ''}
              onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
              className="w-full text-xl font-medium text-gray-800 bg-transparent border-none outline-none focus:bg-gray-50 rounded px-2 -ml-2 py-1 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-full transition-all cursor-pointer ${showSettings ? 'bg-blue-50 text-[#0c468c]' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Settings2 className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-[#0c468c] text-white rounded-full font-bold hover:shadow-lg active:scale-95 disabled:bg-gray-400 transition-all cursor-pointer flex items-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            게시글 발행
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Container */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="google-editor-wrapper flex-1 flex flex-col overflow-hidden">
            <ReactQuill 
              theme="snow"
              value={currentPost.content || ''}
              onChange={(content) => setCurrentPost({ ...currentPost, content })}
              modules={quillModules}
              formats={quillFormats}
              placeholder="게시글 내용을 입력하세요..."
              className="full-workspace-editor"
            />
          </div>
        </main>

        {/* Workspace Sidebar Settings */}
        <AnimatePresence>
          {showSettings && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white border-l border-gray-200 overflow-y-auto shrink-0 flex flex-col shadow-xl z-20"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> 게시글 설정
                </h2>
                <button onClick={() => setShowSettings(false)} className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">배지 및 노출</h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">신규(NEW) 배지</p>
                      <p className="text-[10px] text-gray-400">목록에서 NEW 아이콘이 표시됩니다.</p>
                    </div>
                    <button 
                      onClick={() => setCurrentPost({ ...currentPost, isNew: !currentPost.isNew })}
                      className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${currentPost.isNew ? 'bg-[#0c468c] justify-end' : 'bg-gray-300 justify-start'}`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>
                </section>

                <section className="space-y-4 pt-6 border-t border-gray-100 text-gray-500">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">이력 상세</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-4 h-4" />
                      <span>작성일: {currentPost.createdAt ? currentPost.createdAt.toDate().toLocaleDateString('ko-KR') : '작성 중'}</span>
                    </div>
                    {currentPost.updatedAt && (
                      <div className="flex items-center gap-2 text-xs">
                        <History className="w-4 h-4" />
                        <span>수정일: {currentPost.updatedAt.toDate().toLocaleDateString('ko-KR')}</span>
                      </div>
                    )}
                  </div>
                </section>

                {currentPost.id && (
                  <div className="pt-8 block">
                    <button 
                      onClick={() => {
                        handleDelete(currentPost.id!);
                        setView('list');
                      }}
                      className="w-full py-3 border border-red-100 text-red-500 rounded-xl text-sm font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" /> 데이터베이스에서 삭제
                    </button>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        /* Stable Workspace Editor CSS */
        .google-editor-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }
        
        /* Fixed Toolbar to Top of Area */
        .full-workspace-editor .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e0e0e0 !important;
          background: white;
          padding: 8px 32px !important;
          z-index: 10;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 4px;
        }

        .full-workspace-editor .ql-container.ql-snow {
          border: none !important;
          flex: 1;
          overflow-y: auto;
          background: #f8f9fa;
          display: flex;
          justify-content: center;
          padding: 40px 16px;
        }

        /* The Paper Sheet */
        .full-workspace-editor .ql-editor {
          background: white;
          width: 100%;
          max-width: 850px;
          min-height: 1100px !important;
          margin: 0 auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
          padding: 80px 80px !important;
          font-family: 'GmarketSans', sans-serif;
          font-size: 1rem;
          line-height: 1.6;
          color: #202124;
        }

        @media (max-width: 768px) {
          .full-workspace-editor .ql-editor {
            padding: 40px 24px !important;
          }
        }

        .full-workspace-editor .ql-editor.ql-blank::before {
          left: 80px !important;
          font-style: normal !important;
          color: #dadce0 !important;
        }
        
        @media (max-width: 768px) {
          .full-workspace-editor .ql-editor.ql-blank::before {
            left: 24px !important;
          }
        }
      `}</style>
    </div>
  );

  const ListView = () => (
    <div className="flex flex-col h-full bg-white">
      <header className="h-[72px] border-b border-gray-100 flex items-center justify-between px-8 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0c468c] rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">AIK Dashboard</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Admin Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setCurrentPost({ isNew: true });
              setView('editor');
            }}
            className="px-6 py-2.5 bg-[#0c468c] text-white rounded-full font-bold hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> 새 게시글 작성
          </button>
          <div className="w-px h-6 bg-gray-200" />
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-gray-50/50 p-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">콘텐츠 관리</h2>
              <p className="text-gray-500 mt-1 font-medium italic">총 <span className="text-[#0c468c] font-bold">{posts.length}</span>개의 게시글이 데이터베이스에 등록되어 있습니다.</p>
            </div>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors cursor-pointer uppercase"
            >
              <LogOut className="w-4 h-4" /> 로그아웃
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">게시글 정보</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">상태</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">관리 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map((post) => (
                  <tr key={post.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-gray-900 text-lg group-hover:text-[#0c468c] transition-colors">{post.title}</span>
                        <span className="text-xs text-gray-400 font-medium">
                          {post.createdAt?.toDate().toLocaleDateString('ko-KR')} 등록
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {post.isNew ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                            <Plus className="w-3 h-3" /> NEW
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                            <Check className="w-3 h-3" /> LIVE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => {
                            setCurrentPost(post);
                            setView('editor');
                          }}
                          className="p-3 bg-blue-50 text-[#0c468c] rounded-xl hover:bg-[#0c468c] hover:text-white transition-all cursor-pointer"
                          title="수정하기"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                          title="삭제하기"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {posts.length === 0 && !loading && (
              <div className="py-32 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                  <AlertCircle className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium tracking-tight">작성된 게시글이 없습니다. 첫 번째 글을 작성해보세요!</p>
              </div>
            )}
            
            {loading && (
              <div className="py-20 flex justify-center">
                <div className="w-10 h-10 border-4 border-[#0c468c]/20 border-t-[#0c468c] rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[12000] overflow-hidden pointer-events-auto bg-white">
      <AnimatePresence mode="wait">
        <motion.div 
          key={!isAuthenticated ? 'login' : view}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {!isAuthenticated ? <LoginView /> : (view === 'list' ? <ListView /> : <EditorView />)}
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}

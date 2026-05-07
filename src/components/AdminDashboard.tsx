import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
  isNew: boolean;
  category?: string;
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
  
  const ADMIN_PASSWORD = '0124';
  const editorRef = useRef<any>(null);

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image'
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
      alert("비밀번호가 올바르지 않습니다.");
    }
  };

  const handleSave = async () => {
    const title = currentPost.title?.trim();
    const content = currentPost.content?.trim();

    if (!title || !content || content === '<p><br></p>') {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      if (currentPost.id && db) {
        await updateDoc(doc(db, 'posts', currentPost.id), {
          title,
          content,
          isNew: !!currentPost.isNew,
          updatedAt: serverTimestamp()
        });
      } else if (db) {
        await addDoc(collection(db, 'posts'), {
          title,
          content,
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
      alert("글 발행 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        if (db) await deleteDoc(doc(db, 'posts', id));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  if (!mounted) return null;

  const LoginView = () => (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa] p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-[#0c468c] p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">AIK Admin Console</h1>
        </div>
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0c468c] focus:bg-white transition-all text-center text-2xl tracking-widest outline-none"
                placeholder="••••"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-[#0c468c] text-white rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              로그인
            </button>
          </form>
          <button onClick={onClose} className="mt-6 text-xs text-gray-400 hover:text-gray-600 block mx-auto cursor-pointer">
            돌아가기
          </button>
        </div>
      </div>
    </div>
  );

  const EditorView = () => (
    <div className="flex flex-col h-screen bg-[#f8f9fa] font-sans">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 min-w-0 pr-4">
            <FileText className="w-5 h-5 text-[#0c468c]" />
            <input 
              type="text"
              placeholder="제목을 입력하세요"
              value={currentPost.title || ''}
              onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
              className="text-lg font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 rounded px-2 -ml-2 py-0.5 w-full truncate"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-full ${showSettings ? 'bg-blue-50 text-[#0c468c]' : 'hover:bg-gray-100 text-gray-600'} cursor-pointer`}
          >
            <Settings2 className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-[#0c468c] text-white rounded-full font-bold hover:shadow-md disabled:bg-gray-400 flex items-center gap-2 transition-all cursor-pointer"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            저장
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="google-editor-area flex-1 overflow-y-auto">
            <div className="max-w-[850px] mx-auto my-10 bg-white shadow-sm border border-gray-200 min-h-[1100px] flex flex-col">
              <ReactQuill 
                ref={editorRef}
                theme="snow"
                value={currentPost.content || ''}
                onChange={(content) => setCurrentPost(prev => ({ ...prev, content }))}
                modules={quillModules}
                formats={quillFormats}
                className="aik-google-quill"
                placeholder="내용을 입력하세요..."
              />
            </div>
          </div>
        </main>

        <AnimatePresence>
          {showSettings && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-xs uppercase tracking-widest text-gray-400">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-800">NEW 배지</p>
                      <p className="text-[10px] text-gray-400">목록에 아이콘 노출</p>
                    </div>
                    <button 
                      onClick={() => setCurrentPost({ ...currentPost, isNew: !currentPost.isNew })}
                      className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors ${currentPost.isNew ? 'bg-[#0c468c] justify-end' : 'bg-gray-200 justify-start'}`}
                    >
                      <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>생성: {currentPost.createdAt ? currentPost.createdAt.toDate().toLocaleDateString() : '-'}</span>
                  </div>
                </div>
                {currentPost.id && (
                  <button 
                    onClick={() => { handleDelete(currentPost.id!); setView('list'); }}
                    className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> 삭제하기
                  </button>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .aik-google-quill { height: auto; display: flex; flex-direction: column; }
        .aik-google-quill .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #f1f3f4 !important;
          padding: 8px 40px !important;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }
        .aik-google-quill .ql-container.ql-snow { border: none !important; flex: 1; }
        .aik-google-quill .ql-editor {
          padding: 80px 80px 200px 80px !important;
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.6;
          color: #202124;
          min-height: 1000px;
        }
        @media (max-width: 768px) {
          .aik-google-quill .ql-editor { padding: 40px 24px !important; }
        }
        .aik-google-quill .ql-editor.ql-blank::before {
          left: 80px !important;
          font-style: normal !important;
          color: #dadce0 !important;
        }
        @media (max-width: 768px) {
          .aik-google-quill .ql-editor.ql-blank::before { left: 24px !important; }
        }
        .ql-snow .ql-picker.ql-header { width: 100px !important; }
      `}</style>
    </div>
  );

  const ListView = () => (
    <div className="flex flex-col h-screen bg-white font-sans">
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0c468c] rounded-lg flex items-center justify-center shadow-lg transform rotate-2">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900 uppercase">AIK Board</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setCurrentPost({ isNew: true }); setView('editor'); }}
            className="px-5 py-2 bg-[#0c468c] text-white rounded-full font-bold hover:shadow-lg transition-all text-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> 게시글 작성
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-gray-50/30 p-4 sm:p-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">전체 게시글</h2>
            <button onClick={() => setIsAuthenticated(false)} className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-colors">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Post Title</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map((post) => (
                    <tr key={post.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 hover:text-[#0c468c] transition-colors cursor-pointer" onClick={() => { setCurrentPost(post); setView('editor'); }}>
                            {post.title}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {post.createdAt?.toDate().toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {post.isNew ? (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded shadow-sm">NEW</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded shadow-sm">LIVE</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setCurrentPost(post); setView('editor'); }} className="p-2 text-gray-400 hover:text-[#0c468c] hover:bg-blue-50 rounded-lg cursor-pointer">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {posts.length === 0 && !loading && (
                <div className="py-24 text-center">
                  <FileText className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm font-medium">등록된 게시글이 없습니다.</p>
                </div>
              )}
            </div>
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          {!isAuthenticated ? <LoginView /> : (view === 'list' ? <ListView /> : <EditorView />)}
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}

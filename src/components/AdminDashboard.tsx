import React, { useState, useEffect } from 'react';
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
  Megaphone, 
  ChevronLeft, 
  Save, 
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface Notice {
  id: string;
  title: string;
  content: string;
  isNew: boolean;
  createdAt: any;
  updatedAt?: any;
}

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNotice, setCurrentNotice] = useState<Partial<Notice>>({});
  const [mounted, setMounted] = useState(false);

  const ADMIN_PASSWORD = '0124';

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
      })) as Notice[];
      setNotices(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore sync error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("비밀번호가 올바르지 않습니다.");
      setPassword('');
    }
  };

  const handleSave = async () => {
    const title = currentNotice.title?.trim();
    const content = currentNotice.content?.trim();

    if (!title || !content || content === '<p><br></p>') {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      if (currentNotice.id && db) {
        await updateDoc(doc(db, 'posts', currentNotice.id), {
          title,
          content,
          isNew: currentNotice.isNew || false,
          updatedAt: serverTimestamp()
        });
      } else if (db) {
        await addDoc(collection(db, 'posts'), {
          title,
          content,
          isNew: currentNotice.isNew || false,
          date: new Date().toLocaleDateString('ko-KR'),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      setCurrentNotice({});
    } catch (error) {
      console.error("Save failed:", error);
      alert("발행 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      try {
        if (db) await deleteDoc(doc(db, 'posts', id));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  if (!mounted) return null;

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="fixed inset-0 z-[12000] bg-gray-100 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="bg-[#0c468c] p-10 text-center text-white">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <h1 className="text-xl font-bold">Admin Console</h1>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-2">Notice Management System</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#0c468c]/10 focus:border-[#0c468c] outline-none text-center text-3xl tracking-widest font-mono transition-all"
                  placeholder="••••"
                  autoFocus
                />
                <button 
                  type="submit"
                  className="w-full py-4 bg-[#0c468c] text-white rounded-2xl font-bold hover:shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  로그인
                </button>
              </form>
              <button onClick={onClose} className="mt-8 text-xs text-gray-400 hover:text-gray-600 block mx-auto font-bold uppercase tracking-wider cursor-pointer">
                Back to Site
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-[12000] bg-white flex flex-col font-sans overflow-hidden">
        <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
            ) : (
              <div className="w-8 h-8 bg-[#0c468c] rounded-lg flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
            )}
            <h1 className="font-bold text-gray-900 tracking-tight">{isEditing ? '공지사항 작성' : '공지사항 관리'}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {isEditing ? (
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-[#0c468c] text-white rounded-full font-bold hover:shadow-md disabled:bg-gray-300 flex items-center gap-2 cursor-pointer transition-all"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                저장 및 발행
              </button>
            ) : (
              <>
                <button 
                  onClick={() => { setCurrentNotice({ isNew: true }); setIsEditing(true); }}
                  className="px-4 py-2 bg-[#0c468c] text-white rounded-full text-xs font-bold flex items-center gap-2 hover:shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> 공지 추가
                </button>
                <div className="w-px h-6 bg-gray-100 mx-1" />
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="max-w-4xl mx-auto p-6 md:p-10">
            {isEditing ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Title</label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={currentNotice.isNew}
                        onChange={(e) => setCurrentNotice({ ...currentNotice, isNew: e.target.checked })}
                        className="w-4 h-4 accent-[#0c468c]"
                      />
                      <span className="text-[11px] font-bold text-[#0c468c] group-hover:underline">NEW 배지 표시</span>
                    </label>
                  </div>
                  <input 
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={currentNotice.title || ''}
                    onChange={(e) => setCurrentNotice({ ...currentNotice, title: e.target.value })}
                    className="w-full text-2xl font-bold text-gray-900 border-none outline-none focus:ring-0 placeholder:text-gray-200"
                  />
                </div>
                
                <div className="min-h-[400px] border-t border-gray-50 pt-6">
                  <ReactQuill 
                    theme="snow"
                    value={currentNotice.content || ''}
                    onChange={(content) => setCurrentNotice({ ...currentNotice, content })}
                    className="aik-lite-quill"
                    placeholder="내용을 입력하세요..."
                  />
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">최근 공지사항</h2>
                  <button 
                    onClick={() => setIsAuthenticated(false)}
                    className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3 h-3" /> Logout
                  </button>
                </div>

                <div className="grid gap-3">
                  {notices.map((notice) => (
                    <div key={notice.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#0c468c]/20 transition-all">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          {notice.isNew && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded">NEW</span>}
                          <h3 className="font-bold text-gray-900 truncate text-lg">{notice.title}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {notice.createdAt?.toDate().toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setCurrentNotice(notice); setIsEditing(true); }}
                          className="p-2.5 bg-gray-50 text-gray-400 hover:text-[#0c468c] hover:bg-blue-50 rounded-xl cursor-pointer transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(notice.id)}
                          className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl cursor-pointer transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {notices.length === 0 && !loading && (
                    <div className="py-20 text-center text-gray-300">
                      <Megaphone className="w-12 h-12 mx-auto opacity-10 mb-2" />
                      <p className="text-sm font-medium">공지사항이 비어 있습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        <style>{`
          .aik-lite-quill .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f1f3f4 !important; background: white; padding: 12px 0 !important; }
          .aik-lite-quill .ql-container.ql-snow { border: none !important; min-height: 400px; font-family: inherit; }
          .aik-lite-quill .ql-editor { padding: 30px 0 !important; font-size: 1rem; line-height: 1.7; color: #333; }
        `}</style>
      </div>
    );
  };

  return createPortal(
    <AnimatePresence mode="wait">
      {renderContent()}
    </AnimatePresence>,
    document.body
  );
}

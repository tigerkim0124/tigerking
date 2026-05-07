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
  LayoutDashboard,
  AlertCircle
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
  const [loginError, setLoginError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNotice, setCurrentNotice] = useState<Partial<Notice>>({});
  const [mounted, setMounted] = useState(false);

  const ADMIN_PASSWORD = '0124';

  useEffect(() => {
    setMounted(true);
    // Check session storage for existing auth
    const isAuth = sessionStorage.getItem('aik_admin_auth') === 'true';
    if (isAuth) {
      setIsAuthenticated(true);
    }
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
      sessionStorage.setItem('aik_admin_auth', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
      setPassword('');
      setTimeout(() => setLoginError(false), 3000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('aik_admin_auth');
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
      alert("발행 실패: 데이터베이스 연결 또는 권한 옵션을 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      try {
        if (db) await deleteDoc(doc(db, 'posts', id));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[12000] bg-white overflow-hidden flex flex-col font-sans">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div 
            key="login-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-gray-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm">
              <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
                <div className="bg-[#0c468c] p-10 text-center text-white">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-inner">
                    <LayoutDashboard className="w-8 h-8" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2">Notice Management</p>
                </div>
                
                <div className="p-8">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-6 py-5 bg-gray-50 border ${loginError ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:ring-4 focus:ring-[#0c468c]/10 focus:border-[#0c468c]'} rounded-2xl outline-none text-center text-4xl tracking-[0.5em] font-mono transition-all`}
                        placeholder="••••"
                        autoFocus
                      />
                      {loginError && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-6 left-0 right-0 text-center"
                        >
                          <span className="text-[10px] font-bold text-red-500 flex items-center justify-center gap-1 uppercase tracking-tighter">
                            <AlertCircle className="w-3 h-3" /> Incorrect Password
                          </span>
                        </motion.div>
                      )}
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-5 bg-[#0c468c] text-white rounded-2xl font-bold hover:shadow-xl transition-all cursor-pointer active:scale-[0.98] mt-4"
                    >
                      Login
                    </button>
                  </form>
                  <button 
                    onClick={onClose} 
                    className="mt-8 text-[10px] text-gray-400 hover:text-gray-900 block mx-auto font-black uppercase tracking-[0.2em] cursor-pointer"
                  >
                    Close Console
                  </button>
                </div>
              </div>
              <p className="text-center mt-6 text-[10px] text-gray-300 font-bold uppercase tracking-widest">Aik Contents v2.0</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 shrink-0 bg-white">
              <div className="flex items-center gap-4">
                {isEditing ? (
                  <button onClick={() => setIsEditing(false)} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                  </button>
                ) : (
                  <div className="w-10 h-10 bg-[#0c468c] rounded-2xl flex items-center justify-center shadow-lg rotate-3">
                    <Megaphone className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="font-bold text-gray-900 text-lg tracking-tight">{isEditing ? '공지사항 작성' : '공지사항 관리'}</h1>
                  <p className="text-[10px] font-bold text-[#0c468c] uppercase tracking-widest opacity-60">
                    {isEditing ? 'Create or Update Post' : 'Manage Recent Notices'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {isEditing ? (
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-3 bg-[#0c468c] text-white rounded-full font-bold hover:shadow-xl disabled:bg-gray-200 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    저장 및 발행
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => { setCurrentNotice({ isNew: true }); setIsEditing(true); }}
                      className="px-5 py-2.5 bg-[#0c468c] text-white rounded-full text-xs font-bold flex items-center gap-2 hover:shadow-xl cursor-pointer transition-all active:scale-95 shadow-md"
                    >
                      <Plus className="w-4 h-4" /> 공지 추가
                    </button>
                    <div className="w-px h-8 bg-gray-100" />
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                  </>
                )}
              </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-gray-50/50">
              <div className="max-w-5xl mx-auto p-6 md:p-12">
                {isEditing ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-8 md:p-12 space-y-8"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title Entry</label>
                          <input 
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={currentNotice.title || ''}
                            onChange={(e) => setCurrentNotice({ ...currentNotice, title: e.target.value })}
                            className="w-full text-3xl font-bold text-gray-900 border-none outline-none focus:ring-0 placeholder:text-gray-100"
                          />
                        </div>
                        <label className="flex flex-col items-end gap-2 cursor-pointer group shrink-0 ml-10">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Badge</span>
                          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 group-hover:bg-blue-50 transition-colors">
                            <input 
                              type="checkbox"
                              checked={currentNotice.isNew}
                              onChange={(e) => setCurrentNotice({ ...currentNotice, isNew: e.target.checked })}
                              className="w-5 h-5 accent-[#0c468c] cursor-pointer"
                            />
                            <span className="text-[11px] font-bold text-[#0c468c]">활성화</span>
                          </div>
                        </label>
                      </div>
                      
                      <div className="min-h-[500px] flex flex-col">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-4">Body Content</label>
                        <div className="flex-1 border border-gray-100 rounded-3xl overflow-hidden bg-white">
                          <ReactQuill 
                            theme="snow"
                            value={currentNotice.content || ''}
                            onChange={(content) => setCurrentNotice({ ...currentNotice, content })}
                            className="aik-lite-quill h-[450px]"
                            placeholder="공지 내용을 작성해 주세요..."
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">최근 등록된 공지</h2>
                      <button 
                        onClick={handleLogout}
                        className="px-4 py-2 text-[10px] font-black text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <LogOut className="w-4 h-4" /> Logout Admin
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {notices.map((notice) => (
                        <motion.div 
                          key={notice.id}
                          layout
                          className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm flex items-center justify-between group hover:shadow-xl hover:border-[#0c468c]/10 transition-all duration-300"
                        >
                          <div className="flex-1 min-w-0 pr-8">
                            <div className="flex items-center gap-3 mb-2">
                              {notice.isNew && (
                                <span className="px-2 py-0.5 bg-[#0c468c] text-white text-[9px] font-bold rounded-full">NEW</span>
                              )}
                              <h3 className="font-bold text-gray-900 truncate text-xl tracking-tight transition-colors group-hover:text-[#0c468c]">
                                {notice.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-4 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {notice.createdAt?.toDate().toLocaleDateString('ko-KR')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => { setCurrentNotice(notice); setIsEditing(true); }}
                              className="p-3 bg-gray-50 text-gray-400 hover:text-[#0c468c] hover:bg-blue-50 rounded-2xl cursor-pointer transition-all active:scale-95"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(notice.id)}
                              className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl cursor-pointer transition-all active:scale-95"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                      
                      {notices.length === 0 && !loading && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-32 text-center text-gray-300 bg-white rounded-[3rem] border-2 border-dashed border-gray-100"
                        >
                          <Megaphone className="w-16 h-16 mx-auto opacity-10 mb-4" />
                          <p className="text-base font-bold tracking-tight text-gray-400 uppercase">No active notices found</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </main>

            <style>{`
              .aik-lite-quill .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f8f9fa !important; background: #fafafa; padding: 15px 25px !important; }
              .aik-lite-quill .ql-container.ql-snow { border: none !important; min-height: 450px; font-family: inherit; }
              .aik-lite-quill .ql-editor { padding: 35px 25px !important; font-size: 1.05rem; line-height: 1.8; color: #444; }
              .ql-snow .ql-stroke { stroke: #999 !important; }
              .ql-snow .ql-fill { fill: #999 !important; }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}

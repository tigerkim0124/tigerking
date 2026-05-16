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
import { auth, db } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error Detail: ', JSON.stringify(errInfo));
  
  // Provide user-friendly feedback for common errors
  if (errInfo.error.toLowerCase().includes('1mb') || errInfo.error.toLowerCase().includes('too large')) {
    alert("용량 초과: 이미지 크기가 너무 큽니다. 이미지를 줄이거나 외부 링크를 사용해 주세요 (Firestore 한도: 1MB)\n\n팁: 사진 파일을 캡처해서 붙여넣거나 용량을 줄여서 올려주세요.");
  } else if (errInfo.error.toLowerCase().includes('permission')) {
    alert("권한 오류: 데이터베이스 권한이 없거나, 작성된 글의 크기가 너무 커서 보안 필터링에 걸렸을 수 있습니다.\n\n해결방법:\n1. 글의 용량(사진 크기)을 줄여보세요.\n2. 로그아웃 후 다시 로그인 해보세요.");
  } else {
    alert(`발행 실패: ${errInfo.error}`);
  }
  
  throw new Error(JSON.stringify(errInfo));
}
import { 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  ChevronLeft, 
  Save, 
  LayoutDashboard,
  AlertCircle,
  FileText
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

export function AdminDashboard({ onClose, onPublished }: { onClose: () => void, onPublished?: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentNotice, setCurrentNotice] = useState<Partial<Notice>>({});
  const [mounted, setMounted] = useState(false);

  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [isNewBadge, setIsNewBadge] = useState(true);

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'header': '3' }, { 'header': '4' }, { 'header': '5' }, { 'header': '6' }],
      [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],
      ['link', 'image', 'video'],
    ],
  }), []);

  const quillFormats = [
    'header',
    'align',
    'link', 'image', 'video'
  ];

  const ADMIN_PASSWORD = '0124';

  useEffect(() => {
    if (view === 'editor') {
      setEditorTitle(currentNotice.title || '');
      setEditorContent(currentNotice.content || '');
      setIsNewBadge(currentNotice.isNew !== undefined ? currentNotice.isNew : true);
    }
  }, [view, currentNotice]);

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
    const inputPassword = password.trim();
    if (inputPassword === ADMIN_PASSWORD || password === ADMIN_PASSWORD) {
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
    const title = editorTitle.trim();
    const content = editorContent.trim();

    if (!title || !content || content === '<p><br></p>') {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    // Check content size (Roughly 1MB limit for Firestore)
    if (content.length > 800000) {
      const confirmed = window.confirm(
        '작성하신 게시글의 용량이 매우 큽니다 (약 1MB 육박).\n' +
        '이미지가 많이 포함되어 있다면 발행이 실패할 수 있습니다.\n' +
        '발행 실패 시 이미지를 줄이거나 외부 링크를 사용해 주세요.\n\n' +
        '그래도 발행을 진행할까요?'
      );
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      if (currentNotice.id && db) {
        try {
          await updateDoc(doc(db, 'posts', currentNotice.id), {
            title,
            content,
            isNew: !!isNewBadge,
            updatedAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `posts/${currentNotice.id}`);
        }
      } else if (db) {
        try {
          await addDoc(collection(db, 'posts'), {
            title,
            content,
            isNew: !!isNewBadge,
            date: new Date().toLocaleDateString('ko-KR'),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'posts');
        }
      }
      setView('list');
      setCurrentNotice({});
      setEditorTitle('');
      setEditorContent('');
      if (onPublished) {
        onPublished();
      }
    } catch (error) {
      console.error("General save failure:", error);
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
    <div className="fixed inset-0 z-[12000] bg-white flex flex-col font-sans overflow-hidden">
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
                <h1 className="text-xl font-bold tracking-tight">AIK Admin Console</h1>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2">Board Content Management</p>
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
            {view === 'editor' ? (
              <div className="flex flex-col h-screen bg-[#f1f3f4] font-sans">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-50">
                  <div className="flex items-center gap-4 overflow-hidden flex-1">
                    <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
                      <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <div className="w-10 h-10 bg-[#0c468c] rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-[#0c468c]/20">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <input 
                          type="text"
                          placeholder="제목 없는 스토리"
                          value={editorTitle}
                          onChange={(e) => setEditorTitle(e.target.value)}
                          className="text-xl font-bold text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 rounded px-2 -ml-2 py-0.5 w-full truncate transition-all"
                        />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Google Workspace Editor</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 mr-4 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <input 
                        type="checkbox"
                        id="isNew"
                        checked={isNewBadge}
                        onChange={(e) => setIsNewBadge(e.target.checked)}
                        className="w-4 h-4 accent-[#0c468c] cursor-pointer"
                      />
                      <label htmlFor="isNew" className="text-xs font-bold text-[#0c468c] cursor-pointer select-none">NEW 배지</label>
                    </div>
                    <button 
                      onClick={handleSave}
                      disabled={loading}
                      className="px-8 py-2.5 bg-[#0c468c] text-white rounded-full font-bold hover:shadow-xl disabled:bg-gray-400 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-lg shadow-[#0c468c]/20"
                    >
                      {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                      발행
                    </button>
                    <button 
                      onClick={() => setView('list')}
                      disabled={loading}
                      className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900 cursor-pointer"
                      title="취소"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </header>

                <div className="flex-1 overflow-hidden relative">
                  <main className="absolute inset-0 overflow-y-auto">
                    <div className="aik-google-paper-wrapper py-12 px-4 md:px-0">
                      <div className="aik-google-paper mx-auto bg-white shadow-xl shadow-gray-200/50 border border-gray-200 min-h-[1100px] flex flex-col relative">
                        {/* Editor Tips */}
                        <div className="absolute -top-8 left-4 right-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          <div className="flex gap-4">
                            <span className="text-[#0c468c]">Tip: 이미지 업로드 시 가급적 용량을 줄여주세요 (1MB 한도)</span>
                            <span>•</span>
                            <span>유튜브는 비디오 버튼을 클릭 후 URL을 입력하세요</span>
                          </div>
                        </div>
                        <ReactQuill 
                          theme="snow"
                          value={editorContent}
                          onChange={setEditorContent}
                          modules={quillModules}
                          formats={quillFormats}
                          className="aik-lite-quill flex-1 flex flex-col"
                          placeholder="내용을 입력해 주세요..."
                        />
                      </div>
                    </div>
                  </main>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full bg-white">
                <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 shrink-0 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#0c468c] rounded-2xl flex items-center justify-center shadow-lg rotate-3">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="font-bold text-gray-900 text-lg tracking-tight">AIK스토리 관리</h1>
                      <p className="text-[10px] font-bold text-[#0c468c] uppercase tracking-widest opacity-60">
                        Manage AIK Stories
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => { setCurrentNotice({ isNew: true }); setView('editor'); }}
                      className="px-5 py-2.5 bg-[#0c468c] text-white rounded-full text-xs font-bold flex items-center gap-2 hover:shadow-xl cursor-pointer transition-all active:scale-95 shadow-md"
                    >
                      <Plus className="w-4 h-4" /> 스토리 추가
                    </button>
                    <div className="w-px h-8 bg-gray-100" />
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-50/50">
                  <div className="max-w-5xl mx-auto p-6 md:p-12">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">최근 등록된 스토리</h2>
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
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => { setCurrentNotice(notice); setView('editor'); }}
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
                            <FileText className="w-16 h-16 mx-auto opacity-10 mb-4" />
                            <p className="text-base font-bold tracking-tight text-gray-400 uppercase">No active posts found</p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            )}

            <style>{`
              .aik-google-paper-wrapper { display: flex; justify-content: center; }
              .aik-google-paper { width: 100%; max-width: 1100px; }
              .aik-lite-quill { display: flex; flex-direction: column; height: auto; }
              .aik-lite-quill .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f1f3f4 !important; background: #fff; position: sticky; top: 0; z-index: 20; padding: 12px 24px !important; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
              .aik-lite-quill .ql-toolbar.ql-snow::-webkit-scrollbar { display: none; }
              .ql-snow.ql-toolbar button, .ql-snow .ql-toolbar button { height: 32px !important; min-width: 32px !important; width: auto !important; display: flex; align-items: center; justify-content: center; padding: 0 8px !important; border-radius: 6px !important; transition: all 0.2s !important; border: 1px solid transparent !important; }
              .ql-snow.ql-toolbar button:hover, .ql-snow .ql-toolbar button:hover { background: #f8f9fa !important; border-color: #f1f3f4 !important; }
              .ql-snow.ql-toolbar button.ql-active, .ql-snow .ql-toolbar button.ql-active { background: #e8f0fe !important; color: #0c468c !important; }
              
              /* Custom Header Button Labels */
              .ql-snow .ql-picker.ql-header { display: none !important; }
              .ql-header[value="1"]::before { content: "H1"; font-weight: 900; font-size: 14px; }
              .ql-header[value="2"]::before { content: "H2"; font-weight: 800; font-size: 13px; }
              .ql-header[value="3"]::before { content: "H3"; font-weight: 700; font-size: 12px; }
              .ql-header[value="4"]::before { content: "H4"; font-weight: 600; font-size: 11px; }
              .ql-header[value="5"]::before { content: "H5"; font-weight: 500; font-size: 10px; }
              .ql-header[value="6"]::before { content: "H6"; font-weight: 400; font-size: 9px; }
              
              .ql-snow .ql-formats { display: flex !important; align-items: center !important; margin-right: 16px !important; border-right: 1px solid #f1f3f4; padding-right: 16px !important; }
              .ql-snow .ql-formats:last-child { margin-right: 0 !important; border-right: none; padding-right: 0 !important; }
              .aik-lite-quill .ql-container.ql-snow { border: none !important; flex: 1; }
              .aik-lite-quill .ql-editor { padding: 60px 80px 200px 80px !important; font-size: 1.1rem; line-height: 1.8; color: #202124 !important; min-height: 1000px; }
              @media (max-width: 768px) { .aik-lite-quill .ql-editor { padding: 40px 24px !important; } }
              .aik-lite-quill .ql-editor.ql-blank::before { left: 80px !important; font-style: normal !important; color: #dadce0 !important; }
              @media (max-width: 768px) { .aik-lite-quill .ql-editor.ql-blank::before { left: 24px !important; } }
              .ql-snow .ql-stroke { stroke: #5f6368 !important; stroke-width: 2px !important; }
              .ql-snow .ql-fill { fill: #5f6368 !important; }
              .ql-snow .ql-picker.ql-header { width: 140px !important; border: 1px solid #e8eaed !important; border-radius: 6px !important; }
              .ql-snow .ql-picker-label { font-weight: 600 !important; color: #3c4043 !important; }
              .ql-snow .ql-picker-options { border-radius: 8px !important; border: none !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; padding: 8px !important; margin-top: 4px !important; }
              .ql-video { width: 100%; aspect-ratio: 16 / 9; border-radius: 1.5rem; margin: 2rem 0; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
              .ql-editor img { max-width: 70%; height: auto; display: block; margin: 2rem auto; border-radius: 1.5rem; }
              .ql-align-center { text-align: center; }
              .ql-align-right { text-align: right; }
              .ql-align-justify { text-align: justify; }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}

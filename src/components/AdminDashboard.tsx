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
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, signInWithGoogle, logout } from '../lib/firebase';
import { X, Plus, Edit2, Trash2, LogOut, LayoutDashboard, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  isNew: boolean;
  createdAt: any;
}

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNotice, setCurrentNotice] = useState<Partial<Notice>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user && db) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          // Also check by email to bootstrap
          if (adminDoc.exists() || user.email === 'tigerkim0124@gmail.com') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          console.warn("Error checking admin status:", e);
          if (user.email === 'tigerkim0124@gmail.com') setIsAdmin(true);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isAdmin || !db) return;

    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notice[];
      setNotices(docs);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNotice.title || !currentNotice.content || !currentNotice.date) return;

    try {
      if (currentNotice.id && db) {
        await updateDoc(doc(db, 'notices', currentNotice.id), {
          title: currentNotice.title,
          content: currentNotice.content,
          date: currentNotice.date,
          isNew: currentNotice.isNew || false,
          updatedAt: serverTimestamp()
        });
      } else if (db) {
        await addDoc(collection(db, 'notices'), {
          ...currentNotice,
          isNew: currentNotice.isNew || false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      setCurrentNotice({});
    } catch (error) {
      console.error("Error saving notice:", error);
      alert("저장에 실패했습니다. Firebase 설정을 확인해주세요.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      try {
        if (db) await deleteDoc(doc(db, 'notices', id));
      } catch (error) {
        console.error("Error deleting notice:", error);
      }
    }
  };

  if (!mounted) return null;

  if (loading) return createPortal(
    <div className="fixed inset-0 bg-white flex items-center justify-center z-[20000]">불러오는 중...</div>,
    document.body
  );

  return createPortal(
    <div className="fixed inset-0 bg-gray-50 z-[20000] overflow-y-auto">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <LayoutDashboard className="w-6 h-6 text-[#0c468c]" />
          <h1 className="text-xl font-bold">AIK 공지사항 관리</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:inline">{user?.email}</span>
          <button onClick={logout} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <LogOut className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      {!user || !isAdmin ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6">
          <h1 className="text-2xl font-bold mb-6">관리자 로그인</h1>
          {!user ? (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-lg font-bold hover:bg-black/80 transition-all cursor-pointer"
            >
              Google 계정으로 로그인
            </button>
          ) : (
            <div className="text-center">
              <p className="text-red-500 mb-4">관리자 권한이 없습니다. ({user.email})</p>
              <button onClick={logout} className="text-sm underline cursor-pointer">로그아웃</button>
            </div>
          )}
          <button onClick={onClose} className="mt-8 text-black/40 hover:text-black flex items-center gap-1 cursor-pointer">
            <ChevronLeft className="w-4 h-4" /> 메인으로 돌아가기
          </button>
        </div>
      ) : (
        <main className="max-w-5xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">공지사항 목록</h2>
            <button 
              onClick={() => {
                setIsEditing(true);
                setCurrentNotice({ date: new Date().toISOString().split('T')[0] });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0c468c] text-white rounded-lg font-bold hover:bg-[#0c468c]/90 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> 신규 등록
            </button>
          </div>

          <div className="grid gap-4">
            {notices.map((notice) => (
              <div key={notice.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-[#0c468c] bg-[#0c468c]/5 px-2 py-0.5 rounded">
                      {notice.date}
                    </span>
                    {notice.isNew && (
                      <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-sm">
                        NEW
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{notice.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{notice.content}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button 
                    onClick={() => {
                      setIsEditing(true);
                      setCurrentNotice(notice);
                    }}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(notice.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {notices.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </div>
        </main>
      )}

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[20001] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsEditing(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-[#0c468c] px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold">{currentNotice.id ? '공지사항 수정' : '신규 공지사항 등록'}</h3>
                <button onClick={() => setIsEditing(false)} className="text-white/60 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">제목</label>
                  <input 
                    type="text"
                    required
                    value={currentNotice.title || ''}
                    onChange={(e) => setCurrentNotice({ ...currentNotice, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0c468c] focus:outline-none"
                    placeholder="제목을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">날짜</label>
                  <input 
                    type="text"
                    required
                    value={currentNotice.date || ''}
                    onChange={(e) => setCurrentNotice({ ...currentNotice, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0c468c] focus:outline-none"
                    placeholder="2026.05.07"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">내용</label>
                  <textarea 
                    required
                    rows={6}
                    value={currentNotice.content || ''}
                    onChange={(e) => setCurrentNotice({ ...currentNotice, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0c468c] focus:outline-none resize-none"
                    placeholder="공지 내용을 입력하세요"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="isNew"
                    checked={currentNotice.isNew || false}
                    onChange={(e) => setCurrentNotice({ ...currentNotice, isNew: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0c468c] focus:ring-[#0c468c]"
                  />
                  <label htmlFor="isNew" className="text-sm font-bold">New 태그 표시</label>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#0c468c] text-white rounded-lg font-bold hover:bg-[#0c468c]/90 transition-colors cursor-pointer"
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}

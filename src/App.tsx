/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, lazy, Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';

const BoardModal = lazy(() => import('./components/BoardModal').then(m => ({ default: m.BoardModal })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

/**
 * AIK CONTENTS - Video Production Agency Website
 * Professionalism meets Innovation.
 */
export default function App() {
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    // Smooth scroll setup for hash links
    const handleHashChange = () => {
      const { hash } = window.location;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="relative min-h-screen">
      <main className="selection:bg-brand selection:text-white">
        <Header onOpenNotice={() => setIsBoardOpen(true)} />
        <Hero />
        <Services />
        <About />
        <Portfolio />
        <Contact />
        <Footer onAdminTrigger={() => setIsAdminOpen(true)} />
      </main>

      {/* Fixed UI Elements */}
      <ScrollToTop />
      <Suspense fallback={null}>
        <BoardModal isOpen={isBoardOpen} onClose={() => setIsBoardOpen(false)} />
        {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} />}
      </Suspense>
      
      {/* Background Decorative Element */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-white">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

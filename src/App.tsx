import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingPaws from '@/components/FloatingPaws';
import Home from '@/pages/Home';
import Menu from '@/pages/Menu';
import Cats from '@/pages/Cats';
import Adopt from '@/pages/Adopt';
import Contact from '@/pages/Contact';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';

type Page = 'home' | 'menu' | 'cats' | 'adopt' | 'contact' | 'admin';

interface NavParams {
  selectedCatId?: string | null;
  selectedCatName?: string | null;
}

function App() {
  const [page, setPage] = useState<Page>('home');
  const [params, setParams] = useState<NavParams>({});
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
      })();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleNavigate = (newPage: string, newParams?: Record<string, unknown>) => {
    setPage(newPage as Page);
    setParams(newParams ? (newParams as NavParams) : {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setPage('home');
  };

  const isAdminPage = page === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <FloatingPaws count={6} />
      <Navbar currentPage={page} onNavigate={handleNavigate} />

      <main className="flex-1">
        {page === 'home' && <Home onNavigate={handleNavigate} />}
        {page === 'menu' && <Menu />}
        {page === 'cats' && <Cats onNavigate={handleNavigate} preselectedCatId={params.selectedCatId} />}
        {page === 'adopt' && <Adopt onNavigate={handleNavigate} preselectedCatId={params.selectedCatId} preselectedCatName={params.selectedCatName} />}
        {page === 'contact' && <Contact />}
        {page === 'admin' && (
          authLoading ? null : session
            ? <AdminDashboard session={session} onLogout={handleLogout} />
            : <AdminLogin onLoggedIn={setSession} session={session} onLogout={handleLogout} />
        )}
      </main>

      {!isAdminPage && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}

export default App;

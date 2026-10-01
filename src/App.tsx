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
import AdminLogin, { useStaffApproval } from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import { LanguageProvider } from '@/lib/i18n';
import { CurrencyProvider } from '@/lib/currency';

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
      setSession(session);
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
    <LanguageProvider>
      <CurrencyProvider>
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
          authLoading ? null : (
            <AdminRouter
              session={session}
              onLogout={handleLogout}
            />
          )
        )}
      </main>

          {!isAdminPage && <Footer onNavigate={handleNavigate} />}
        </div>
      </CurrencyProvider>
    </LanguageProvider>
  );
}

function AdminRouter({ session, onLogout }: { session: Session | null; onLogout: () => void }) {
  const { state: approvalState, refresh } = useStaffApproval(session);

  if (!session) {
    return (
      <AdminLogin
        onLoggedIn={() => {}}
        session={null}
        onLogout={onLogout}
        approvalState={approvalState}
        onRefreshApproval={refresh}
      />
    );
  }

  // Approved — show dashboard
  if (approvalState.status === 'approved') {
    return <AdminDashboard session={session} onLogout={onLogout} />;
  }

  // Pending, rejected, no_profile, or loading — show login/gate screen
  return (
    <AdminLogin
      onLoggedIn={() => {}}
      session={session}
      onLogout={onLogout}
      approvalState={approvalState}
      onRefreshApproval={refresh}
    />
  );
}

export default App;

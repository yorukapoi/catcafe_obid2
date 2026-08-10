import { useEffect, useState } from 'react';
import { LayoutDashboard, Coffee, Cat, FileText, LogOut, Plus, Edit2, Trash2, X, Check, Download, Search } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import type { MenuItem, Cat as CatType, AdoptionApplication, MenuCategory, CatStatus, ApplicationStatus } from '@/lib/types';
import { MENU_CATEGORIES, CAT_STATUSES, APPLICATION_STATUSES, DIETARY_TAGS } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { StatusBadge, DietaryBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type Tab = 'overview' | 'menu' | 'cats' | 'applications';

interface AdminDashboardProps {
  session: Session;
  onLogout: () => void;
}

export default function AdminDashboard({ session, onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cats, setCats] = useState<CatType[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [menuRes, catsRes, appsRes] = await Promise.all([
      supabase.from('menu_items').select('*').order('sort_order'),
      supabase.from('cats').select('*').order('sort_order'),
      supabase.from('adoption_applications').select('*').order('created_at', { ascending: false }),
    ]);
    setMenuItems(menuRes.data as MenuItem[] || []);
    setCats(catsRes.data as CatType[] || []);
    setApplications(appsRes.data as AdoptionApplication[] || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const stats = {
    totalCats: cats.length,
    availableCats: cats.filter((c) => c.status === 'available').length,
    pendingApps: applications.filter((a) => a.status === 'under_review').length,
    totalMenu: menuItems.length,
  };

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'menu' as Tab, label: 'Menu Items', icon: Coffee },
    { id: 'cats' as Tab, label: 'Cats', icon: Cat },
    { id: 'applications' as Tab, label: 'Applications', icon: FileText },
  ];

  return (
    <div className="pt-20 pb-12 min-h-screen bg-cream-50">
      <div className="section-padding">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-warm-700">Admin Dashboard</h1>
            <p className="text-warm-400 text-sm">Signed in as {session.user.email}</p>
          </div>
          <button onClick={onLogout} className="btn-ghost text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-2xl p-2 shadow-sm shadow-rose-100 border border-rose-100/40">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  tab === t.id ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'text-warm-500 hover:bg-rose-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {t.id === 'applications' && stats.pendingApps > 0 && (
                  <span className="ml-1 bg-warm-400 text-white text-xs px-1.5 py-0.5 rounded-full">{stats.pendingApps}</span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <LoadingSpinner label="Loading dashboard..." />
        ) : (
          <>
            {tab === 'overview' && <OverviewTab stats={stats} recentApps={applications.slice(0, 5)} />}
            {tab === 'menu' && <MenuManager items={menuItems} onChange={loadData} />}
            {tab === 'cats' && <CatManager cats={cats} onChange={loadData} />}
            {tab === 'applications' && <ApplicationsManager applications={applications} onChange={loadData} />}
          </>
        )}
      </div>
    </div>
  );
}

/* ============ Overview Tab ============ */
function OverviewTab({ stats, recentApps }: { stats: { totalCats: number; availableCats: number; pendingApps: number; totalMenu: number }, recentApps: AdoptionApplication[] }) {
  const cards = [
    { label: 'Total Cats', value: stats.totalCats, icon: Cat, color: 'lavender' },
    { label: 'Available for Adoption', value: stats.availableCats, icon: Cat, color: 'mint' },
    { label: 'Pending Applications', value: stats.pendingApps, icon: FileText, color: 'warm' },
    { label: 'Menu Items', value: stats.totalMenu, icon: Coffee, color: 'rose' },
  ];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          const colorMap: Record<string, string> = {
            lavender: 'bg-lavender-100 text-lavender-500',
            mint: 'bg-mint-100 text-mint-500',
            warm: 'bg-warm-100 text-warm-500',
            rose: 'bg-rose-100 text-rose-500',
          };
          return (
            <div key={i} className="card-pastel p-5 animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`w-12 h-12 rounded-full ${colorMap[c.color]} flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="font-display font-bold text-3xl text-warm-700">{c.value}</p>
              <p className="text-warm-400 text-sm">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="font-display font-bold text-xl text-warm-700 mb-4">Recent Applications</h2>
        {recentApps.length === 0 ? (
          <div className="card-pastel p-8 text-center text-warm-400 text-sm">No applications yet.</div>
        ) : (
          <div className="space-y-2">
            {recentApps.map((app) => (
              <div key={app.id} className="card-pastel p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-warm-700 truncate">{app.applicant_name}</p>
                  <p className="text-warm-400 text-sm truncate">
                    {app.selected_cat_name || 'Open application'} · {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge label={APPLICATION_STATUSES.find((s) => s.value === app.status)?.label || app.status} color={APPLICATION_STATUSES.find((s) => s.value === app.status)?.color || 'warm'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ Menu Manager ============ */
function MenuManager({ items, onChange }: { items: MenuItem[]; onChange: () => void }) {
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this menu item? This cannot be undone.')) return;
    await supabase.from('menu_items').delete().eq('id', id);
    onChange();
  };

  const handleSave = async (data: Partial<MenuItem>) => {
    if (editing) {
      await supabase.from('menu_items').update(data).eq('id', editing.id);
    } else {
      await supabase.from('menu_items').insert(data);
    }
    setShowForm(false);
    setEditing(null);
    onChange();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl text-warm-700">Menu Items ({items.length})</h2>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="card-pastel overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden bg-rose-50 relative">
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs font-bold text-rose-500">${item.price.toFixed(2)}</div>
              {!item.is_available && <div className="absolute inset-0 bg-warm-700/60 flex items-center justify-center"><span className="text-white font-bold">Unavailable</span></div>}
            </div>
            <div className="p-4">
              <h3 className="font-display font-bold text-warm-700 text-sm">{item.name}</h3>
              <p className="text-warm-400 text-xs mb-2">{MENU_CATEGORIES.find((c) => c.value === item.category)?.label}</p>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(item); setShowForm(true); }} className="flex-1 btn-ghost text-xs py-2"><Edit2 className="w-3 h-3" />Edit</button>
                <button onClick={() => handleDelete(item.id)} className="btn-ghost text-xs py-2 text-rose-500 border-rose-200 hover:bg-rose-50"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <MenuItemForm
          item={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function MenuItemForm({ item, onSave, onClose }: { item: MenuItem | null; onSave: (data: Partial<MenuItem>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price?.toString() || '',
    image_url: item?.image_url || '',
    category: item?.category || 'coffee' as MenuCategory,
    dietary_tags: item?.dietary_tags || [],
    is_available: item?.is_available ?? true,
    sort_order: item?.sort_order ?? 0,
  });

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag as any)
        ? prev.dietary_tags.filter((t) => t !== tag)
        : [...prev.dietary_tags, tag as any],
    }));
  };

  return (
    <Modal isOpen onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6 sm:p-8">
        <h2 className="font-display font-bold text-2xl text-warm-700 mb-6">{item ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
          <div>
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-pastel" placeholder="Pawsome Cappuccino" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-pastel resize-none" rows={3} placeholder="A velvety cappuccino..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-warm-600 mb-1.5">Price *</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-pastel" placeholder="4.75" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-warm-600 mb-1.5">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MenuCategory })} className="input-pastel">
                {MENU_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">Image URL *</label>
            <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-pastel" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-warm-600 mb-2">Dietary Tags</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map((tag) => (
                <button key={tag} onClick={() => toggleTag(tag)} className={`badge px-3 py-1.5 border transition-all ${form.dietary_tags.includes(tag) ? 'bg-mint-400 text-white border-mint-500' : 'bg-white text-warm-500 border-rose-100'}`}>
                  {form.dietary_tags.includes(tag) && <Check className="w-3 h-3 mr-1" />}{tag}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="w-5 h-5 rounded accent-rose-400" />
            <span className="text-sm text-warm-600">Available on menu</span>
          </label>
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-rose-100">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => onSave({ ...form, price: parseFloat(form.price) || 0 })} className="btn-primary flex-1">Save</button>
        </div>
      </div>
    </Modal>
  );
}

/* ============ Cat Manager ============ */
function CatManager({ cats, onChange }: { cats: CatType[]; onChange: () => void }) {
  const [editing, setEditing] = useState<CatType | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cat profile? This cannot be undone.')) return;
    await supabase.from('cats').delete().eq('id', id);
    onChange();
  };

  const handleSave = async (data: Partial<CatType>) => {
    if (editing) {
      await supabase.from('cats').update(data).eq('id', editing.id);
    } else {
      await supabase.from('cats').insert(data);
    }
    setShowForm(false);
    setEditing(null);
    onChange();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl text-warm-700">Cats ({cats.length})</h2>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" /> Add Cat
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map((cat) => {
          const statusInfo = CAT_STATUSES.find((s) => s.value === cat.status);
          return (
            <div key={cat.id} className="card-pastel overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden bg-rose-50 relative">
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute top-2 left-2">{statusInfo && <StatusBadge label={statusInfo.label} color={statusInfo.color} />}</div>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-warm-700">{cat.name}</h3>
                <p className="text-warm-400 text-xs mb-2">{cat.breed} · {cat.age}</p>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(cat); setShowForm(true); }} className="flex-1 btn-ghost text-xs py-2"><Edit2 className="w-3 h-3" />Edit</button>
                  <button onClick={() => handleDelete(cat.id)} className="btn-ghost text-xs py-2 text-rose-500 border-rose-200 hover:bg-rose-50"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <CatForm item={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

function CatForm({ item, onSave, onClose }: { item: CatType | null; onSave: (data: Partial<CatType>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    age: item?.age || '',
    breed: item?.breed || '',
    bio: item?.bio || '',
    image_url: item?.image_url || '',
    gallery_urls: (item?.gallery_urls || []).join(', '),
    status: item?.status || 'resident' as CatStatus,
    favorite_toys: (item?.favorite_toys || []).join(', '),
    good_with_kids: item?.good_with_kids ?? true,
    good_with_pets: item?.good_with_pets ?? true,
    backstory: item?.backstory || '',
    sort_order: item?.sort_order ?? 0,
  });

  const toArray = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

  return (
    <Modal isOpen onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6 sm:p-8">
        <h2 className="font-display font-bold text-2xl text-warm-700 mb-6">{item ? 'Edit Cat Profile' : 'Add Cat Profile'}</h2>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-warm-600 mb-1.5">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-pastel" placeholder="Mochi" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-warm-600 mb-1.5">Age *</label>
              <input type="text" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input-pastel" placeholder="2 years" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-warm-600 mb-1.5">Breed *</label>
              <input type="text" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} className="input-pastel" placeholder="Maine Coon" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">Short Bio *</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-pastel resize-none" rows={2} placeholder="A gentle giant who loves belly rubs..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">Primary Image URL *</label>
            <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-pastel" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">Gallery URLs (comma-separated)</label>
            <input type="text" value={form.gallery_urls} onChange={(e) => setForm({ ...form, gallery_urls: e.target.value })} className="input-pastel" placeholder="https://..., https://..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">Status *</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CatStatus })} className="input-pastel">
              {CAT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">Favorite Toys (comma-separated)</label>
            <input type="text" value={form.favorite_toys} onChange={(e) => setForm({ ...form, favorite_toys: e.target.value })} className="input-pastel" placeholder="Feather wand, Crinkle ball" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">Backstory</label>
            <textarea value={form.backstory} onChange={(e) => setForm({ ...form, backstory: e.target.value })} className="input-pastel resize-none" rows={3} placeholder="Mochi was found as a kitten..." />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.good_with_kids} onChange={(e) => setForm({ ...form, good_with_kids: e.target.checked })} className="w-5 h-5 rounded accent-rose-400" />
              <span className="text-sm text-warm-600">Good with kids</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.good_with_pets} onChange={(e) => setForm({ ...form, good_with_pets: e.target.checked })} className="w-5 h-5 rounded accent-rose-400" />
              <span className="text-sm text-warm-600">Good with pets</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-rose-100">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => onSave({
            ...form,
            gallery_urls: toArray(form.gallery_urls),
            favorite_toys: toArray(form.favorite_toys),
          })} className="btn-primary flex-1">Save</button>
        </div>
      </div>
    </Modal>
  );
}

/* ============ Applications Manager ============ */
function ApplicationsManager({ applications, onChange }: { applications: AdoptionApplication[]; onChange: () => void }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [selectedApp, setSelectedApp] = useState<AdoptionApplication | null>(null);

  const filtered = applications.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!app.applicant_name.toLowerCase().includes(q) && !app.email.toLowerCase().includes(q) && !app.selected_cat_name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    await supabase.from('adoption_applications').update({ status }).eq('id', id);
    onChange();
    setSelectedApp(null);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Address', 'Cat', 'Housing', 'Household', 'Status', 'Date'];
    const rows = filtered.map((a) => [
      a.applicant_name, a.email, a.phone, a.address, a.selected_cat_name || 'Open',
      a.housing_type, a.household_members.toString(), a.status, new Date(a.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adoption-applications.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h2 className="font-display font-bold text-xl text-warm-700">Adoption Applications ({filtered.length})</h2>
        <button onClick={exportCSV} className="btn-mint text-sm py-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-300" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-pastel pl-11" placeholder="Search by name, email, or cat..." />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')} className="input-pastel sm:w-48">
          <option value="all">All Statuses</option>
          {APPLICATION_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card-pastel p-12 text-center">
          <FileText className="w-12 h-12 text-warm-200 mx-auto mb-3" />
          <p className="text-warm-400">No applications found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((app) => {
            const statusInfo = APPLICATION_STATUSES.find((s) => s.value === app.status);
            return (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="card-pastel-hover p-4 flex items-center justify-between gap-4 w-full text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-warm-700 truncate">{app.applicant_name}</p>
                  <p className="text-warm-400 text-sm truncate">
                    {app.selected_cat_name || 'Open application'} · {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                {statusInfo && <StatusBadge label={statusInfo.label} color={statusInfo.color} />}
              </button>
            );
          })}
        </div>
      )}

      {selectedApp && (
        <Modal isOpen onClose={() => setSelectedApp(null)} maxWidth="max-w-lg">
          <div className="p-6 sm:p-8">
            <h2 className="font-display font-bold text-2xl text-warm-700 mb-1">{selectedApp.applicant_name}</h2>
            <p className="text-warm-400 text-sm mb-6">Submitted {new Date(selectedApp.created_at).toLocaleDateString()}</p>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <InfoCard label="Email" value={selectedApp.email} />
                <InfoCard label="Phone" value={selectedApp.phone} />
              </div>
              <InfoCard label="Address" value={selectedApp.address} />
              <div className="grid grid-cols-2 gap-3">
                <InfoCard label="Housing" value={selectedApp.housing_type === 'rent' ? 'Renting' : 'Owns home'} />
                <InfoCard label="Household" value={`${selectedApp.household_members} member(s)`} />
              </div>
              {selectedApp.other_pets && <InfoCard label="Other Pets" value={selectedApp.other_pets} />}
              <InfoCard label="Interested Cat" value={selectedApp.selected_cat_name || 'Open application'} />
              <InfoCard label="Previous Experience" value={selectedApp.previous_experience} />
              <InfoCard label="Daily Routine" value={selectedApp.daily_routine} />
            </div>

            <div className="mt-6 pt-4 border-t border-rose-100">
              <p className="text-sm font-semibold text-warm-600 mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {APPLICATION_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => updateStatus(selectedApp.id, s.value)}
                    className={`badge px-4 py-2 border transition-all ${
                      selectedApp.status === s.value
                        ? `bg-${s.color}-400 text-white border-${s.color}-500`
                        : 'bg-white text-warm-500 border-rose-100 hover:border-rose-200'
                    }`}
                  >
                    {selectedApp.status === s.value && <Check className="w-3 h-3 mr-1" />}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream-100 rounded-2xl p-3">
      <p className="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-warm-600">{value}</p>
    </div>
  );
}

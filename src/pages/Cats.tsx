import { useEffect, useMemo, useState } from 'react';
import { Cat as CatIcon, Search, X, Heart, Baby, PawPrint, Check, Sparkles } from 'lucide-react';
import type { Cat, CatStatus } from '@/lib/types';
import { CAT_STATUSES } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { StatusBadge } from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { useLanguage, localizedValue } from '@/lib/i18n';

interface CatsProps {
  onNavigate: (page: string, params?: Record<string, unknown>) => void;
  preselectedCatId?: string | null;
}

export default function Cats({ onNavigate, preselectedCatId }: CatsProps) {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CatStatus | 'all'>('all');
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const { language, t } = useLanguage();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('cats').select('*').order('sort_order');
      if (!error && data) {
        setCats(data as Cat[]);
        if (preselectedCatId) {
          const pre = (data as Cat[]).find((c) => c.id === preselectedCatId);
          if (pre) setSelectedCat(pre);
        }
      }
      setLoading(false);
    })();
  }, [preselectedCatId]);

  const filtered = useMemo(() => {
    return cats.filter((cat) => {
      if (statusFilter !== 'all' && cat.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!localizedValue(language, cat.name, cat.name_mk).toLowerCase().includes(q) && !cat.breed.toLowerCase().includes(q) && !localizedValue(language, cat.bio, cat.bio_mk).toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [cats, statusFilter, search, language]);

  const openCat = (cat: Cat) => {
    setSelectedCat(cat);
    setActiveImageIdx(0);
  };

  const allImages = selectedCat ? [selectedCat.image_url, ...selectedCat.gallery_urls] : [];

  return (
    <div className="pt-24 pb-12 min-h-screen bg-cream-50 bg-paw-mint">
      <div className="section-padding">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-warm-700 mb-3">
            {t('Our Furry Friends')}
          </h1>
          <p className="text-warm-500 max-w-xl mx-auto">
            Get to know our resident and adoptable cats. Each one has a unique story and is
            waiting to steal your heart.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-3xl shadow-sm shadow-rose-100 p-4 sm:p-6 mb-8 border border-rose-100/40">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-300" />
              <input
                type="text"
                placeholder="Search by name, breed, or personality..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-pastel pl-12"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-300 hover:text-rose-400">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`badge px-4 py-2 transition-all ${
                  statusFilter === 'all' ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-cream-100 text-warm-600 hover:bg-rose-100'
                }`}
              >
                {t('All Cats')}
              </button>
              {CAT_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`badge px-4 py-2 transition-all ${
                    statusFilter === s.value ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-cream-100 text-warm-600 hover:bg-rose-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <LoadingSpinner label="Rounding up the cats..." />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-full bg-lavender-100 flex items-center justify-center mb-4">
              <CatIcon className="w-10 h-10 text-lavender-300" />
            </div>
            <p className="text-warm-500 font-semibold text-lg mb-2">{t('No cats found')}</p>
            <p className="text-warm-400 text-sm">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cat, i) => {
              const statusInfo = CAT_STATUSES.find((s) => s.value === cat.status);
              return (
                <button
                  key={cat.id}
                  onClick={() => openCat(cat)}
                  className="card-pastel-hover overflow-hidden text-left group animate-fadeIn"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="aspect-[4/5] overflow-hidden bg-rose-50 relative">
                    <img
                      src={cat.image_url}
                      alt={localizedValue(language, cat.name, cat.name_mk)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      {statusInfo && <StatusBadge label={statusInfo.label} color={statusInfo.color} />}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-warm-700/80 to-transparent p-4 pt-12">
                      <h3 className="font-display font-bold text-white text-xl">{localizedValue(language, cat.name, cat.name_mk)}</h3>
                      <p className="text-white/80 text-sm">{cat.breed} · {cat.age}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-warm-500 text-sm leading-relaxed line-clamp-2">{localizedValue(language, cat.bio, cat.bio_mk)}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-warm-400">
                      {cat.good_with_kids && (
                        <span className="flex items-center gap-1 text-mint-600">
                          <Baby className="w-3 h-3" /> Kids
                        </span>
                      )}
                      {cat.good_with_pets && (
                        <span className="flex items-center gap-1 text-sky-600">
                          <PawPrint className="w-3 h-3" /> Pets
                        </span>
                      )}
                      <span className="ml-auto text-rose-400 font-semibold group-hover:translate-x-1 transition-transform">
                        View →
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedCat} onClose={() => setSelectedCat(null)} maxWidth="max-w-3xl">
        {selectedCat && (
          <div>
            {/* Image Gallery */}
            <div className="aspect-[16/10] overflow-hidden bg-rose-50 rounded-t-4xl relative">
              <img
                src={allImages[activeImageIdx] || selectedCat.image_url}
                alt={localizedValue(language, selectedCat.name, selectedCat.name_mk)}
                className="w-full h-full object-cover transition-opacity duration-300"
                key={activeImageIdx}
              />
              <div className="absolute top-4 left-4">
                {(() => {
                  const statusInfo = CAT_STATUSES.find((s) => s.value === selectedCat.status);
                  return statusInfo ? <StatusBadge label={statusInfo.label} color={statusInfo.color} /> : null;
                })()}
              </div>
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === activeImageIdx ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Photo ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2 className="font-display font-bold text-3xl text-warm-700">{localizedValue(language, selectedCat.name, selectedCat.name_mk)}</h2>
                <div className="text-right">
                  <p className="text-warm-400 text-sm">{selectedCat.breed}</p>
                  <p className="text-warm-500 font-semibold">{selectedCat.age}</p>
                </div>
              </div>

              <p className="text-warm-500 leading-relaxed mb-6">{localizedValue(language, selectedCat.bio, selectedCat.bio_mk)}</p>

              {/* Compatibility */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className={`rounded-2xl p-4 flex items-center gap-3 ${selectedCat.good_with_kids ? 'bg-mint-50 border border-mint-200' : 'bg-rose-50 border border-rose-200'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedCat.good_with_kids ? 'bg-mint-200' : 'bg-rose-200'}`}>
                    <Baby className={`w-5 h-5 ${selectedCat.good_with_kids ? 'text-mint-700' : 'text-rose-700'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-warm-700 text-sm">Good with kids</p>
                    <p className={`text-xs ${selectedCat.good_with_kids ? 'text-mint-600' : 'text-rose-600'}`}>
                      {selectedCat.good_with_kids ? 'Yes, loves children' : 'Prefers quiet homes'}
                    </p>
                  </div>
                </div>
                <div className={`rounded-2xl p-4 flex items-center gap-3 ${selectedCat.good_with_pets ? 'bg-sky-50 border border-sky-200' : 'bg-rose-50 border border-rose-200'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedCat.good_with_pets ? 'bg-sky-200' : 'bg-rose-200'}`}>
                    <PawPrint className={`w-5 h-5 ${selectedCat.good_with_pets ? 'text-sky-700' : 'text-rose-700'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-warm-700 text-sm">Good with pets</p>
                    <p className={`text-xs ${selectedCat.good_with_pets ? 'text-sky-600' : 'text-rose-600'}`}>
                      {selectedCat.good_with_pets ? 'Yes, loves other animals' : 'Solo cat preferred'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Favorite Toys */}
              {selectedCat.favorite_toys.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-display font-bold text-warm-700 text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-warm-400" /> Favorite Toys
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCat.favorite_toys.map((toy, i) => (
                      <span key={i} className="badge bg-lavender-100 text-lavender-700 px-3 py-1.5">
                        {toy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Backstory */}
              {selectedCat.backstory && (
                <div className="mb-6">
                  <h4 className="font-display font-bold text-warm-700 text-sm mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" /> My Story
                  </h4>
                  <p className="text-warm-500 text-sm leading-relaxed bg-cream-100 rounded-2xl p-4">
                    {localizedValue(language, selectedCat.backstory, selectedCat.backstory_mk)}
                  </p>
                </div>
              )}

              {/* Adopt CTA */}
              {(selectedCat.status === 'available' || selectedCat.status === 'pending') && (
                <button
                  onClick={() => {
                    setSelectedCat(null);
                    onNavigate('adopt', { selectedCatId: selectedCat.id, selectedCatName: selectedCat.name });
                  }}
                  className="btn-primary w-full text-base py-4 group"
                >
                  <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {t('Adopt')} {localizedValue(language, selectedCat.name, selectedCat.name_mk)}
                </button>
              )}
              {selectedCat.status === 'resident' && (
                <div className="bg-lavender-50 border border-lavender-200 rounded-2xl p-4 flex items-center gap-3">
                  <Check className="w-5 h-5 text-lavender-500" />
                  <p className="text-warm-600 text-sm">
                    {selectedCat.name} is a permanent resident at our café. Come visit and say hello!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

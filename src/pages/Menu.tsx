import { useEffect, useMemo, useState } from 'react';
import { Search, X, Coffee, Croissant, Leaf, CupSoda, Filter } from 'lucide-react';
import type { MenuItem, MenuCategory, DietaryTag } from '@/lib/types';
import { MENU_CATEGORIES, DIETARY_TAGS } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useLanguage, localizedValue } from '@/lib/i18n';
import { useCurrency } from '@/lib/currency';
import { DietaryBadge } from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';

const categoryIcons: Record<MenuCategory, typeof Coffee> = {
  coffee: Coffee,
  pastry: Croissant,
  tea: CupSoda,
  vegan: Leaf,
};

export default function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'all'>('all');
  const [activeTags, setActiveTags] = useState<DietaryTag[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const { language } = useLanguage();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('sort_order');
      if (!error && data) setItems(data as MenuItem[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (activeTags.length > 0 && !activeTags.every((tag) => item.dietary_tags.includes(tag))) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!localizedValue(language, item.name, item.name_mk).toLowerCase().includes(q) && !localizedValue(language, item.description, item.description_mk).toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [items, activeCategory, activeTags, search, language]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<MenuCategory, MenuItem[]>();
    for (const item of filtered) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return map;
  }, [filtered]);

  const toggleTag = (tag: DietaryTag) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('all');
    setActiveTags([]);
  };

  const hasFilters = search || activeCategory !== 'all' || activeTags.length > 0;

  return (
    <div className="pt-24 pb-12 min-h-screen bg-cream-50 bg-paw-pattern">
      <div className="section-padding">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-warm-700 mb-3">
            Our <span className="heading-gradient">Menu</span>
          </h1>
          <p className="text-warm-500 max-w-xl mx-auto">
            From pawsome coffee to purrfect pastries — every treat is made fresh daily with love.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-3xl shadow-sm shadow-rose-100 p-4 sm:p-6 mb-8 border border-rose-100/40">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-300" />
              <input
                type="text"
                placeholder="Search for treats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-pastel pl-12"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-300 hover:text-rose-400"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`badge px-4 py-2 transition-all ${
                  activeCategory === 'all'
                    ? 'bg-rose-400 text-white shadow-md shadow-rose-200'
                    : 'bg-cream-100 text-warm-600 hover:bg-rose-100 hover:text-rose-500'
                }`}
              >
                <Filter className="w-3 h-3 mr-1" />
                All Items
              </button>
              {MENU_CATEGORIES.map((cat) => {
                const Icon = categoryIcons[cat.value];
                const isActive = activeCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`badge px-4 py-2 transition-all ${
                      isActive
                        ? 'bg-rose-400 text-white shadow-md shadow-rose-200'
                        : 'bg-cream-100 text-warm-600 hover:bg-rose-100 hover:text-rose-500'
                    }`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Dietary tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-warm-400 uppercase tracking-wide mr-1">Dietary:</span>
              {DIETARY_TAGS.map((tag) => {
                const isActive = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`badge px-3 py-1.5 transition-all border ${
                      isActive
                        ? 'bg-mint-400 text-white border-mint-500 shadow-sm'
                        : 'bg-white text-warm-500 border-rose-100 hover:border-mint-300 hover:text-mint-600'
                    }`}
                  >
                    {isActive && <span className="mr-1">✓</span>}
                    {tag}
                  </button>
                );
              })}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="badge px-3 py-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors ml-auto"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner label="Fetching treats..." />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-rose-300" />
            </div>
            <p className="text-warm-500 font-semibold text-lg mb-2">No treats found</p>
            <p className="text-warm-400 text-sm mb-4">Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="btn-ghost">Clear Filters</button>
          </div>
        ) : (
          <div className="space-y-12">
            {Array.from(groupedByCategory.entries()).map(([category, catItems]) => {
              const catConfig = MENU_CATEGORIES.find((c) => c.value === category);
              const Icon = categoryIcons[category];
              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-200 to-lavender-200 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-warm-700" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-2xl text-warm-700">{catConfig?.label}</h2>
                      <p className="text-warm-400 text-sm">{catItems.length} item{catItems.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catItems.map((item, i) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="card-pastel-hover overflow-hidden text-left group animate-fadeIn"
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-rose-50 relative">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow-sm">
                            <span className="font-bold text-rose-500">{formatPrice(item.price)}</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-display font-bold text-warm-700 text-lg mb-1">{localizedValue(language, item.name, item.name_mk)}</h3>
                          <p className="text-warm-500 text-sm leading-relaxed line-clamp-2 mb-3">{localizedValue(language, item.description, item.description_mk)}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.dietary_tags.map((tag) => (
                              <DietaryBadge key={tag} tag={tag} size="sm" />
                            ))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)}>
        {selectedItem && (
          <div>
            <div className="aspect-[16/9] overflow-hidden bg-rose-50 rounded-t-4xl">
              <img src={selectedItem.image_url} alt={localizedValue(language, selectedItem.name, selectedItem.name_mk)} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-warm-700">{localizedValue(language, selectedItem.name, selectedItem.name_mk)}</h2>
                <span className="font-bold text-rose-500 text-2xl whitespace-nowrap">${selectedItem.price.toFixed(2)}</span>
              </div>
              <p className="text-warm-500 leading-relaxed mb-6">{localizedValue(language, selectedItem.description, selectedItem.description_mk)}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedItem.dietary_tags.map((tag) => (
                  <DietaryBadge key={tag} tag={tag} />
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-warm-400 bg-cream-100 rounded-2xl p-4">
                <Coffee className="w-4 h-4 text-rose-400" />
                <span>Available now at the café. Ask our staff about pairings!</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

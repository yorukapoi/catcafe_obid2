import { useEffect, useMemo, useState } from 'react';
import { Search, Coffee, Croissant, Leaf, CupSoda } from 'lucide-react';
import type { MenuItem, MenuCategory, DietaryTag } from '@/lib/types';
import { MENU_CATEGORIES, DIETARY_TAGS } from '@/lib/types';
import { supabase } from '@/lib/supabase';
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
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

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


  const groupedByCategory = useMemo(() => {
    const map = new Map<MenuCategory, MenuItem[]>();
    for (const item of items) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return map;
  }, [items]);

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('all');
    setActiveTags([]);
  };

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

        {/* Results */}
        {loading ? (
          <LoadingSpinner label="Fetching treats..." />
        ) : items.length === 0 ? (
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
                            <span className="font-bold text-rose-500">{item.price} ден.</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-display font-bold text-warm-700 text-lg mb-1">{item.name}</h3>
                          <p className="text-warm-500 text-sm leading-relaxed line-clamp-2 mb-3">{item.description}</p>
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
              <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-warm-700">{selectedItem.name}</h2>
                <span className="font-bold text-rose-500 text-2xl whitespace-nowrap">{selectedItem.price} ден.</span>
              </div>
              <p className="text-warm-500 leading-relaxed mb-6">{selectedItem.description}</p>
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

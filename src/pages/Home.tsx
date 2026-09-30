import { useEffect, useState } from 'react';
import { Cat, Coffee, Heart, ArrowRight, PawPrint, Star, Clock, MapPin } from 'lucide-react';
import type { Cat as CatType, MenuItem } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { StatusBadge } from '@/components/ui/Badge';

interface HomeProps {
  onNavigate: (page: string, params?: Record<string, unknown>) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [featuredCats, setFeaturedCats] = useState<CatType[]>([]);
  const [featuredMenu, setFeaturedMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [catsRes, menuRes] = await Promise.all([
        supabase.from('cats').select('*').order('sort_order').limit(4),
        supabase.from('menu_items').select('*').eq('is_available', true).order('sort_order').limit(3),
      ]);
      setFeaturedCats(catsRes.data || []);
      setFeaturedMenu(menuRes.data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 via-cream-50 to-cream-50 bg-paw-pattern">
        <div className="section-padding py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-600 text-sm font-semibold mb-6">
                <PawPrint className="w-4 h-4" />
                Now serving purrs & pastries
              </div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-warm-700 leading-tight mb-6 text-balance">
                Where every cup comes with a{' '}
                <span className="heading-gradient">purr</span>
              </h1>
              <p className="text-warm-500 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                Sip on artisan coffee, nibble fresh-baked pastries, and cuddle with our adorable
                resident cats. Some are looking for their forever homes — maybe you'll find your
                new best friend here.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button onClick={() => onNavigate('cats')} className="btn-primary group">
                  Meet Our Cats
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => onNavigate('menu')} className="btn-ghost">
                  <Coffee className="w-4 h-4" />
                  See the Menu
                </button>
              </div>
            </div>

            <div className="relative flex justify-center animate-fadeIn">
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-mint-200 animate-float opacity-60" />
                <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-lavender-200 animate-floatSlow opacity-60" />
                <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden shadow-2xl shadow-rose-200 border-8 border-white">
                  <img
                    src="https://images.pexels.com/photos/37085069/pexels-photo-37085069.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="A fluffy cat relaxing in a cozy cat café"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2 whitespace-nowrap">
                  <Star className="w-4 h-4 text-warm-400 fill-warm-400" />
                  <span className="text-sm font-bold text-warm-700">Rated #1 Cat Café</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-white border-y border-rose-100">
        <div className="section-padding py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <p className="font-bold text-warm-700 text-sm">Open Daily</p>
                <p className="text-warm-400 text-xs">8am – 7pm (Mon–Fri)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-12 h-12 rounded-full bg-mint-100 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-mint-500" />
              </div>
              <div>
                <p className="font-bold text-warm-700 text-sm">Partizanska 31</p>
                <p className="text-warm-400 text-xs">Skopje, North Macedonia</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-end">
              <div className="w-12 h-12 rounded-full bg-lavender-100 flex items-center justify-center shrink-0">
                <Cat className="w-6 h-6 text-lavender-500" />
              </div>
              <div>
                <p className="font-bold text-warm-700 text-sm">9 Resident Cats</p>
                <p className="text-warm-400 text-xs">2 available for adoption</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cats */}
      <section className="section-padding py-16">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-warm-700 mb-3">
            Meet Our Furry Friends
          </h2>
          <p className="text-warm-500 max-w-xl mx-auto">
            Each of our cats has a unique personality and story. Come visit them at the café
            or learn more about them here.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-3xl bg-rose-50 animate-pulseSoft" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredCats.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => onNavigate('cats', { selectedCatId: cat.id })}
                className="card-pastel-hover overflow-hidden text-left group animate-fadeIn"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="aspect-square overflow-hidden bg-rose-50 relative">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2">
                    <StatusBadge label={cat.status === 'available' ? 'Adoptable' : cat.status === 'resident' ? 'Resident' : cat.status === 'pending' ? 'Pending' : 'Adopted'} color={cat.status === 'available' ? 'mint' : cat.status === 'resident' ? 'lavender' : cat.status === 'pending' ? 'warm' : 'rose'} />
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-display font-bold text-warm-700 text-base sm:text-lg">{cat.name}</h3>
                  <p className="text-warm-400 text-xs sm:text-sm">{cat.breed} · {cat.age}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <button onClick={() => onNavigate('cats')} className="btn-lavender group">
            See All Cats
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Featured Menu */}
      <section className="bg-gradient-to-b from-cream-100 to-rose-50 bg-paw-mint py-16">
        <div className="section-padding">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-warm-700 mb-3">
              Pawsitively Delicious
            </h2>
            <p className="text-warm-500 max-w-xl mx-auto">
              Freshly baked pastries, artisan coffee, and meow-gical teas — every treat is made
              with love and a sprinkle of cat magic.
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-white/50 animate-pulseSoft" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredMenu.map((item, i) => (
                <div
                  key={item.id}
                  className="card-pastel-hover overflow-hidden group animate-fadeIn"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-rose-50">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display font-bold text-warm-700 text-lg">{item.name}</h3>
                      <span className="font-bold text-rose-500 whitespace-nowrap">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-warm-500 text-sm leading-relaxed line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <button onClick={() => onNavigate('menu')} className="btn-mint group">
              View Full Menu
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Adoption CTA */}
      <section className="section-padding py-16">
        <div className="relative bg-gradient-to-r from-rose-200 via-lavender-200 to-sky-200 rounded-5xl overflow-hidden p-8 sm:p-12 lg:p-16 text-center">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="w-16 h-16 mx-auto rounded-full bg-white flex items-center justify-center mb-6 animate-bounceEar">
              <Heart className="w-8 h-8 text-rose-400 fill-rose-400" />
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-warm-700 mb-4">
              Ready to find your purr-fect match?
            </h2>
            <p className="text-warm-600 max-w-xl mx-auto mb-8 text-lg">
              Browse our adoptable cats and fill out an application. Our team will reach out
              to help you find your new feline family member.
            </p>
            <button onClick={() => onNavigate('adopt')} className="btn-primary group text-base px-8 py-4">
              Start Your Adoption Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

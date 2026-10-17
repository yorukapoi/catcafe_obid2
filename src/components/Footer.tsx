import { Cat, Heart, Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-20 bg-gradient-to-b from-cream-100 to-rose-50 border-t border-rose-100">
      <div className="section-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-lavender-300 flex items-center justify-center">
                <Cat className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-lg text-warm-700">
                Whiskers & Whipped Cream
              </span>
            </div>
            <p className="text-warm-500 text-sm max-w-md leading-relaxed">
              A cozy cat café where you can enjoy delicious treats, meet our adorable resident cats,
              and maybe even find your new best friend. Every sip helps a stray cat find a loving home.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 hover:bg-rose-200 hover:scale-110 transition-all" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-500 hover:bg-sky-200 hover:scale-110 transition-all" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-lavender-100 flex items-center justify-center text-lavender-500 hover:bg-lavender-200 hover:scale-110 transition-all" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-warm-700 mb-4">Visit Us</h4>
            <ul className="space-y-3 text-sm text-warm-500">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-rose-400 shrink-0" />
                <span>Partizanska 31<br />Skopje, North Macedonia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>+389 2 3108 555</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                <span>hello@whiskers.cafe</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-warm-700 mb-4">Hours & Links</h4>
            <ul className="space-y-2 text-sm text-warm-500">
              <li>Mon–Fri: 8am – 7pm</li>
              <li>Sat–Sun: 9am – 8pm</li>
              <li className="pt-2">
                <button onClick={() => onNavigate('menu')} className="hover:text-rose-500 transition-colors">Our Menu</button>
              </li>
              <li>
                <button onClick={() => onNavigate('cats')} className="hover:text-rose-500 transition-colors">Meet Our Cats</button>
              </li>
              <li>
                <button onClick={() => onNavigate('adopt')} className="hover:text-rose-500 transition-colors">Adopt a Cat</button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-warm-400">
            © {new Date().getFullYear()} Whiskers & Whipped Cream Cat Café. All rights reserved.
          </p>
          <p className="text-xs text-warm-400 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> for our feline friends
          </p>
        </div>
      </div>
    </footer>
  );
}

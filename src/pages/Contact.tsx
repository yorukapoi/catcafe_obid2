import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSent(true);
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-cream-50 bg-paw-pattern">
      <div className="section-padding">
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-warm-700 mb-3">
            Get in <span className="heading-gradient">Touch</span>
          </h1>
          <p className="text-warm-500 max-w-xl mx-auto">
            Have a question, want to book a visit, or just want to say meow? We'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Info Cards */}
          <div className="space-y-4">
            <div className="card-pastel p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-warm-700 mb-1">Visit Us</h3>
                <p className="text-warm-500 text-sm">123 Purrington Lane<br />Catsville, CA 90210</p>
              </div>
            </div>
            <div className="card-pastel p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-mint-100 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-mint-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-warm-700 mb-1">{t('Call Us')}</h3>
                <p className="text-warm-500 text-sm">(555) 123-PAWS</p>
              </div>
            </div>
            <div className="card-pastel p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-sky-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-warm-700 mb-1">{t('Email Us')}</h3>
                <p className="text-warm-500 text-sm">hello@whiskers.cafe</p>
              </div>
            </div>
            <div className="card-pastel p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-lavender-100 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-lavender-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-warm-700 mb-1">{t('Opening Hours')}</h3>
                <p className="text-warm-500 text-sm">
                  Mon–Fri: 8am – 7pm<br />
                  Sat–Sun: 9am – 8pm
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card-pastel p-6 sm:p-8">
            {sent ? (
              <div className="text-center py-12 animate-scaleIn">
                <div className="w-20 h-20 mx-auto rounded-full bg-mint-100 flex items-center justify-center mb-4 animate-bounceEar">
                  <Check className="w-10 h-10 text-mint-500" />
                </div>
                <h3 className="font-display font-bold text-2xl text-warm-700 mb-2">{t('Message Sent!')}</h3>
                <p className="text-warm-500 text-sm mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }} className="btn-ghost">
                  {t('Send Another Message')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-display font-bold text-2xl text-warm-700 mb-2">{t('Send a Message')}</h3>
                <div>
                  <label className="block text-sm font-semibold text-warm-600 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-pastel"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-warm-600 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-pastel"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-warm-600 mb-1.5">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input-pastel resize-none"
                    rows={5}
                    placeholder="Tell us how we can help..."
                  />
                </div>
                {error && (
                  <p className="text-rose-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </p>
                )}
                <button type="submit" className="btn-primary w-full">
                  <Send className="w-4 h-4" />
                  {t('Send Message')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

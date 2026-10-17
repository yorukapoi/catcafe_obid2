import { useState } from 'react';
import type { FormEvent } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: FormEvent) => {
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
            {t('Get in')} <span className="heading-gradient">{t('Touch')}</span>
          </h1>
          <p className="text-warm-500 max-w-xl mx-auto">
            {t("Have a question, want to book a visit, or just want to say meow? We'd love to hear from you!")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="space-y-4">
            <div className="card-pastel p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-warm-700 mb-1">{t('Visit Us')}</h3>
                <p className="text-warm-500 text-sm">{t('Partizanska 31')}<br />{t('Skopje, North Macedonia')}</p>
              </div>
            </div>
            <div className="card-pastel p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-mint-100 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-mint-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-warm-700 mb-1">{t('Call Us')}</h3>
                <p className="text-warm-500 text-sm">+389 2 3108 555</p>
              </div>
            </div>
            <div className="card-pastel p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-sky-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-warm-700 mb-1">{t('Email Us')}</h3>
                <p className="text-warm-500 text-sm">hello@meto.cafe</p>
              </div>
            </div>
            <div className="card-pastel p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-lavender-100 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-lavender-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-warm-700 mb-1">{t('Opening Hours')}</h3>
                <p className="text-warm-500 text-sm">
                  {t('Mon–Fri: 8am – 7pm')}<br />
                  {t('Sat–Sun: 9am – 8pm')}
                </p>
              </div>
            </div>
          </div>

          <div className="card-pastel p-6 sm:p-8">
            {sent ? (
              <div className="text-center py-12 animate-scaleIn">
                <div className="w-20 h-20 mx-auto rounded-full bg-mint-100 flex items-center justify-center mb-4 animate-bounceEar">
                  <Check className="w-10 h-10 text-mint-500" />
                </div>
                <h3 className="font-display font-bold text-2xl text-warm-700 mb-2">{t('Message Recorded!')}</h3>
                <p className="text-warm-500 text-sm mb-6">{t('Your message was entered in this demo form. It has not been sent to our team.')}</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }} className="btn-ghost">
                  {t('Write Another Message')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-display font-bold text-2xl text-warm-700 mb-2">{t('Send a Message')}</h3>
                <div>
                  <label className="block text-sm font-semibold text-warm-600 mb-1.5">{t('Your Name')}</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-pastel" placeholder={t('Nikola Nikolovski')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-warm-600 mb-1.5">{t('Email')}</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-pastel" placeholder="nikola@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-warm-600 mb-1.5">{t('Message')}</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-pastel resize-none" rows={5} placeholder={t('Tell us how we can help...')} />
                </div>
                {error && (
                  <p className="text-rose-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {t(error)}
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

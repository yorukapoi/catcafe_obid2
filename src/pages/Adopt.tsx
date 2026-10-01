import { useEffect, useState } from 'react';
import { User, Home, Cat, Heart, Check, ChevronLeft, ChevronRight, Send, PartyPopper, AlertCircle } from 'lucide-react';
import type { Cat as CatType } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { CAT_STATUSES } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import LoadingSpinner, { LoadingDots } from '@/components/ui/LoadingSpinner';
import { useLanguage, localizedValue } from '@/lib/i18n';

interface AdoptProps {
  preselectedCatId?: string | null;
  preselectedCatName?: string | null;
  onNavigate: (page: string) => void;
}

interface FormData {
  applicant_name: string;
  email: string;
  phone: string;
  address: string;
  housing_type: 'rent' | 'own';
  landlord_permission: boolean;
  household_members: number;
  other_pets: string;
  selected_cat_id: string | null;
  selected_cat_name: string;
  previous_experience: string;
  daily_routine: string;
}

const initialForm: FormData = {
  applicant_name: '',
  email: '',
  phone: '',
  address: '',
  housing_type: 'rent',
  landlord_permission: false,
  household_members: 1,
  other_pets: '',
  selected_cat_id: null,
  selected_cat_name: '',
  previous_experience: '',
  daily_routine: '',
};

const steps = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Home Environment', icon: Home },
  { id: 3, label: 'Cat Selection', icon: Cat },
  { id: 4, label: 'Experience', icon: Heart },
];

export default function Adopt({ preselectedCatId, preselectedCatName, onNavigate }: AdoptProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cats, setCats] = useState<CatType[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const { language, t } = useLanguage();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('cats').select('*').order('sort_order');
      if (data) setCats(data as CatType[]);
      setLoadingCats(false);
    })();

    if (preselectedCatId) {
      setForm((prev) => ({ ...prev, selected_cat_id: preselectedCatId, selected_cat_name: preselectedCatName || '' }));
    }
  }, [preselectedCatId, preselectedCatName]);

  const update = (field: keyof FormData, value: string | number | boolean | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!form.applicant_name.trim()) newErrors.applicant_name = 'Please tell us your name';
      if (!form.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Please enter a valid email';
      if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!form.address.trim()) newErrors.address = 'Please provide your address';
    }
    if (s === 2) {
      if (form.housing_type === 'rent' && !form.landlord_permission) {
        newErrors.landlord_permission = 'We need landlord permission for renters';
      }
      if (form.household_members < 1) newErrors.household_members = 'At least 1 household member';
    }
    if (s === 4) {
      if (!form.previous_experience.trim()) newErrors.previous_experience = 'Please share your experience';
      if (!form.daily_routine.trim()) newErrors.daily_routine = 'Please describe your daily routine';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    if (honeypot) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const { error } = await supabase.from('adoption_applications').insert({
        applicant_name: form.applicant_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        housing_type: form.housing_type,
        landlord_permission: form.landlord_permission,
        household_members: form.household_members,
        other_pets: form.other_pets,
        selected_cat_id: form.selected_cat_id,
        selected_cat_name: form.selected_cat_name || 'No specific cat (open application)',
        previous_experience: form.previous_experience,
        daily_routine: form.daily_routine,
        status: 'under_review',
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-cream-50 bg-paw-pattern flex items-center justify-center">
        <div className="section-padding">
          <div className="max-w-lg mx-auto text-center bg-white rounded-5xl shadow-xl shadow-rose-100 p-8 sm:p-12 border border-rose-100/40 animate-scaleIn">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-rose-200 to-mint-200 flex items-center justify-center mb-6 animate-dance">
              <PartyPopper className="w-12 h-12 text-rose-500" />
            </div>
            <h1 className="font-display font-bold text-3xl text-warm-700 mb-3">
              {t('Application Sent!')}
            </h1>
            <p className="text-warm-500 leading-relaxed mb-2">
              Thank you, {form.applicant_name.split(' ')[0]}! Your adoption application has been
              received with a big purr of approval.
            </p>
            <p className="text-warm-400 text-sm leading-relaxed mb-8">
              Our team will review your application and reach out to you at <strong className="text-warm-600">{form.email}</strong> within 2–3 business days.
              {form.selected_cat_name && <> In the meantime, {form.selected_cat_name} will be waiting for you!</>}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => onNavigate('cats')} className="btn-ghost">
                <Cat className="w-4 h-4" /> {t('Back to Our Cats')}
              </button>
              <button onClick={() => onNavigate('home')} className="btn-primary">
                {t('Back to Home')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-cream-50 bg-paw-pattern">
      <div className="section-padding max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-warm-700 mb-3">
            {t('Adopt a Furry Friend')}
          </h1>
          <p className="text-warm-500 max-w-xl mx-auto">
            Fill out our adoption application and take the first step toward giving a cat their
            forever home. It only takes a few minutes!
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-3xl p-4 sm:p-6 shadow-sm shadow-rose-100 border border-rose-100/40">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isComplete = step > s.id;
            const isCurrent = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isComplete
                        ? 'bg-mint-400 text-white shadow-md shadow-mint-200'
                        : isCurrent
                        ? 'bg-rose-400 text-white shadow-md shadow-rose-200 scale-110'
                        : 'bg-cream-100 text-warm-300'
                    }`}
                  >
                    {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-semibold text-center hidden sm:block ${isCurrent ? 'text-rose-500' : isComplete ? 'text-mint-600' : 'text-warm-300'}`}>
                    {t(s.label)}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${isComplete ? 'bg-mint-300' : 'bg-cream-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-4xl shadow-sm shadow-rose-100 border border-rose-100/40 p-6 sm:p-8">
          {/* Honeypot field - hidden from users, catches bots */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="absolute opacity-0 pointer-events-none -left-[9999px]"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="animate-fadeIn space-y-5">
              <div>
                <h2 className="font-display font-bold text-2xl text-warm-700 mb-1">Tell us about yourself</h2>
                <p className="text-warm-400 text-sm">We need some basic info to get in touch.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-warm-600 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.applicant_name}
                  onChange={(e) => update('applicant_name', e.target.value)}
                  className="input-pastel"
                  placeholder="Jane Doe"
                />
                {errors.applicant_name && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.applicant_name}</p>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-warm-600 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="input-pastel"
                    placeholder="jane@example.com"
                  />
                  {errors.email && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-warm-600 mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="input-pastel"
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-warm-600 mb-1.5">Address *</label>
                <textarea
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className="input-pastel resize-none"
                  rows={2}
                  placeholder="123 Purrington Lane, Catsville, CA 90210"
                />
                {errors.address && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Home Environment */}
          {step === 2 && (
            <div className="animate-fadeIn space-y-5">
              <div>
                <h2 className="font-display font-bold text-2xl text-warm-700 mb-1">Your home environment</h2>
                <p className="text-warm-400 text-sm">Tell us about where the cat will live.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-warm-600 mb-2">Do you rent or own? *</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['rent', 'own'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => update('housing_type', type)}
                      className={`p-4 rounded-2xl border-2 font-semibold transition-all ${
                        form.housing_type === type
                          ? 'border-rose-400 bg-rose-50 text-rose-600'
                          : 'border-rose-100 bg-cream-50 text-warm-500 hover:border-rose-200'
                      }`}
                    >
                      {type === 'rent' ? '🏠 I Rent' : '🏡 I Own'}
                    </button>
                  ))}
                </div>
              </div>
              {form.housing_type === 'rent' && (
                <div className="bg-warm-50 border-2 border-warm-200 rounded-2xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.landlord_permission}
                      onChange={(e) => update('landlord_permission', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded accent-rose-400"
                    />
                    <span className="text-sm text-warm-600">
                      I confirm that my landlord allows pets and I have permission to have a cat.
                    </span>
                  </label>
                  {errors.landlord_permission && <p className="text-rose-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.landlord_permission}</p>}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-warm-600 mb-1.5">How many people live in your household? *</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.household_members}
                  onChange={(e) => update('household_members', Math.max(1, parseInt(e.target.value) || 1))}
                  className="input-pastel"
                />
                {errors.household_members && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.household_members}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-warm-600 mb-1.5">Do you have other pets? (optional)</label>
                <textarea
                  value={form.other_pets}
                  onChange={(e) => update('other_pets', e.target.value)}
                  className="input-pastel resize-none"
                  rows={2}
                  placeholder="e.g., One 5-year-old golden retriever, very friendly with cats"
                />
              </div>
            </div>
          )}

          {/* Step 3: Cat Selection */}
          {step === 3 && (
            <div className="animate-fadeIn space-y-5">
              <div>
                <h2 className="font-display font-bold text-2xl text-warm-700 mb-1">Pick your purr-fect match</h2>
                <p className="text-warm-400 text-sm">Choose a cat you're interested in, or submit an open application.</p>
              </div>
              {loadingCats ? (
                <LoadingSpinner label="Loading cats..." />
              ) : (
                <>
                  <button
                    onClick={() => {
                      update('selected_cat_id', null);
                      update('selected_cat_name', '');
                    }}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      !form.selected_cat_id
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-rose-100 bg-cream-50 hover:border-rose-200'
                    }`}
                  >
                    <p className="font-semibold text-warm-700">No specific cat — Open Application</p>
                    <p className="text-sm text-warm-400">Let us match you with the best fit</p>
                  </button>
                  <div className="grid sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto scrollbar-hide pr-1">
                    {cats.map((cat) => {
                      const isSelected = form.selected_cat_id === cat.id;
                      const statusInfo = CAT_STATUSES.find((s) => s.value === cat.status);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            update('selected_cat_id', cat.id);
                            update('selected_cat_name', cat.name);
                          }}
                          className={`flex gap-3 p-3 rounded-2xl border-2 text-left transition-all ${
                            isSelected ? 'border-rose-400 bg-rose-50' : 'border-rose-100 bg-cream-50 hover:border-rose-200'
                          }`}
                        >
                          <img src={cat.image_url} alt={localizedValue(language, cat.name, cat.name_mk)} className="w-14 h-14 rounded-xl object-cover shrink-0" loading="lazy" />
                          <div className="min-w-0">
                            <p className="font-semibold text-warm-700 text-sm truncate">{localizedValue(language, cat.name, cat.name_mk)}</p>
                            <p className="text-xs text-warm-400 truncate">{cat.breed} · {cat.age}</p>
                            {statusInfo && <span className="inline-block mt-1"><StatusBadge label={statusInfo.label} color={statusInfo.color} /></span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Experience */}
          {step === 4 && (
            <div className="animate-fadeIn space-y-5">
              <div>
                <h2 className="font-display font-bold text-2xl text-warm-700 mb-1">Your experience & lifestyle</h2>
                <p className="text-warm-400 text-sm">Help us understand how you'll care for your new companion.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-warm-600 mb-1.5">Previous pet experience *</label>
                <textarea
                  value={form.previous_experience}
                  onChange={(e) => update('previous_experience', e.target.value)}
                  className="input-pastel resize-none"
                  rows={3}
                  placeholder="e.g., I grew up with two cats and cared for them throughout their lives. I'm familiar with feeding schedules, litter box maintenance, and recognizing signs of illness."
                />
                {errors.previous_experience && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.previous_experience}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-warm-600 mb-1.5">Describe your daily routine *</label>
                <textarea
                  value={form.daily_routine}
                  onChange={(e) => update('daily_routine', e.target.value)}
                  className="input-pastel resize-none"
                  rows={3}
                  placeholder="e.g., I work from home, so I'm around most of the day. I enjoy a calm morning routine and would dedicate time to play and cuddle with my cat."
                />
                {errors.daily_routine && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.daily_routine}</p>}
              </div>

              {/* Summary */}
              <div className="bg-cream-100 rounded-2xl p-4 space-y-2">
                <p className="font-semibold text-warm-600 text-sm flex items-center gap-2"><Check className="w-4 h-4 text-mint-500" /> Application Summary</p>
                <div className="text-sm text-warm-500 space-y-1">
                  <p><strong className="text-warm-600">Name:</strong> {form.applicant_name || '—'}</p>
                  <p><strong className="text-warm-600">Cat:</strong> {form.selected_cat_name || 'Open application'}</p>
                  <p><strong className="text-warm-600">Housing:</strong> {form.housing_type === 'rent' ? 'Renting' : 'Owns home'}</p>
                  <p><strong className="text-warm-600">Household:</strong> {form.household_members} member(s)</p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {submitError && (
            <div className="mt-4 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-600">{submitError}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-rose-100">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="btn-ghost disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('Back')}
            </button>
            {step < 4 ? (
              <button onClick={nextStep} className="btn-primary">
                {t('Next')}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                {submitting ? <><LoadingDots /> {t('Submitting')}...</> : <><Send className="w-4 h-4" /> {t('Submit Application')}</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export type Currency = 'USD' | 'MKD';
interface CurrencyContextValue { currency: Currency; rate: number; formatPrice: (usd: number) => string; setCurrency: (currency: Currency) => Promise<void>; }
const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [rate, setRate] = useState(57);

  useEffect(() => {
    supabase.from('cafe_settings').select('currency, usd_to_mkd_rate').eq('id', 'default').maybeSingle().then(({ data }) => {
      if (data?.currency === 'USD' || data?.currency === 'MKD') setCurrencyState(data.currency);
      if (typeof data?.usd_to_mkd_rate === 'number') setRate(data.usd_to_mkd_rate);
    });
  }, []);

  const setCurrency = async (next: Currency) => {
    const { error } = await supabase.from('cafe_settings').update({ currency: next }).eq('id', 'default');
    if (error) throw error;
    setCurrencyState(next);
  };

  const value = useMemo(() => ({
    currency, rate, setCurrency,
    formatPrice: (usd: number) => new Intl.NumberFormat(currency === 'MKD' ? 'mk-MK' : 'en-US', { style: 'currency', currency, minimumFractionDigits: currency === 'MKD' ? 0 : 2, maximumFractionDigits: currency === 'MKD' ? 0 : 2 }).format(currency === 'MKD' ? usd * rate : usd),
  }), [currency, rate]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}

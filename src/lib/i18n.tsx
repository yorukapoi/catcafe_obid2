import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Language = 'en' | 'mk';

const translations: Record<string, string> = {
  Home: 'Почетна', Menu: 'Мени', 'Our Cats': 'Нашите мачки', Adopt: 'Посвојување', Contact: 'Контакт', Staff: 'Персонал',
  'Staff Portal': 'Портал за персонал', 'Meet Our Cats': 'Запознајте ги нашите мачки', 'See the Menu': 'Погледнете го менито',
  'See All Cats': 'Погледнете ги сите мачки', 'View Full Menu': 'Целосно мени', 'Get in Touch': 'Контактирајте нè',
  'Our Menu': 'Нашето мени', 'Our Furry Friends': 'Нашите крзнени пријатели', 'Furry Friends': 'Крзнени пријатели',
  'Adopt a Furry Friend': 'Посвојте крзнен пријател', 'All Items': 'Сите производи', Dietary: 'Исхрана', Clear: 'Исчисти',
  'All Cats': 'Сите мачки', 'No treats found': 'Нема пронајдени производи', 'No cats found': 'Нема пронајдени мачки',
  'Clear Filters': 'Исчисти филтри', 'Open Daily': 'Отворено секој ден', 'Resident Cats': 'Мачки жители',
  'Available for Adoption': 'Достапни за посвојување', 'Resident Cat': 'Мачка жител', 'Pending Adoption': 'Во очекување', Adopted: 'Посвоена',
  Available: 'Достапна', Resident: 'Жител', Pending: 'Во очекување', 'Under Review': 'Во разгледување', Approved: 'Одобрено', Archived: 'Архивирано',
  'Good with kids': 'Добра со деца', 'Good with pets': 'Добра со миленичиња', Yes: 'Да', 'No': 'Не', Kids: 'Деца', Pets: 'Миленичиња',
  'View →': 'Погледнете →', 'Favorite Toys': 'Омилени играчки', 'My Story': 'Моја приказна',
  'Application Sent!': 'Апликацијата е испратена!', 'Start Your Adoption Journey': 'Започнете со посвојувањето',
  'Back to Our Cats': 'Назад кон мачките', 'Back to Home': 'Назад кон почетната', 'Personal Info': 'Лични податоци',
  'Home Environment': 'Домашна средина', 'Cat Selection': 'Избор на мачка', Experience: 'Искуство', Next: 'Следно', Back: 'Назад',
  'Submit Application': 'Испрати апликација', Submitting: 'Се испраќа...', 'Send a Message': 'Испратете порака', 'Send Message': 'Испрати порака',
  'Message Sent!': 'Пораката е испратена!', 'Send Another Message': 'Испрати друга порака', 'Visit Us': 'Посетете нè', 'Call Us': 'Јавете се',
  'Email Us': 'Испратете ни е-пошта', 'Opening Hours': 'Работно време', 'Hours & Links': 'Работно време и врски',
  'Admin Dashboard': 'Административна табла', 'Sign Out': 'Одјави се', Overview: 'Преглед', 'Menu Items': 'Производи', Cats: 'Мачки', Applications: 'Апликации',
  'Pending Requests': 'Барања во очекување', 'Approved Staff': 'Одобрен персонал', Rejected: 'Одбиени', Approve: 'Одобри', Reject: 'Одбиј', Revoke: 'Отповикај',
  'Add Item': 'Додај производ', 'Edit Menu Item': 'Уреди производ', 'Add Menu Item': 'Додај производ', 'Add Cat': 'Додај мачка', 'Edit Cat Profile': 'Уреди профил на мачка',
  Save: 'Зачувај', Cancel: 'Откажи', Price: 'Цена', Category: 'Категорија', Description: 'Опис', Name: 'Име', Status: 'Статус',
  'Currency': 'Валута', 'US Dollars': 'Американски долари', 'Macedonian Denars': 'Македонски денари', 'Language': 'Јазик',
  'Pawsome Coffee': 'Одлично кафе', 'Purrfect Pastries': 'Совршени печива', 'Meow-gical Teas': 'Магични чаеви', 'Vegan Options': 'Вегански опции',
  'Gluten-Free': 'Без глутен', Vegan: 'Веганско', 'Nut-Free': 'Без јаткасти плодови', 'Dairy-Free': 'Без млечни производи', Vegetarian: 'Вегетаријанско',
  'Signed in as': 'Најавен како', 'Loading dashboard...': 'Се вчитува таблата...', 'Total Cats': 'Вкупно мачки', 'Pending Applications': 'Апликации во очекување',
  'Pending Staff Requests': 'Барања за персонал во очекување', 'Recent Applications': 'Неодамнешни апликации', 'No applications yet.': 'Сè уште нема апликации.',
  'Open application': 'Отворена апликација', 'Unavailable': 'Недостапно', 'Edit': 'Уреди', 'Export CSV': 'Извоз CSV',
  'Search by name, email, or cat...': 'Пребарај по име, е-пошта или мачка...', 'All Statuses': 'Сите статуси',
  'No applications found.': 'Нема пронајдени апликации.', 'Submitted': 'Испратена', 'Update Status': 'Ажурирај статус',
  'Email': 'Е-пошта', 'Phone': 'Телефон', 'Address': 'Адреса', 'Housing': 'Домување', 'Renting': 'Под кирија', 'Owns home': 'Сопствен дом',
  'Household': 'Домаќинство', 'member(s)': 'член(ови)', 'Other Pets': 'Други миленичиња', 'Interested Cat': 'Интересна мачка',
  'Previous Experience': 'Претходно искуство', 'Daily Routine': 'Дневна рутина', 'No staff accounts yet.': 'Сè уште нема персонал.',
  'Could not update staff status. Please try again.': 'Не може да се ажурира статусот на персоналот. Обидете се повторно.',
  'Delete this menu item? This cannot be undone.': 'Избриши овој производ? Ова не може да се врати.',
  'Delete this cat profile? This cannot be undone.': 'Избриши овој профил на мачка? Ова не може да се врати.',
  'Name (MK)': 'Име (MK)', 'Description (MK)': 'Опис (MK)', 'Image URL': 'URL на слика', 'Dietary Tags': 'Диететски ознаки',
  'Available on menu': 'Достапно во менито', 'Age': 'Возраст', 'Breed': 'Раса', 'Short Bio': 'Кратка биографија',
  'Short Bio (MK)': 'Кратка биографија (MK)', 'Primary Image URL': 'Главна слика URL',
  'Gallery URLs (comma-separated)': 'URL-ови за галерија (одделени со запирки)',
  'Favorite Toys (comma-separated)': 'Омилени играчки (одделени со запирки)',
  'Backstory': 'Приказна', 'Backstory (MK)': 'Приказна (MK)', 'Requested': 'Побарано', '(you)': '(ти)',
};

interface LanguageContextValue { language: Language; setLanguage: (language: Language) => void; t: (value: string) => string; }
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('cat-cafe-language') as Language) || 'en');
  const setLanguage = (next: Language) => { setLanguageState(next); localStorage.setItem('cat-cafe-language', next); };
  const value = useMemo(() => ({ language, setLanguage, t: (value: string) => language === 'mk' ? translations[value] || value : value }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}

export function localizedValue(language: Language, english: string, macedonian?: string | null): string {
  return language === 'mk' && macedonian?.trim() ? macedonian : english;
}

ALTER TABLE public.cats
  ADD COLUMN IF NOT EXISTS name_mk text NOT NULL DEFAULT '';

-- Assign Macedonian pet names to existing cats (ordered by sort_order).
-- Зоки and Поки are placed consecutively (sort_order 3 and 4) for comedic effect.
-- The last cat (sort_order 8) is named "Директорот на МАУКИ, MSc".
UPDATE public.cats SET name_mk = 'Тошо Од Маало' WHERE sort_order = 1;
UPDATE public.cats SET name_mk = 'Лордот од Влае' WHERE sort_order = 2;
UPDATE public.cats SET name_mk = 'Зоки' WHERE sort_order = 3;
UPDATE public.cats SET name_mk = 'Поки' WHERE sort_order = 4;
UPDATE public.cats SET name_mk = 'Војводата од Аеродром' WHERE sort_order = 5;
UPDATE public.cats SET name_mk = 'Господарот на Трето Полувреме' WHERE sort_order = 6;
UPDATE public.cats SET name_mk = 'Маце' WHERE sort_order = 7;
UPDATE public.cats SET name_mk = 'Директорот на МАУКИ, MSc' WHERE sort_order = 8;

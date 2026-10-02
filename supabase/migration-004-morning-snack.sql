-- v14 calorie tracker: five meals (Breakfast, Morning Snack, Lunch, Evening Snack, Dinner).
-- 'snacks' stays as the evening snack so rows logged before this keep working.
-- Run once in the Supabase SQL editor before shipping the v14 app build;
-- until then a morning-snack row would be rejected and sit in the phone's outbox.
alter table public.food_logs drop constraint if exists food_logs_meal_check;
alter table public.food_logs add constraint food_logs_meal_check
  check (meal in ('breakfast','morning_snack','lunch','snacks','dinner'));

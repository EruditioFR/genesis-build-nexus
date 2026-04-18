UPDATE public.profiles
SET subscription_level = 'legacy',
    storage_limit_mb = 20480,
    updated_at = now()
WHERE user_id = '2709e2a5-364f-4280-9d3b-1d53cf8a9122';
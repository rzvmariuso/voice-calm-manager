-- Fix subscription plan prices - yearly should be discounted, not 10x more expensive
UPDATE subscription_plans 
SET 
  price_yearly = CASE 
    WHEN name = 'Starter' THEN 24360  -- €243.60/year (17% discount from €348/year)
    WHEN name = 'Professional' THEN 49560  -- €495.60/year (17% discount from €708/year) 
    WHEN name = 'Enterprise' THEN 82980  -- €829.80/year (17% discount from €1188/year)
  END
WHERE name IN ('Starter', 'Professional', 'Enterprise');
-- Update subscription plan prices to user's specifications
UPDATE subscription_plans 
SET 
  price_monthly = CASE 
    WHEN name = 'Starter' THEN 4900      -- €49/month
    WHEN name = 'Professional' THEN 9900 -- €99/month
    WHEN name = 'Enterprise' THEN 19900  -- €199/month
  END,
  price_yearly = CASE 
    WHEN name = 'Starter' THEN 48804     -- €488.04/year (17% discount)
    WHEN name = 'Professional' THEN 98628 -- €986.28/year (17% discount)
    WHEN name = 'Enterprise' THEN 198276  -- €1982.76/year (17% discount)
  END
WHERE name IN ('Starter', 'Professional', 'Enterprise');
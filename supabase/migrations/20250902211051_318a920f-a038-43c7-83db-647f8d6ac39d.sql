-- Update subscription plan prices
UPDATE subscription_plans 
SET 
  price_monthly = 4900,  -- €49.00 in cents
  price_yearly = 52920   -- €529.20 in cents (10% discount)
WHERE name = 'Starter';

UPDATE subscription_plans 
SET 
  price_monthly = 9900,  -- €99.00 in cents  
  price_yearly = 106920  -- €1069.20 in cents (10% discount)
WHERE name = 'Professional';

UPDATE subscription_plans 
SET 
  price_monthly = 20000, -- €200.00 in cents
  price_yearly = 216000  -- €2160.00 in cents (10% discount) 
WHERE name = 'Enterprise';
-- Migration: Add improved emission factor fields for IPCC compliance
-- This adds fields needed for intelligent factor selection and heating value calculations

-- Add new columns to emission_factors table
ALTER TABLE ipcc_emission_factors 
ADD COLUMN applicable_categories VARCHAR(1000),
ADD COLUMN fuel_type VARCHAR(100),
ADD COLUMN activity_type VARCHAR(200),
ADD COLUMN heating_value DECIMAL(10,3),
ADD COLUMN heating_value_unit VARCHAR(50);

-- Create indexes for better performance
CREATE INDEX idx_emission_factors_applicable_categories ON ipcc_emission_factors USING GIN (applicable_categories);
CREATE INDEX idx_emission_factors_fuel_type ON ipcc_emission_factors (fuel_type);
CREATE INDEX idx_emission_factors_tier_gas ON ipcc_emission_factors (tier, gas_type);

-- Update existing coal combustion factors with category linkage and heating values
UPDATE ipcc_emission_factors 
SET 
  applicable_categories = '["1.A.1"]',
  fuel_type = 'Coal',
  activity_type = 'Power Generation',
  heating_value = 25.8,
  heating_value_unit = 'GJ/ton'
WHERE name ILIKE '%Coal%Power%Generation%';

-- Update other energy factors with appropriate categories
UPDATE ipcc_emission_factors 
SET 
  applicable_categories = '["1.A.3.b"]',
  fuel_type = 'Diesel',
  activity_type = 'Road Transport'
WHERE name ILIKE '%Diesel%Road%Transport%';

UPDATE ipcc_emission_factors 
SET 
  applicable_categories = '["1.A.3.b"]',
  fuel_type = 'Gasoline', 
  activity_type = 'Road Transport'
WHERE name ILIKE '%Gasoline%Road%Transport%';

UPDATE ipcc_emission_factors 
SET 
  applicable_categories = '["1.A.4.b"]',
  fuel_type = 'Natural Gas',
  activity_type = 'Residential'
WHERE name ILIKE '%Natural Gas%Residential%';

-- Update livestock factors
UPDATE ipcc_emission_factors 
SET 
  applicable_categories = '["3.A.1"]',
  fuel_type = NULL,
  activity_type = 'Enteric Fermentation'
WHERE name ILIKE '%Enteric%' OR name ILIKE '%Goats%';

UPDATE ipcc_emission_factors 
SET 
  applicable_categories = '["3.A.2"]',
  fuel_type = NULL,
  activity_type = 'Manure Management'
WHERE name ILIKE '%Manure%';

-- Update waste factors
UPDATE ipcc_emission_factors 
SET 
  applicable_categories = '["4.A"]',
  fuel_type = NULL,
  activity_type = 'Landfill'
WHERE name ILIKE '%Landfill%';

UPDATE ipcc_emission_factors 
SET 
  applicable_categories = '["4.D"]',
  fuel_type = NULL,
  activity_type = 'Wastewater'
WHERE name ILIKE '%Wastewater%';

-- Insert IPCC standard coal combustion factor for testing
INSERT INTO ipcc_emission_factors (
  name,
  gas_type,
  tier,
  value,
  unit,
  applicable_categories,
  fuel_type,
  activity_type,
  heating_value,
  heating_value_unit,
  source
) VALUES (
  'Coal Combustion - Power Generation (IPCC Default)',
  'CO2',
  'TIER_1',
  94.6,
  'kg_CO2/GJ',
  '["1.A.1"]',
  'Coal',
  'Power Generation',
  25.8,
  'GJ/ton',
  'IPCC 2006 Guidelines, Volume 2, Chapter 2, Table 2.2'
) ON CONFLICT DO NOTHING;

-- Create a view for easy factor selection
CREATE OR REPLACE VIEW v_emission_factors_with_categories AS
SELECT 
  ef.*,
  ec.code as category_code,
  ec.name as category_name,
  ec.sector
FROM ipcc_emission_factors ef
CROSS JOIN LATERAL (
  SELECT code, name, sector 
  FROM ipcc_emission_categories ec2
  WHERE ef.applicable_categories IS NOT NULL 
    AND ef.applicable_categories LIKE '%' || ec2.code || '%'
) ec;

-- Add comments for documentation
COMMENT ON COLUMN ipcc_emission_factors.applicable_categories IS 'JSON array of IPCC category codes where this factor applies';
COMMENT ON COLUMN ipcc_emission_factors.fuel_type IS 'Type of fuel (Coal, Oil, Natural Gas, etc.)';
COMMENT ON COLUMN ipcc_emission_factors.activity_type IS 'Type of activity (Power Generation, Transport, etc.)';
COMMENT ON COLUMN ipcc_emission_factors.heating_value IS 'Net calorific value for energy calculations';
COMMENT ON COLUMN ipcc_emission_factors.heating_value_unit IS 'Unit for heating value (GJ/ton, GJ/liter, etc.)';
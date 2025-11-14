-- Seed data for GHG Protocol Emission Factors
-- Common emission factors from EPA, IPCC, and other recognized sources
-- Year: 2024
-- Note: These are reference values. For production use, prefer location-specific or supplier-specific factors when available.

-- ============================================
-- SCOPE 1 - STATIONARY COMBUSTION
-- ============================================

-- Natural Gas (combustion)
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type, heating_value, heating_value_unit,
  source, notes
) VALUES (
  '2024', 'Scope1', 'Stationary Combustion', 'Natural Gas - Combustion', 'm3', 'volume',
  2.0, 0.0001, 0.0001, 2.0028,
  'Natural Gas', 'Stationary Combustion',
  38.0, 'MJ/m3',
  'EPA eGRID 2024', 'Standard natural gas combustion factor. Includes CO2, CH4, and N2O.'
) ON CONFLICT DO NOTHING;

INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type, heating_value, heating_value_unit,
  source, notes
) VALUES (
  '2024', 'Scope1', 'Stationary Combustion', 'Natural Gas - Combustion', 'kWh', 'energy',
  0.2, 0.00001, 0.00001, 0.20028,
  'Natural Gas', 'Stationary Combustion',
  10.55, 'kWh/m3',
  'EPA eGRID 2024', 'Natural gas combustion per kWh (converted from m3)'
) ON CONFLICT DO NOTHING;

-- Diesel (combustion)
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope1', 'Stationary Combustion', 'Diesel - Combustion', 'liter', 'volume',
  2.68, 0.0001, 0.0001, 2.6828,
  'Diesel', 'Stationary Combustion',
  'EPA 2024', 'Standard diesel fuel combustion factor'
) ON CONFLICT DO NOTHING;

-- Petrol/Gasoline (combustion)
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope1', 'Stationary Combustion', 'Petrol/Gasoline - Combustion', 'liter', 'volume',
  2.31, 0.0001, 0.0001, 2.3128,
  'Petrol', 'Stationary Combustion',
  'EPA 2024', 'Standard petrol/gasoline combustion factor'
) ON CONFLICT DO NOTHING;

-- Coal (combustion)
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type, heating_value, heating_value_unit,
  source, notes
) VALUES (
  '2024', 'Scope1', 'Stationary Combustion', 'Coal - Combustion', 'kg', 'mass',
  2.6, 0.0001, 0.0001, 2.6028,
  'Coal', 'Stationary Combustion',
  25.8, 'MJ/kg',
  'IPCC 2006', 'Average coal combustion factor (varies by coal type)'
) ON CONFLICT DO NOTHING;

-- LPG (Liquefied Petroleum Gas)
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope1', 'Stationary Combustion', 'LPG - Combustion', 'kg', 'mass',
  1.5, 0.0001, 0.0001, 1.5028,
  'LPG', 'Stationary Combustion',
  'EPA 2024', 'Liquefied Petroleum Gas combustion factor'
) ON CONFLICT DO NOTHING;

-- Fuel Oil
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope1', 'Stationary Combustion', 'Fuel Oil - Combustion', 'liter', 'volume',
  3.15, 0.0001, 0.0001, 3.1528,
  'Fuel Oil', 'Stationary Combustion',
  'EPA 2024', 'Heavy fuel oil combustion factor'
) ON CONFLICT DO NOTHING;

-- ============================================
-- SCOPE 1 - MOBILE COMBUSTION
-- ============================================

-- Petrol Car
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope1', 'Mobile Combustion', 'Petrol Car - Average', 'liter', 'volume',
  2.31, 0.0001, 0.0001, 2.3128,
  'Petrol', 'Road Transport',
  'EPA 2024', 'Average petrol car emission factor'
) ON CONFLICT DO NOTHING;

-- Diesel Car
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope1', 'Mobile Combustion', 'Diesel Car - Average', 'liter', 'volume',
  2.68, 0.0001, 0.0001, 2.6828,
  'Diesel', 'Road Transport',
  'EPA 2024', 'Average diesel car emission factor'
) ON CONFLICT DO NOTHING;

-- CNG (Compressed Natural Gas)
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope1', 'Mobile Combustion', 'CNG Vehicle', 'm3', 'volume',
  2.0, 0.0001, 0.0001, 2.0028,
  'Natural Gas', 'Road Transport',
  'EPA 2024', 'Compressed Natural Gas vehicle emission factor'
) ON CONFLICT DO NOTHING;

-- ============================================
-- SCOPE 1 - FUGITIVE EMISSIONS
-- ============================================

-- Refrigerant R-134a (HFC)
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope1', 'Fugitive Emissions', 'Refrigerant R-134a (HFC-134a)', 'kg', 'mass',
  0, 0, 0, 1430,
  'HFC-134a', 'Refrigeration',
  'IPCC AR5', 'HFC-134a GWP = 1430. Used for air conditioning and refrigeration systems.'
) ON CONFLICT DO NOTHING;

-- Refrigerant R-410A (HFC blend)
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope1', 'Fugitive Emissions', 'Refrigerant R-410A (HFC blend)', 'kg', 'mass',
  0, 0, 0, 2088,
  'HFC-410A', 'Refrigeration',
  'IPCC AR5', 'R-410A is a blend of HFC-32 and HFC-125. Average GWP = 2088.'
) ON CONFLICT DO NOTHING;

-- Natural Gas Leaks (CH4)
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope1', 'Fugitive Emissions', 'Natural Gas Leaks', 'm3', 'volume',
  0, 0.03, 0, 0.84,
  'Natural Gas', 'Fugitive Emissions',
  'EPA 2024', 'Average natural gas leakage rate. CH4 GWP = 28.'
) ON CONFLICT DO NOTHING;

-- ============================================
-- SCOPE 2 - PURCHASED ELECTRICITY
-- ============================================

-- USA Grid Average
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope2', 'Purchased Electricity', 'USA Grid Average', 'kWh', 'energy',
  0.4, 0.0001, 0.0001, 0.40028,
  'Grid Mix', 'Electricity Generation',
  'EPA eGRID 2024', 'USA national average grid emission factor'
) ON CONFLICT DO NOTHING;

-- EU Grid Average
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope2', 'Purchased Electricity', 'EU Grid Average', 'kWh', 'energy',
  0.3, 0.0001, 0.0001, 0.30028,
  'Grid Mix', 'Electricity Generation',
  'IEA 2024', 'European Union average grid emission factor'
) ON CONFLICT DO NOTHING;

-- China Grid Average
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope2', 'Purchased Electricity', 'China Grid Average', 'kWh', 'energy',
  0.7, 0.0001, 0.0001, 0.70028,
  'Grid Mix', 'Electricity Generation',
  'IEA 2024', 'China national average grid emission factor'
) ON CONFLICT DO NOTHING;

-- India Grid Average
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope2', 'Purchased Electricity', 'India Grid Average', 'kWh', 'energy',
  0.8, 0.0001, 0.0001, 0.80028,
  'Grid Mix', 'Electricity Generation',
  'IEA 2024', 'India national average grid emission factor'
) ON CONFLICT DO NOTHING;

-- Indonesia Grid Average
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope2', 'Purchased Electricity', 'Indonesia Grid Average', 'kWh', 'energy',
  0.75, 0.0001, 0.0001, 0.75028,
  'Grid Mix', 'Electricity Generation',
  'IEA 2024', 'Indonesia national average grid emission factor'
) ON CONFLICT DO NOTHING;

-- Renewable Electricity (Certified)
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope2', 'Purchased Electricity', 'Renewable Electricity (Certified)', 'kWh', 'energy',
  0, 0, 0, 0,
  'Renewable', 'Electricity Generation',
  'GHG Protocol', 'Certified renewable electricity with RECs or similar certificates'
) ON CONFLICT DO NOTHING;

-- Purchased Steam
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope2', 'Purchased Steam', 'Steam from Natural Gas', 'kg', 'mass',
  0.2, 0.00001, 0.00001, 0.20028,
  'Natural Gas', 'Steam Generation',
  'EPA 2024', 'Average steam generation from natural gas (varies by system)'
) ON CONFLICT DO NOTHING;

-- ============================================
-- SCOPE 3 - BUSINESS TRAVEL
-- ============================================

-- Air Travel - Short Haul
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Business Travel', 'Air Travel - Short Haul', 'passenger-km', 'distance',
  0.25, 0.00001, 0.00001, 0.25028,
  'Aviation Fuel', 'Air Transport',
  'ICAO 2024', 'Short-haul flights (< 1500 km). Includes CO2, CH4, N2O, and radiative forcing.'
) ON CONFLICT DO NOTHING;

-- Air Travel - Long Haul
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Business Travel', 'Air Travel - Long Haul', 'passenger-km', 'distance',
  0.15, 0.00001, 0.00001, 0.15028,
  'Aviation Fuel', 'Air Transport',
  'ICAO 2024', 'Long-haul flights (> 1500 km). Includes CO2, CH4, N2O, and radiative forcing.'
) ON CONFLICT DO NOTHING;

-- Car Travel - Petrol
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Business Travel', 'Car Travel - Petrol', 'passenger-km', 'distance',
  0.2, 0.00001, 0.00001, 0.20028,
  'Petrol', 'Road Transport',
  'EPA 2024', 'Average petrol car emissions per passenger-km'
) ON CONFLICT DO NOTHING;

-- Car Travel - Diesel
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Business Travel', 'Car Travel - Diesel', 'passenger-km', 'distance',
  0.17, 0.00001, 0.00001, 0.17028,
  'Diesel', 'Road Transport',
  'EPA 2024', 'Average diesel car emissions per passenger-km'
) ON CONFLICT DO NOTHING;

-- Train Travel
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Business Travel', 'Train Travel', 'passenger-km', 'distance',
  0.04, 0.00001, 0.00001, 0.04028,
  'Electricity/Diesel', 'Rail Transport',
  'EPA 2024', 'Average train emissions per passenger-km (varies by country and train type)'
) ON CONFLICT DO NOTHING;

-- Hotel Stay
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Business Travel', 'Hotel Stay', 'night', 'other',
  20, 0.001, 0.001, 20.028,
  'Mixed', 'Accommodation',
  'GHG Protocol', 'Average hotel emissions per night (varies significantly by hotel type and location)'
) ON CONFLICT DO NOTHING;

-- ============================================
-- SCOPE 3 - EMPLOYEE COMMUTING
-- ============================================

-- Employee Commuting - Car Petrol
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Employee Commuting', 'Car Commuting - Petrol', 'km', 'distance',
  0.2, 0.00001, 0.00001, 0.20028,
  'Petrol', 'Road Transport',
  'EPA 2024', 'Average petrol car emissions per km for commuting'
) ON CONFLICT DO NOTHING;

-- Employee Commuting - Public Transport
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Employee Commuting', 'Public Transport', 'passenger-km', 'distance',
  0.05, 0.00001, 0.00001, 0.05028,
  'Mixed', 'Public Transport',
  'EPA 2024', 'Average public transport emissions per passenger-km'
) ON CONFLICT DO NOTHING;

-- ============================================
-- SCOPE 3 - WASTE GENERATED IN OPERATIONS
-- ============================================

-- Waste - Landfill
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Waste Generated in Operations', 'Waste Disposal - Landfill', 'kg', 'mass',
  0, 0.02, 0, 0.56,
  'Waste', 'Waste Disposal',
  'IPCC 2006', 'Landfill CH4 emissions. GWP CH4 = 28. Varies by waste composition.'
) ON CONFLICT DO NOTHING;

-- Waste - Incineration
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Waste Generated in Operations', 'Waste Disposal - Incineration', 'kg', 'mass',
  0.4, 0.0001, 0.0001, 0.40028,
  'Waste', 'Waste Disposal',
  'EPA 2024', 'Waste incineration emissions (varies by waste type)'
) ON CONFLICT DO NOTHING;

-- Waste - Recycling
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Waste Generated in Operations', 'Waste Disposal - Recycling', 'kg', 'mass',
  0.15, 0.00001, 0.00001, 0.15028,
  'Waste', 'Waste Disposal',
  'EPA 2024', 'Recycling process emissions (varies by material type)'
) ON CONFLICT DO NOTHING;

-- Waste - Composting
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Waste Generated in Operations', 'Waste Disposal - Composting', 'kg', 'mass',
  0.05, 0.001, 0.001, 0.078,
  'Waste', 'Waste Disposal',
  'IPCC 2006', 'Composting emissions (mostly CO2, some CH4 and N2O)'
) ON CONFLICT DO NOTHING;

-- ============================================
-- SCOPE 3 - UPSTREAM TRANSPORTATION AND DISTRIBUTION
-- ============================================

-- Road Freight - Truck
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Upstream Transportation and Distribution', 'Road Freight - Truck', 'ton-km', 'distance',
  0.15, 0.00001, 0.00001, 0.15028,
  'Diesel', 'Road Freight',
  'EPA 2024', 'Average truck freight emissions per ton-km'
) ON CONFLICT DO NOTHING;

-- Sea Freight - Ship
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Upstream Transportation and Distribution', 'Sea Freight - Ship', 'ton-km', 'distance',
  0.01, 0.000001, 0.000001, 0.010028,
  'Heavy Fuel Oil', 'Maritime Transport',
  'IMO 2024', 'Average sea freight emissions per ton-km'
) ON CONFLICT DO NOTHING;

-- Air Freight
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type,
  source, notes
) VALUES (
  '2024', 'Scope3', 'Upstream Transportation and Distribution', 'Air Freight', 'ton-km', 'distance',
  0.5, 0.00001, 0.00001, 0.50028,
  'Aviation Fuel', 'Air Freight',
  'ICAO 2024', 'Average air freight emissions per ton-km'
) ON CONFLICT DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- These emission factors are reference values from recognized sources.
-- For production use:
-- 1. Prefer location-specific factors when available (especially for Scope 2 electricity)
-- 2. Use supplier-specific data when possible (especially for Scope 3)
-- 3. Update factors annually as new data becomes available
-- 4. Consider using Tier 2 or Tier 3 methods for higher accuracy
-- 5. Document sources and assumptions for audit purposes


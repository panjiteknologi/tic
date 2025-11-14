# GHG Protocol Setup Guide

Panduan setup untuk menggunakan fitur GHG Protocol Corporate Standard Carbon Emission Calculation.

## Prerequisites

1. Database sudah dikonfigurasi dan migration sudah dijalankan
2. Environment variables sudah dikonfigurasi:
   - `DATABASE_URL` - Database connection string
   - `GEMINI_API_KEY` - Google Gemini API key untuk AI calculation
3. Node.js dan npm sudah terinstall
4. PostgreSQL database sudah running

## Setup Steps

### 1. Run Database Migrations

Pastikan semua migrations sudah dijalankan, termasuk migration untuk GHG Protocol schema:

```bash
# Menggunakan Drizzle
npm run db:migrate

# Atau menggunakan Drizzle Studio untuk verify
npm run db:studio
```

Migration akan membuat tabel-tabel berikut:
- `ghg_protocol_projects`
- `ghg_protocol_calculations`
- `ghg_protocol_project_summaries`
- `ghg_protocol_emission_factors`

### 2. Seed Emission Factors

Sebelum bisa membuat calculation, database harus memiliki emission factors untuk tahun 2024.

**Cara menjalankan seed script:**

**Option 1: Menggunakan psql (Recommended)**
```bash
# Pastikan PostgreSQL client sudah terinstall
psql -d your_database_name -f src/db/migrations/seed-ghg-protocol-emission-factors.sql

# Atau dengan connection string
psql $DATABASE_URL -f src/db/migrations/seed-ghg-protocol-emission-factors.sql
```

**Option 2: Menggunakan database client GUI**
- Buka file `src/db/migrations/seed-ghg-protocol-emission-factors.sql`
- Copy semua isi file
- Paste dan execute di database client (pgAdmin, DBeaver, dll)

**Option 3: Menggunakan Node.js script (jika ada)**
```bash
# Jika ada script TypeScript untuk seeding
npx tsx src/scripts/seed-ghg-protocol-emission-factors.ts
```

Script SQL ini akan mengisi emission factors untuk tahun 2024 dengan berbagai kategori:

**Scope 1 - Stationary Combustion:**
- Natural Gas (m³ dan kWh)
- Diesel (liter)
- Petrol/Gasoline (liter)
- Coal (kg)
- LPG (kg)
- Fuel Oil (liter)

**Scope 1 - Mobile Combustion:**
- Petrol vehicles (liter dan km)
- Diesel vehicles (liter dan km)
- CNG vehicles (m³)
- LPG vehicles (kg)

**Scope 1 - Fugitive Emissions:**
- Refrigerants (HFCs) - berbagai compound
- Natural gas leaks (CH₄)

**Scope 2 - Purchased Energy:**
- Grid electricity (kWh) - berbagai region
- Purchased steam
- Purchased heating
- Purchased cooling

**Scope 3 - Other Indirect:**
- Business Travel (air, rail, car)
- Waste disposal (landfill, incineration, recycling)
- Purchased goods (berbagai kategori)
- Employee commuting
- Dan kategori Scope 3 lainnya

### 3. Verify Seed Success

Setelah menjalankan script, verify dengan query database:

```sql
-- Check total emission factors
SELECT COUNT(*) FROM ghg_protocol_emission_factors WHERE year = '2024';

-- Check by scope
SELECT scope, COUNT(*) 
FROM ghg_protocol_emission_factors 
WHERE year = '2024' 
GROUP BY scope;

-- Check by category (sample)
SELECT category, COUNT(*) 
FROM ghg_protocol_emission_factors 
WHERE year = '2024' 
GROUP BY category 
ORDER BY COUNT(*) DESC 
LIMIT 10;
```

Expected output:
- Total emission factors: ~50-100+ (tergantung seed data)
- Scope 1: ~20-30 factors
- Scope 2: ~10-15 factors
- Scope 3: ~20-50+ factors

### 4. Test Calculation

Setelah emission factors ter-seed, Anda bisa:

1. Buat GHG Protocol project dengan Reporting Year "2024" (default)
2. Buat calculation dengan activity name yang sesuai
3. AI akan otomatis memilih emission factor yang tepat

**Test dengan calculation sederhana:**
- Scope: Scope1
- Category: Stationary Combustion
- Activity Name: "Natural gas consumption"
- Quantity: 1000
- Unit: kWh

## Troubleshooting

### Error: "No emission factors found for year 2024"

**Penyebab:** Emission factors belum di-seed ke database.

**Solusi:**
1. Jalankan seed script: `psql -d your_database_name -f src/db/migrations/seed-ghg-protocol-emission-factors.sql`
2. Pastikan script berjalan tanpa error
3. Verify dengan query database:
   ```sql
   SELECT COUNT(*) FROM ghg_protocol_emission_factors WHERE year = '2024';
   ```
4. Coba create calculation lagi

### Error: "Emission factors already exist"

**Penyebab:** Emission factors untuk tahun 2024 sudah ada di database.

**Solusi:**
- Jika ingin re-seed, hapus dulu emission factors yang ada:
  ```sql
  DELETE FROM ghg_protocol_emission_factors WHERE year = '2024';
  ```
- Kemudian jalankan seed script lagi
- Atau update script untuk handle duplicate dengan `ON CONFLICT DO NOTHING` (sudah ada di seed script)

### Error: "GHG Protocol AI calculation failed"

**Penyebab:** 
- AI tidak bisa menemukan emission factor yang sesuai
- Activity name terlalu umum atau tidak jelas
- Unit tidak match dengan emission factors yang ada
- GEMINI_API_KEY tidak valid atau expired
- Network error saat memanggil AI service

**Solusi:**
1. **Check API Key:**
   - Pastikan `GEMINI_API_KEY` sudah di-set di environment variables
   - Verify API key valid di Google Cloud Console

2. **Improve Activity Name:**
   - Gunakan activity name yang lebih spesifik (e.g., "Natural gas - combustion for heating" instead of "Gas")
   - Include fuel type atau activity type (e.g., "Diesel car - medium size vehicle")
   - Mention unit dalam activity name jika membantu (e.g., "Electricity consumption - grid kWh")

3. **Check Unit:**
   - Pastikan unit sesuai dengan emission factors yang ada (kWh, m³, liter, km, kg, tonnes)
   - AI akan mencoba konversi unit jika perlu, tapi lebih baik gunakan unit yang match

4. **Provide Category:**
   - Isi category field dengan jelas (e.g., "Stationary Combustion", "Purchased Electricity", "Business Travel")
   - Ini membantu AI memilih factor yang tepat

5. **Use Custom Emission Factor:**
   - Jika AI tidak bisa menemukan factor yang sesuai, gunakan custom emission factor
   - Checkbox "Use custom emission factor" dan isi manual

6. **Check Network:**
   - Pastikan aplikasi bisa akses Google Gemini API
   - Check firewall atau proxy settings

### Error: "Access denied to this project"

**Penyebab:** User tidak memiliki akses ke tenant project tersebut.

**Solusi:**
- Pastikan user adalah member dari tenant yang memiliki project
- Check `tenant_user` table untuk verify user-tenant relationship
- User harus memiliki `is_active = true` di tenant_user table

### Error: "Project Not Found"

**Penyebab:** 
- Project ID tidak valid (bukan UUID)
- Project sudah dihapus
- Project tidak ada di database

**Solusi:**
- Verify project ID di URL
- Check database untuk project dengan ID tersebut
- Pastikan project belum dihapus

### Error: Database Connection Error

**Penyebab:** Database tidak bisa diakses atau connection string salah.

**Solusi:**
1. Check `DATABASE_URL` environment variable
2. Verify database server running
3. Check network connectivity
4. Verify database credentials

## Adding More Emission Factors

Jika ingin menambahkan emission factors untuk tahun lain atau kategori baru:

1. Edit file `src/db/migrations/seed-ghg-protocol-emission-factors.sql`
2. Tambahkan INSERT statements dengan format:

```sql
INSERT INTO ghg_protocol_emission_factors (
  year, scope, category, activity_name, unit, unit_type,
  co2_factor, ch4_factor, n2o_factor, co2e_factor,
  fuel_type, activity_type, heating_value, heating_value_unit,
  source, notes
) VALUES (
  '2024',                    -- year
  'Scope1',                  -- scope: Scope1, Scope2, Scope3
  'Stationary Combustion',    -- category
  'Natural Gas - Combustion', -- activity_name
  'kWh',                     -- unit
  'energy',                  -- unit_type: energy, volume, mass, distance, currency
  0.2,                       -- co2_factor (kg CO2 per unit)
  0.00001,                   -- ch4_factor (kg CH4 per unit)
  0.00001,                   -- n2o_factor (kg N2O per unit)
  0.20028,                   -- co2e_factor (kg CO2e per unit, total)
  'Natural Gas',             -- fuel_type (optional)
  'Stationary Combustion',   -- activity_type (optional)
  10.55,                     -- heating_value (optional)
  'kWh/m3',                  -- heating_value_unit (optional)
  'EPA eGRID 2024',          -- source
  'Standard natural gas combustion factor' -- notes (optional)
) ON CONFLICT DO NOTHING;
```

3. Jalankan script lagi

**Note:** Untuk production, prefer location-specific atau supplier-specific factors ketika tersedia.

## Scope Categories Reference

### Scope 1 Categories:
- **Stationary Combustion:** Boilers, furnaces, generators
- **Mobile Combustion:** Company vehicles, fleet
- **Fugitive Emissions:** Refrigerant leaks, natural gas leaks
- **Process Emissions:** Industrial processes, chemical reactions

### Scope 2 Categories:
- **Purchased Electricity:** Grid electricity, renewable electricity
- **Purchased Steam:** Steam from external sources
- **Purchased Heating:** District heating, hot water
- **Purchased Cooling:** District cooling, chilled water

### Scope 3 Categories (15 categories):
1. Purchased Goods and Services
2. Capital Goods
3. Fuel and Energy Related Activities
4. Upstream Transportation and Distribution
5. Waste Generated in Operations
6. Business Travel
7. Employee Commuting
8. Upstream Leased Assets
9. Downstream Transportation and Distribution
10. Processing of Sold Products
11. Use of Sold Products
12. End of Life Treatment of Sold Products
13. Downstream Leased Assets
14. Franchises
15. Investments

## GWP Values (AR5 - IPCC Fifth Assessment Report)

- **CO₂:** 1
- **CH₄:** 28
- **N₂O:** 265
- **HFCs:** 1240 (average, varies by compound)
- **PFCs:** 7390 (average, varies by compound)
- **SF₆:** 22800
- **NF₃:** 16100

## Calculation Methods

- **Tier 1:** Default emission factors (lowest accuracy, broad averages)
- **Tier 2:** Country/region-specific factors (medium accuracy, location-specific)
- **Tier 3:** Site-specific measurements or supplier-specific data (highest accuracy)
- **Custom:** Organization-specific factors or proprietary data

## Reference

- GHG Protocol Corporate Accounting and Reporting Standard: https://ghgprotocol.org/corporate-standard
- Test Scenarios: `docs/ghg-protocol-test-scenarios.md`
- Database Schema: `src/db/schema/ghg-protocol-schema.ts`
- AI Calculator: `src/lib/ghg-protocol-ai-calculator.ts`


# DEFRA Setup Guide

Panduan setup untuk menggunakan fitur DEFRA Carbon Emission Calculation.

## Prerequisites

1. Database sudah dikonfigurasi dan migration sudah dijalankan
2. Environment variables sudah dikonfigurasi (DATABASE_URL, GEMINI_API_KEY)
3. Node.js dan npm sudah terinstall

## Setup Steps

### 1. Seed Emission Factors

Sebelum bisa membuat calculation, database harus memiliki emission factors. 

**Cara menjalankan seed script:**

**Option 1: Menggunakan tsx (Recommended)**
```bash
# Install tsx jika belum ada
npm install -D tsx

# Jalankan script
npx tsx src/scripts/seed-defra-emission-factors.ts
```

**Option 2: Menggunakan ts-node**
```bash
# Install ts-node jika belum ada
npm install -D ts-node

# Jalankan script
npx ts-node src/scripts/seed-defra-emission-factors.ts
```

**Option 3: Compile dan jalankan dengan node**
```bash
# Compile TypeScript ke JavaScript
npx tsc src/scripts/seed-defra-emission-factors.ts --outDir dist --esModuleInterop --module commonjs --target es2020

# Jalankan compiled JavaScript
node dist/src/scripts/seed-defra-emission-factors.js
```

Script ini akan mengisi emission factors untuk tahun 2024 dengan berbagai kategori:

- **Business Travel** (Road - Cars):
  - Petrol car - small/medium/large
  - Diesel car - small/medium/large

- **Fuels**:
  - Gaseous: Natural gas, LPG
  - Electricity: UK Grid
  - Liquid: Petrol, Diesel

- **Material Use**:
  - Paper production
  - Plastic PET production
  - Aluminium production
  - Steel production

- **Waste**:
  - Landfill
  - Recycling
  - Incineration

### 2. Verify Seed Success

Setelah menjalankan script, Anda akan melihat output seperti:

```
🌱 Starting DEFRA Emission Factors seeding...
📊 Preparing to insert 20 emission factors for year 2024
✅ Successfully inserted 20 emission factors!

📋 Summary:
   - Business travel: 6
   - Fuels: 7
   - Material use: 4
   - Waste: 3

✨ Seeding completed successfully!
```

### 3. Test Calculation

Setelah emission factors ter-seed, Anda bisa:

1. Buat DEFRA project dengan DEFRA Year "2024"
2. Buat calculation dengan activity name yang sesuai
3. AI akan otomatis memilih emission factor yang tepat

## Troubleshooting

### Error: "No emission factors found for year 2024"

**Penyebab:** Emission factors belum di-seed ke database.

**Solusi:**
1. Jalankan seed script: `npx tsx src/scripts/seed-defra-emission-factors.ts`
2. Pastikan script berjalan tanpa error
3. Verify dengan query database atau coba create calculation lagi

### Error: "Emission factors already exist"

**Penyebab:** Emission factors untuk tahun 2024 sudah ada di database.

**Solusi:**
- Jika ingin re-seed, hapus dulu emission factors yang ada:
  ```sql
  DELETE FROM defra_emission_factors WHERE year = '2024';
  ```
- Atau update script untuk handle duplicate dengan ON CONFLICT

### Error: "DEFRA AI calculation failed"

**Penyebab:** 
- AI tidak bisa menemukan emission factor yang sesuai
- Activity name terlalu umum atau tidak jelas
- Unit tidak match dengan emission factors yang ada

**Solusi:**
1. Gunakan activity name yang lebih spesifik (e.g., "Petrol car - medium (1.4L to 2.0L)")
2. Pastikan unit sesuai dengan emission factors (km, kWh, litres, kg, tonnes)
3. Isi category field untuk membantu AI selection
4. Pastikan DEFRA Year di project sesuai dengan emission factors yang ada

## Adding More Emission Factors

Jika ingin menambahkan emission factors untuk tahun lain atau kategori baru:

1. Edit file `src/scripts/seed-defra-emission-factors.ts`
2. Tambahkan data ke array `emissionFactors2024` atau buat array baru untuk tahun lain
3. Jalankan script lagi

Format data emission factor:
```typescript
{
  year: '2024',
  level1Category: 'Business travel',
  level2Category: 'Road',
  level3Category: 'Cars',
  activityName: 'Petrol car - medium (1.4L to 2.0L)',
  unit: 'km',
  unitType: 'distance',
  co2Factor: '0.19296',      // kg CO2 per unit
  ch4Factor: '0.00001',      // kg CH4 per unit
  n2oFactor: '0.00001',      // kg N2O per unit
  co2eFactor: '0.19298',     // kg CO2e per unit (total)
  scope: 'Scope 3',
  source: 'DEFRA',
  notes: 'Optional notes'
}
```

## Reference

- DEFRA Conversion Factors Database: https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting
- Test Scenarios: `docs/defra-test-scenarios.md`


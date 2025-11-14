# GHG Protocol Test Scenarios

Dokumen ini berisi test scenarios untuk flow GHG Protocol (Greenhouse Gas Protocol Corporate Standard) dari mulai create project sampai calculate emission menggunakan AI.

## ⚠️ Important Setup

**Sebelum menjalankan test scenarios untuk calculation, pastikan emission factors sudah di-seed ke database:**

```bash
# Jalankan SQL seed script
psql -d your_database_name -f src/db/migrations/seed-ghg-protocol-emission-factors.sql

# Atau menggunakan database client lainnya
```

**Note:** Emission factors untuk tahun 2024 sudah tersedia di seed script. Project GHG Protocol akan menggunakan tahun 2024 secara default.

Lihat [GHG Protocol Setup Guide](./ghg-protocol-setup-guide.md) untuk detail setup lengkap dan troubleshooting.

## Table of Contents

1. [Project Management](#project-management)
2. [Carbon Calculation (AI-Powered)](#carbon-calculation-ai-powered)
3. [Calculation Details & Viewing](#calculation-details--viewing)
4. [Project Summary](#project-summary)
5. [Error Scenarios](#error-scenarios)
6. [Integration Flow](#integration-flow)

---

## Project Management

### TC-GHG-001: Create New GHG Protocol Project

**Description:** User membuat project GHG Protocol baru dengan data lengkap

**Preconditions:**

- User sudah login dan memiliki akses ke tenant
- User berada di halaman `/apps/carbon-emission/ghg-protocol/projects`

**Test Steps:**

1. Klik tombol "Tambah Project"
2. Isi form dengan data berikut:
   - Name: "Q1 2024 Corporate Carbon Footprint"
   - Description: "Corporate carbon footprint assessment untuk Q1 2024 berdasarkan GHG Protocol Corporate Standard"
   - Organization Name: "PT. Green Energy Indonesia"
   - Location: "Jakarta, Indonesia"
   - Reporting Period Start: "2024-01-01"
   - Reporting Period End: "2024-03-31"
   - Status: "draft"
   - Boundary Type: "operational"
   - Standard Version: "GHG Protocol Corporate Standard"
   - Reporting Year: (hidden, default "2024")
3. Klik tombol "Buat Project"

**Expected Result:**

- ✅ Project berhasil dibuat
- ✅ Dialog success muncul dengan pesan "Project berhasil dibuat"
- ✅ Project muncul di list projects dengan card layout
- ✅ Status project adalah "draft"
- ✅ Reporting Year otomatis "2024" (tidak perlu diinput user)
- ✅ User bisa klik project card untuk masuk ke detail page
- ✅ Project ID adalah UUID yang valid
- ✅ Created At timestamp terisi
- ✅ Updated At timestamp terisi
- ✅ Location ditampilkan di project card

---

### TC-GHG-002: Create GHG Protocol Project with Minimal Data

**Description:** User membuat project dengan data minimal (hanya required fields)

**Preconditions:**

- User sudah login dan memiliki akses ke tenant

**Test Steps:**

1. Klik tombol "Tambah Project"
2. Isi hanya required fields:
   - Name: "Test Project 2024"
   - Reporting Period Start: "2024-01-01"
   - Reporting Period End: "2024-12-31"
   - Reporting Year: (hidden, default "2024")
3. Klik tombol "Buat Project"

**Expected Result:**

- ✅ Project berhasil dibuat
- ✅ Description, Organization Name, Location bisa null
- ✅ Status default ke "draft"
- ✅ Boundary Type default ke "operational"
- ✅ Standard Version default ke "GHG Protocol Corporate Standard"
- ✅ Reporting Year otomatis "2024"
- ✅ Project muncul di list dengan data minimal

---

### TC-GHG-003: Create GHG Protocol Project - Validation Error

**Description:** User mencoba create project tanpa required fields

**Preconditions:**

- User sudah login

**Test Steps:**

1. Klik tombol "Tambah Project"
2. Biarkan form kosong atau hanya isi sebagian:
   - Name: (kosong)
   - Reporting Period Start: "2024-01-01"
   - Reporting Period End: (kosong)
3. Klik tombol "Buat Project"

**Expected Result:**

- ❌ Form tidak bisa di-submit
- ❌ Button "Buat Project" disabled
- ❌ Error message muncul untuk field yang required (Name, Reporting Period Start, Reporting Period End)
- ❌ Project tidak dibuat

---

### TC-GHG-004: Update Project Information

**Description:** User mengupdate informasi project yang sudah ada

**Preconditions:**

- Project sudah dibuat
- User berada di projects list page

**Test Steps:**

1. Klik icon edit (pencil) pada project card
2. Ubah Name dari "Test Project" menjadi "Updated Test Project"
3. Ubah Description menjadi "Updated description"
4. Ubah Status dari "draft" menjadi "active"
5. Klik tombol "Perbarui"

**Expected Result:**

- ✅ Dialog edit terbuka dengan data project yang sudah ada
- ✅ Form terisi dengan data project saat ini
- ✅ Project berhasil diupdate
- ✅ Dialog success muncul dengan pesan "Project berhasil diperbarui"
- ✅ Project di list terupdate dengan data baru
- ✅ Updated At timestamp terupdate

---

### TC-GHG-005: View Project Details

**Description:** User melihat detail project GHG Protocol

**Preconditions:**

- Project sudah dibuat
- User berada di projects list page

**Test Steps:**

1. Klik project card untuk masuk ke detail page
2. Periksa semua informasi yang ditampilkan

**Expected Result:**

- ✅ User diarahkan ke `/apps/carbon-emission/ghg-protocol/projects/{projectId}`
- ✅ Project header menampilkan:
  - Project name dengan status badge
  - Description (jika ada)
  - Reporting period (formatted date)
  - Organization name (jika ada)
  - Location (jika ada)
  - Reporting year
  - Boundary type
- ✅ Summary cards menampilkan:
  - Total CO₂ Equivalent
  - Total Calculations count
  - Scope 1 Total
  - Scope 2 Total
  - Scope 3 Total (jika ada)
- ✅ Tombol "Add Calculation" tersedia di header
- ✅ Calculations table ditampilkan (kosong jika belum ada calculations)

---

### TC-GHG-006: Delete Project

**Description:** User menghapus project GHG Protocol

**Preconditions:**

- Project sudah dibuat
- Project mungkin sudah memiliki calculations atau belum

**Test Steps:**

1. Klik icon delete (trash) pada project card
2. Konfirmasi dialog muncul
3. Klik "Confirm" atau "Yes" di confirmation dialog

**Expected Result:**

- ✅ Confirmation dialog muncul dengan pesan "Are you sure delete this project?"
- ✅ Project berhasil dihapus setelah konfirmasi
- ✅ Dialog success muncul dengan pesan "Project berhasil dihapus"
- ✅ Project tidak muncul lagi di list
- ✅ Jika project memiliki calculations, calculations juga terhapus (cascade delete)
- ✅ Project summary juga terhapus (cascade delete)

---

### TC-GHG-007: Search Projects

**Description:** User mencari project menggunakan search input

**Preconditions:**

- Ada minimal 3 projects di list
- User berada di halaman projects list

**Test Steps:**

1. Ketik "Q1" di search input
2. Lihat hasil filter
3. Ketik "2024" di search input
4. Ketik nama organization di search input

**Expected Result:**

- ✅ Search filter bekerja dengan case-insensitive
- ✅ Search mencari di field: name, organizationName, reportingYear
- ✅ List projects ter-filter sesuai keyword
- ✅ Jika tidak ada hasil, menampilkan "Belum ada proyek GHG Protocol yang tersedia"
- ✅ Search bekerja secara real-time saat user mengetik

---

## Carbon Calculation (AI-Powered)

### TC-GHG-008: Create Calculation - Scope 1 Stationary Combustion

**Description:** User membuat carbon calculation untuk Scope 1 - Stationary Combustion menggunakan AI

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page
- Project memiliki Reporting Year "2024"
- **IMPORTANT: Emission factors untuk tahun 2024 sudah di-seed ke database**

**Test Steps:**

1. Klik tombol "Add Calculation" di header project detail page
2. Isi form dengan data berikut:
   - Scope: "Scope1"
   - Category: "Stationary Combustion"
   - Activity Name: "Natural gas consumption for heating"
   - Quantity: "1000"
   - Unit: "kWh"
   - Description: "Natural gas used for office building heating system"
   - Gas Type: (kosongkan, biarkan AI auto-detect)
   - Calculation Method: (kosongkan, biarkan default)
   - Use custom emission factor: (unchecked)
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ✅ Form validation berjalan dengan baik
- ✅ Loading state muncul saat "Calculating..."
- ✅ AI memilih emission factor yang sesuai untuk natural gas combustion
- ✅ AI menentukan gas type sebagai "CO2" (atau kombinasi CO2, CH4, N2O)
- ✅ Calculation berhasil dibuat
- ✅ Dialog success muncul dengan pesan "Calculation Created"
- ✅ Calculation muncul di calculations table
- ✅ Project summary otomatis terupdate
- ✅ Total CO₂e di metrics card berubah
- ✅ Scope 1 Total bertambah
- ✅ Calculations count bertambah
- ✅ Calculation memiliki:
  - Gas Type: CO2 (atau sesuai yang dipilih AI)
  - Emission Value (kg gas)
  - CO₂ Equivalent (kg CO₂e)
  - GWP Value yang sesuai
  - Calculation Method (tier1/tier2/tier3/custom)
  - Emission Factor dengan source dan unit

---

### TC-GHG-009: Create Calculation - Scope 1 Mobile Combustion

**Description:** User membuat calculation untuk Scope 1 - Mobile Combustion

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan:
   - Scope: "Scope1"
   - Category: "Mobile Combustion"
   - Activity Name: "Company vehicle - diesel car"
   - Quantity: "500"
   - Unit: "km"
   - Description: "Business travel using company diesel vehicle"
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ✅ AI memilih emission factor untuk diesel vehicle
- ✅ Calculation berhasil dibuat dengan Scope 1
- ✅ Gas Type biasanya CO2 (dengan CH4 dan N2O minor)
- ✅ CO₂e dihitung dengan benar
- ✅ Scope 1 Total terupdate

---

### TC-GHG-010: Create Calculation - Scope 2 Purchased Electricity

**Description:** User membuat calculation untuk Scope 2 - Purchased Electricity

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan:
   - Scope: "Scope2"
   - Category: "Purchased Electricity"
   - Activity Name: "Grid electricity consumption"
   - Quantity: "5000"
   - Unit: "kWh"
   - Description: "Electricity purchased from grid for office operations"
   - Location: "Jakarta, Indonesia" (optional)
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ✅ AI memilih emission factor untuk grid electricity
- ✅ AI mungkin menggunakan location-specific factor jika tersedia
- ✅ Calculation berhasil dibuat dengan Scope 2
- ✅ Gas Type: CO2 (dari grid mix)
- ✅ CO₂e dihitung dengan benar
- ✅ Scope 2 Total terupdate
- ✅ Calculation Method mungkin "tier2" jika menggunakan location-specific factor

---

### TC-GHG-011: Create Calculation - Scope 3 Business Travel

**Description:** User membuat calculation untuk Scope 3 - Business Travel

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan:
   - Scope: "Scope3"
   - Category: "Business Travel"
   - Activity Name: "Air travel - short haul"
   - Quantity: "2000"
   - Unit: "km"
   - Description: "Employee business travel by airplane"
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ✅ AI memilih emission factor untuk air travel
- ✅ Calculation berhasil dibuat dengan Scope 3
- ✅ Gas Type: CO2
- ✅ CO₂e dihitung dengan benar
- ✅ Scope 3 Total terupdate
- ✅ Category "Business Travel" tersimpan dengan benar

---

### TC-GHG-012: Create Calculation - Scope 3 Waste Disposal

**Description:** User membuat calculation untuk Scope 3 - Waste Generated in Operations

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan:
   - Scope: "Scope3"
   - Category: "Waste Generated in Operations"
   - Activity Name: "Waste disposal - landfill"
   - Quantity: "500"
   - Unit: "kg"
   - Description: "Organic waste sent to landfill"
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ✅ AI memilih emission factor untuk landfill waste
- ✅ Calculation berhasil dibuat dengan Scope 3
- ✅ Gas Type: CH4 (methane dari landfill)
- ✅ CO₂e dihitung menggunakan GWP CH4 (28)
- ✅ Scope 3 Total terupdate

---

### TC-GHG-013: Create Calculation - Scope 1 Fugitive Emissions (Refrigerants)

**Description:** User membuat calculation untuk Scope 1 - Fugitive Emissions (HFCs)

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan:
   - Scope: "Scope1"
   - Category: "Fugitive Emissions"
   - Activity Name: "Refrigerant leak - R-134a"
   - Quantity: "5"
   - Unit: "kg"
   - Description: "HFC refrigerant leak from air conditioning system"
   - Gas Type: "HFCs" (optional, bisa biarkan AI detect)
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ✅ AI memilih emission factor untuk HFCs (R-134a)
- ✅ Calculation berhasil dibuat dengan Scope 1
- ✅ Gas Type: HFCs
- ✅ CO₂e dihitung menggunakan GWP HFCs (1240 atau sesuai compound)
- ✅ Scope 1 Total terupdate
- ✅ Emission factor memiliki source yang jelas

---

### TC-GHG-014: Create Calculation - With Custom Emission Factor

**Description:** User membuat calculation dengan custom emission factor (tidak menggunakan AI)

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan:
   - Scope: "Scope1"
   - Category: "Stationary Combustion"
   - Activity Name: "Custom fuel consumption"
   - Quantity: "100"
   - Unit: "liter"
   - Checkbox "Use custom emission factor": ✅ (checked)
   - Emission Factor Value: "2.5"
   - Emission Factor Unit: "kg CO2/liter"
   - Emission Factor Source: "Custom - Supplier Data"
   - Gas Type: "CO2"
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ✅ Custom emission factor form muncul setelah checkbox dicentang
- ✅ Calculation menggunakan custom factor yang diinput
- ✅ Calculation berhasil dibuat
- ✅ Emission Factor di calculation menggunakan custom value
- ✅ Source ditampilkan sebagai "Custom - Supplier Data"
- ✅ Calculation Method mungkin "custom"
- ✅ CO₂e = Quantity × Custom Factor × GWP

---

### TC-GHG-015: Create Calculation - Minimal Data

**Description:** User membuat calculation dengan hanya required fields

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi hanya required fields:
   - Scope: "Scope1"
   - Category: "Stationary Combustion"
   - Quantity: "500"
   - Unit: "kWh"
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ✅ Calculation berhasil dibuat
- ✅ Activity Name, Description, Notes, Evidence bisa null
- ✅ Gas Type di-detect oleh AI
- ✅ Calculation Method default ke tier1 atau sesuai yang dipilih AI
- ✅ AI tetap bisa memilih emission factor dengan baik

---

### TC-GHG-016: Create Calculation - AI Factor Selection (No Category)

**Description:** User membuat calculation tanpa specify category detail, AI harus infer dari activity name

**Preconditions:**

- Project sudah dibuat dengan Reporting Year "2024"
- Database memiliki multiple emission factors untuk tahun 2024

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan:
   - Scope: "Scope1"
   - Category: "Stationary Combustion" (general category)
   - Activity Name: "Natural gas boiler consumption"
   - Quantity: "2000"
   - Unit: "kWh"
   - Description: (kosongkan)
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ✅ AI berhasil memilih emission factor yang sesuai
- ✅ AI menggunakan activity name untuk infer specific factor
- ✅ Calculation berhasil dibuat dengan factor yang tepat
- ✅ Reasoning dari AI tersimpan (jika ada di response)
- ✅ Explanation dari AI tersimpan (jika ada di response)

---

### TC-GHG-017: Create Calculation - Different Scopes

**Description:** User membuat calculations untuk berbagai scope dan verify summary terupdate dengan benar

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page

**Test Steps:**

1. Buat calculation pertama:
   - Scope: "Scope1", Category: "Stationary Combustion"
   - Activity: "Natural gas" (Quantity: 1000, Unit: kWh)
   - Note: Total CO₂e = X
2. Periksa summary metrics
3. Buat calculation kedua:
   - Scope: "Scope2", Category: "Purchased Electricity"
   - Activity: "Grid electricity" (Quantity: 5000, Unit: kWh)
   - Note: Total CO₂e = Y
4. Periksa summary metrics lagi
5. Buat calculation ketiga:
   - Scope: "Scope3", Category: "Business Travel"
   - Activity: "Air travel" (Quantity: 2000, Unit: km)
   - Note: Total CO₂e = Z

**Expected Result:**

- ✅ Semua calculations berhasil dibuat
- ✅ Total CO₂e = X + Y + Z
- ✅ Scope 1 Total = X
- ✅ Scope 2 Total = Y
- ✅ Scope 3 Total = Z
- ✅ Calculations count = 3
- ✅ Summary terupdate setelah setiap calculation dibuat
- ✅ Metrics cards menampilkan nilai yang benar

---

### TC-GHG-018: Create Calculation - Invalid Quantity

**Description:** User mencoba create calculation dengan quantity yang tidak valid

**Preconditions:**

- Project sudah dibuat

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan:
   - Scope: "Scope1"
   - Category: "Stationary Combustion"
   - Activity Name: "Test activity"
   - Quantity: "0" atau "-10" atau "abc"
   - Unit: "kWh"
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ❌ Jika quantity <= 0: Error muncul "Quantity must be a positive number"
- ❌ Jika quantity bukan angka: Error muncul atau form tidak bisa submit
- ❌ Calculation tidak dibuat
- ❌ Error message ditampilkan dengan jelas

---

### TC-GHG-019: Create Calculation - Missing Required Fields

**Description:** User mencoba create calculation tanpa required fields

**Preconditions:**

- Project sudah dibuat

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Biarkan Category kosong
3. Isi Quantity: "100"
4. Isi Unit: "kWh"
5. Klik tombol "Calculate & Save"

**Expected Result:**

- ❌ Button "Calculate & Save" disabled
- ❌ Form tidak bisa di-submit
- ❌ Error message muncul untuk Category (required field)
- ❌ Calculation tidak dibuat

---

### TC-GHG-020: Create Calculation - AI Calculation Error Handling

**Description:** User membuat calculation tetapi AI gagal atau return error

**Preconditions:**

- Project sudah dibuat
- GEMINI_API_KEY tidak valid atau AI service down (simulasi)

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan data valid:
   - Scope: "Scope1"
   - Category: "Stationary Combustion"
   - Quantity: "100"
   - Unit: "kWh"
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ⚠️ Error dialog muncul dengan pesan error dari AI
- ❌ Calculation tidak dibuat
- ❌ Error message informatif (e.g., "GHG Protocol AI calculation failed: ...")
- ✅ User bisa retry setelah memperbaiki masalah
- ✅ Form data tidak hilang (jika error handling baik)

---

## Calculation Details & Viewing

### TC-GHG-021: View Calculation Details

**Description:** User melihat detail calculation yang sudah dibuat

**Preconditions:**

- Project sudah memiliki minimal 1 calculation
- User berada di project detail page

**Test Steps:**

1. Scroll ke calculations table
2. Klik icon "Eye" (view) pada salah satu calculation
3. Periksa semua informasi di detail dialog

**Expected Result:**

- ✅ Detail dialog terbuka
- ✅ Menampilkan Calculation Information:
  - Category
  - Scope (dengan badge warna)
  - Gas Type
  - Status (draft/calculated/verified/approved)
- ✅ Menampilkan Activity Data:
  - Quantity dengan unit
  - Activity Name (jika ada)
  - Description (jika ada)
- ✅ Menampilkan Emission Factor Used:
  - Value dengan unit
  - Source
  - Gas Type dari factor
- ✅ Menampilkan Calculation Results:
  - Emission Value (kg gas)
  - CO₂ Equivalent (kg CO₂e)
  - GWP Value yang digunakan
  - Calculation Method
- ✅ Menampilkan Additional Info:
  - Notes (jika ada)
  - Evidence (jika ada, sebagai link)
  - Calculated At (formatted date)
- ✅ Format angka menggunakan formatNumber (dengan thousand separator)
- ✅ Dialog bisa di-close dengan klik outside atau tombol close

---

### TC-GHG-022: View Calculations Table

**Description:** User melihat list semua calculations di table

**Preconditions:**

- Project sudah memiliki minimal 3 calculations
- User berada di project detail page

**Test Steps:**

1. Scroll ke bagian calculations table
2. Periksa semua kolom di table
3. Periksa informasi yang ditampilkan

**Expected Result:**

- ✅ Table menampilkan semua calculations
- ✅ Kolom-kolom yang ditampilkan:
  - Category (dengan notes jika ada)
  - Scope (badge dengan warna berbeda)
  - Activity (activity name atau description)
  - Quantity (dengan unit)
  - Gas Type (badge)
  - CO₂e (dengan format yang jelas, termasuk tons)
  - Status (badge)
  - Actions (view, delete)
- ✅ Calculations diurutkan berdasarkan calculatedAt descending (terbaru di atas)
- ✅ Format angka menggunakan formatNumber
- ✅ Scope badge memiliki warna berbeda:
  - Scope 1: red (bg-red-100 text-red-800)
  - Scope 2: blue (bg-blue-100 text-blue-800)
  - Scope 3: green (bg-green-100 text-green-800)
- ✅ Jika tidak ada calculations, menampilkan pesan "No calculations found. Add your first calculation to get started."

---

### TC-GHG-023: Delete Calculation

**Description:** User menghapus calculation yang sudah dibuat

**Preconditions:**

- Project sudah memiliki minimal 1 calculation
- User berada di project detail page

**Test Steps:**

1. Scroll ke calculations table
2. Klik icon delete (trash) pada salah satu calculation
3. Konfirmasi di dialog yang muncul
4. Klik "Confirm" atau "Yes"

**Expected Result:**

- ✅ Confirmation dialog muncul dengan pesan "Are you sure you want to delete this calculation? This action cannot be undone."
- ✅ Calculation berhasil dihapus setelah konfirmasi
- ✅ Dialog success muncul dengan pesan "Calculation Deleted"
- ✅ Calculation tidak muncul lagi di table
- ✅ Project summary otomatis terupdate
- ✅ Total CO₂e di metrics card berkurang
- ✅ Calculations count berkurang
- ✅ Scope breakdown terupdate (Scope 1/2/3 total berkurang sesuai)
- ✅ Jika ini adalah calculation terakhir, summary menjadi 0

---

### TC-GHG-024: Multiple Calculations - Summary Update

**Description:** User membuat multiple calculations dan verify summary terupdate dengan benar

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page

**Test Steps:**

1. Buat calculation pertama:
   - Scope: "Scope1", Activity: "Natural gas" (Quantity: 1000, Unit: kWh)
   - Note: Total CO₂e = X
2. Periksa summary metrics
3. Buat calculation kedua:
   - Scope: "Scope2", Activity: "Electricity" (Quantity: 5000, Unit: kWh)
   - Note: Total CO₂e = Y
4. Periksa summary metrics lagi
5. Buat calculation ketiga:
   - Scope: "Scope3", Activity: "Business travel" (Quantity: 2000, Unit: km)
   - Note: Total CO₂e = Z
6. Periksa summary metrics final
7. Hapus calculation kedua
8. Periksa summary metrics setelah delete

**Expected Result:**

- ✅ Setelah calculation pertama: Total CO₂e = X, Scope 1 = X
- ✅ Setelah calculation kedua: Total CO₂e = X + Y, Scope 1 = X, Scope 2 = Y
- ✅ Setelah calculation ketiga: Total CO₂e = X + Y + Z, Scope 1 = X, Scope 2 = Y, Scope 3 = Z
- ✅ Setelah delete calculation kedua: Total CO₂e = X + Z, Scope 1 = X, Scope 2 = 0, Scope 3 = Z
- ✅ Summary selalu konsisten dengan calculations yang ada
- ✅ Calculations count selalu sesuai dengan jumlah calculations

---

## Project Summary

### TC-GHG-025: Project Summary - Initial State

**Description:** User melihat project summary saat project baru dibuat (belum ada calculations)

**Preconditions:**

- Project baru dibuat
- Belum ada calculations
- User berada di project detail page

**Test Steps:**

1. Periksa semua summary cards
2. Periksa calculations table

**Expected Result:**

- ✅ Total CO₂ Equivalent: "0 kg CO₂e"
- ✅ Calculations: "0"
- ✅ Scope 1: "0 kg CO₂e"
- ✅ Scope 2: "0 kg CO₂e"
- ✅ Scope 3 card tidak muncul (karena 0)
- ✅ Calculations table menampilkan empty state: "No calculations found. Add your first calculation to get started."

---

### TC-GHG-026: Project Summary - After Calculations

**Description:** User melihat project summary setelah membuat beberapa calculations

**Preconditions:**

- Project sudah memiliki beberapa calculations dengan berbagai scope
- User berada di project detail page

**Test Steps:**

1. Periksa semua summary cards
2. Verify bahwa nilai-nilai sesuai dengan calculations

**Expected Result:**

- ✅ Total CO₂ Equivalent = sum dari semua CO₂e calculations
- ✅ Calculations count = jumlah calculations yang ada
- ✅ Scope 1 Total = sum dari CO₂e calculations dengan scope "Scope1"
- ✅ Scope 2 Total = sum dari CO₂e calculations dengan scope "Scope2"
- ✅ Scope 3 Total = sum dari CO₂e calculations dengan scope "Scope3" (jika ada)
- ✅ Scope 3 card muncul jika Scope 3 Total > 0
- ✅ Format angka menggunakan formatNumber (dengan thousand separator)
- ✅ Nilai selalu konsisten dengan calculations table

---

## Error Scenarios

### TC-GHG-027: Create Calculation - Network Error

**Description:** User membuat calculation tetapi terjadi network error

**Preconditions:**

- Project sudah dibuat
- Network connection terputus atau server error

**Test Steps:**

1. Putuskan network connection (atau simulasi server error)
2. Klik tombol "Add Calculation"
3. Isi form dengan data valid
4. Klik tombol "Calculate & Save"

**Expected Result:**

- ⚠️ Error dialog muncul dengan pesan error network
- ❌ Calculation tidak dibuat
- ✅ Error message informatif
- ✅ User bisa retry setelah koneksi kembali

---

### TC-GHG-028: Access Denied - Different Tenant

**Description:** User mencoba akses project dari tenant yang berbeda

**Preconditions:**

- User A membuat project di Tenant A
- User B (dari Tenant B) mencoba akses project tersebut

**Test Steps:**

1. User B mencoba akses project detail page dengan project ID dari Tenant A
2. Atau User B mencoba create calculation untuk project Tenant A

**Expected Result:**

- ❌ Access denied error muncul
- ❌ User B tidak bisa melihat project detail
- ❌ User B tidak bisa create calculation
- ✅ Error message: "Access denied to this project" atau "Access denied to this tenant"

---

### TC-GHG-029: Invalid Project ID

**Description:** User mencoba akses project dengan ID yang tidak valid

**Preconditions:**

- User sudah login

**Test Steps:**

1. User mengakses URL dengan project ID yang tidak valid (bukan UUID atau UUID yang tidak ada)
2. Atau User mengakses project yang sudah dihapus

**Expected Result:**

- ❌ Error page muncul atau empty state
- ❌ Error message: "Project Not Found" atau "The GHG Protocol project you're looking for doesn't exist or has been removed"
- ✅ User bisa kembali ke projects list

---

## Integration Flow

### TC-GHG-030: Complete Flow - Project to Calculation

**Description:** Complete flow dari create project sampai create calculation dan verify summary

**Preconditions:**

- User sudah login
- Database sudah di-seed dengan emission factors untuk tahun 2024

**Test Steps:**

1. **Create Project:**

   - Buka `/apps/carbon-emission/ghg-protocol/projects`
   - Klik "Tambah Project"
   - Isi form dengan data lengkap
   - Klik "Buat Project"
   - Verify project muncul di list

2. **View Project Detail:**

   - Klik project card
   - Verify project detail page terbuka
   - Verify summary cards menampilkan 0

3. **Create First Calculation (Scope 1):**

   - Klik "Add Calculation"
   - Isi form untuk Scope 1 Stationary Combustion
   - Klik "Calculate & Save"
   - Verify calculation muncul di table
   - Verify Scope 1 Total terupdate

4. **Create Second Calculation (Scope 2):**

   - Klik "Add Calculation"
   - Isi form untuk Scope 2 Purchased Electricity
   - Klik "Calculate & Save"
   - Verify calculation muncul di table
   - Verify Scope 2 Total terupdate
   - Verify Total CO₂e = Scope 1 + Scope 2

5. **Create Third Calculation (Scope 3):**

   - Klik "Add Calculation"
   - Isi form untuk Scope 3 Business Travel
   - Klik "Calculate & Save"
   - Verify calculation muncul di table
   - Verify Scope 3 Total terupdate
   - Verify Total CO₂e = Scope 1 + Scope 2 + Scope 3

6. **View Calculation Details:**

   - Klik icon "Eye" pada salah satu calculation
   - Verify detail dialog menampilkan semua informasi
   - Close dialog

7. **Delete Calculation:**

   - Klik icon delete pada salah satu calculation
   - Konfirmasi delete
   - Verify calculation terhapus
   - Verify summary terupdate

8. **Verify Final Summary:**
   - Verify Total CO₂e sesuai dengan calculations yang tersisa
   - Verify Scope totals sesuai dengan calculations per scope
   - Verify Calculations count sesuai dengan jumlah calculations

**Expected Result:**

- ✅ Semua step berjalan dengan baik
- ✅ Project berhasil dibuat
- ✅ Calculations berhasil dibuat dengan AI
- ✅ Summary selalu konsisten dengan calculations
- ✅ Delete calculation mengupdate summary dengan benar
- ✅ Final summary akurat dan sesuai dengan calculations yang ada

---

### TC-GHG-031: Dashboard Integration

**Description:** User melihat dashboard GHG Protocol dan verify data terintegrasi dengan projects

**Preconditions:**

- User sudah memiliki beberapa projects dengan calculations
- User berada di `/apps/carbon-emission/ghg-protocol/dashboard`

**Test Steps:**

1. Buka dashboard page
2. Periksa overview tab
3. Periksa projects tab
4. Periksa trends tab

**Expected Result:**

- ✅ Dashboard menampilkan:
  - Total Projects count
  - Total Proyek Aktif
  - Tahun Aktif count
- ✅ Overview tab menampilkan:
  - Total Projects
  - Proyek Aktif
  - Proyek Selesai
  - Proyek Terbaru (jika ada)
- ✅ Projects tab menampilkan semua projects
- ✅ Trends tab menampilkan placeholder atau grafik (jika ada data)
- ✅ Data konsisten dengan projects list page

---

## Notes

- **Reporting Year:** GHG Protocol project menggunakan tahun 2024 secara default (tidak perlu diinput user)
- **Emission Factors:** Database harus memiliki emission factors untuk tahun 2024 sebelum bisa membuat calculations
- **AI Calculation:** AI menggunakan Google Gemini untuk memilih emission factor dan menghitung emisi
- **GWP Values:** Menggunakan AR5 (IPCC Fifth Assessment Report):
  - CO₂: 1
  - CH₄: 28
  - N₂O: 265
  - HFCs: 1240 (average)
  - PFCs: 7390 (average)
  - SF₆: 22800
  - NF₃: 16100
- **Scope Categories:**
  - Scope 1: Stationary Combustion, Mobile Combustion, Fugitive Emissions, Process Emissions
  - Scope 2: Purchased Electricity, Purchased Steam, Purchased Heating, Purchased Cooling
  - Scope 3: 15 categories (Purchased Goods, Business Travel, Waste, dll)

---

## Reference

- GHG Protocol Corporate Accounting and Reporting Standard
- Test Scenarios: `docs/ghg-protocol-test-scenarios.md`
- Setup Guide: `docs/ghg-protocol-setup-guide.md` (jika ada)

# DEFRA Test Scenarios

Dokumen ini berisi test scenarios untuk flow DEFRA (Department for Environment, Food and Rural Affairs) dari mulai create project sampai calculate emission menggunakan AI.

## ⚠️ Important Setup

**Sebelum menjalankan test scenarios untuk calculation, pastikan emission factors sudah di-seed ke database:**

```bash
# Install tsx jika belum ada
npm install -D tsx

# Jalankan seed script
npx tsx src/scripts/seed-defra-emission-factors.ts
```

Lihat [DEFRA Setup Guide](./defra-setup-guide.md) untuk detail setup lengkap dan troubleshooting.

## Table of Contents

1. [Project Management](#project-management)
2. [Carbon Calculation (AI-Powered)](#carbon-calculation-ai-powered)
3. [Calculation Details & Viewing](#calculation-details--viewing)
4. [Project Summary](#project-summary)
5. [Error Scenarios](#error-scenarios)
6. [Integration Flow](#integration-flow)

---

## Project Management

### TC-DEFRA-001: Create New DEFRA Project

**Description:** User membuat project DEFRA baru dengan data lengkap

**Preconditions:**

- User sudah login dan memiliki akses ke tenant
- User berada di halaman `/apps/carbon-emission/defra/projects`

**Test Steps:**

1. Klik tombol "Tambah Project"
2. Isi form dengan data berikut:
   - Name: "Q1 2024 Carbon Audit"
   - Description: "Carbon footprint audit untuk Q1 2024"
   - Organization Name: "PT. Green Energy"
   - Reporting Period Start: "2024-01-01"
   - Reporting Period End: "2024-03-31"
   - DEFRA Year: "2024"
   - Status: "draft"
3. Klik tombol "Buat Project"

**Expected Result:**

- ✅ Project berhasil dibuat
- ✅ Dialog success muncul dengan pesan "Project berhasil dibuat"
- ✅ Project muncul di list projects dengan card layout
- ✅ Status project adalah "draft"
- ✅ User bisa klik project card untuk masuk ke detail page
- ✅ Project ID adalah UUID yang valid
- ✅ Created At timestamp terisi
- ✅ Updated At timestamp terisi

---

### TC-DEFRA-002: Create DEFRA Project with Minimal Data

**Description:** User membuat project dengan data minimal (hanya required fields)

**Preconditions:**

- User sudah login dan memiliki akses ke tenant

**Test Steps:**

1. Klik tombol "Tambah Project"
2. Isi hanya required fields:
   - Name: "Test Project 2024"
   - Reporting Period Start: "2024-01-01"
   - Reporting Period End: "2024-12-31"
   - DEFRA Year: "2024"
3. Klik tombol "Buat Project"

**Expected Result:**

- ✅ Project berhasil dibuat
- ✅ Description dan Organization Name bisa null
- ✅ Status default ke "draft"
- ✅ Project muncul di list dengan data minimal

---

### TC-DEFRA-003: Create DEFRA Project - Validation Error

**Description:** User mencoba create project tanpa required fields

**Preconditions:**

- User sudah login

**Test Steps:**

1. Klik tombol "Tambah Project"
2. Biarkan form kosong atau hanya isi sebagian:
   - Name: (kosong)
   - Reporting Period Start: "2024-01-01"
   - Reporting Period End: (kosong)
   - DEFRA Year: (kosong)
3. Klik tombol "Buat Project"

**Expected Result:**

- ❌ Form tidak bisa di-submit
- ❌ Button "Buat Project" disabled
- ❌ Error message muncul untuk field yang required (jika ada validation)
- ❌ Project tidak dibuat

---

### TC-DEFRA-004: Create DEFRA Project - Invalid Date Range

**Description:** User mencoba create project dengan end date sebelum start date

**Preconditions:**

- User sudah login

**Test Steps:**

1. Klik tombol "Tambah Project"
2. Isi form dengan:
   - Name: "Invalid Date Project"
   - Reporting Period Start: "2024-12-31"
   - Reporting Period End: "2024-01-01"
   - DEFRA Year: "2024"
3. Klik tombol "Buat Project"

**Expected Result:**

- ❌ Error muncul dengan pesan "Reporting period end date must be after start date"
- ❌ Project tidak dibuat
- ❌ Dialog error muncul dengan pesan yang jelas

---

### TC-DEFRA-005: Create DEFRA Project - Invalid DEFRA Year Format

**Description:** User mencoba create project dengan DEFRA year yang tidak valid

**Preconditions:**

- User sudah login

**Test Steps:**

1. Klik tombol "Tambah Project"
2. Isi form dengan:
   - Name: "Invalid Year Project"
   - Reporting Period Start: "2024-01-01"
   - Reporting Period End: "2024-12-31"
   - DEFRA Year: "24" (bukan 4 karakter)
3. Klik tombol "Buat Project"

**Expected Result:**

- ❌ Error muncul dengan pesan "DEFRA year must be 4 characters (e.g., '2024')"
- ❌ Project tidak dibuat
- ❌ Validation error ditampilkan dengan jelas

---

### TC-DEFRA-006: Update Project Information

**Description:** User mengupdate informasi project yang sudah ada

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page atau projects list page

**Test Steps:**

1. Klik icon edit (pencil) pada project card atau di detail page
2. Ubah Name dari "Q1 2024 Carbon Audit" menjadi "Q1 2024 Carbon Audit - Updated"
3. Ubah Description menjadi "Updated description"
4. Ubah Status dari "draft" menjadi "active"
5. Klik tombol "Perbarui"

**Expected Result:**

- ✅ Project berhasil diupdate
- ✅ Dialog success muncul dengan pesan "Project berhasil diperbarui"
- ✅ Data yang diubah tersimpan dengan benar
- ✅ Updated At timestamp berubah
- ✅ Perubahan terlihat di project card/list
- ✅ Status badge berubah sesuai status baru

---

### TC-DEFRA-007: Delete Project

**Description:** User menghapus project DEFRA

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

### TC-DEFRA-008: Search Projects

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
- ✅ Search mencari di field: name, organizationName, defraYear
- ✅ List projects ter-filter sesuai keyword
- ✅ Jika tidak ada hasil, menampilkan "Belum ada proyek DEFRA yang tersedia"
- ✅ Search bekerja secara real-time saat user mengetik

---

## Carbon Calculation (AI-Powered)

### TC-DEFRA-009: Create Calculation - Complete Data

**Description:** User membuat carbon calculation dengan data lengkap menggunakan AI

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page
- Project memiliki DEFRA Year (e.g., "2024")
- **IMPORTANT: Emission factors untuk tahun tersebut sudah di-seed ke database**
  - Jalankan: `npx tsx src/scripts/seed-defra-emission-factors.ts`
  - Script akan mengisi emission factors untuk tahun 2024

**Test Steps:**

1. Klik tombol "Add Calculation" di header project detail page
2. Isi form dengan data berikut:
   - Activity Name: "Petrol car - medium (up to 1.4L)"
   - Quantity: "100"
   - Unit: "km"
   - Category: "Business travel" (optional)
   - Activity Date: "2024-02-15"
   - Description: "Business trip from Jakarta to Bandung"
   - Location: "Jakarta-Bandung"
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ✅ Form validation berjalan dengan baik
- ✅ Loading state muncul saat "Calculating..."
- ✅ AI memilih emission factor yang sesuai
- ✅ Calculation berhasil dibuat
- ✅ Dialog success muncul dengan pesan "Calculation Created"
- ✅ Calculation muncul di calculations table
- ✅ Project summary otomatis terupdate
- ✅ Total CO₂e di metrics card berubah
- ✅ Calculations count bertambah
- ✅ Scope breakdown terupdate (Scope 1/2/3)
- ✅ Calculation memiliki:
  - CO₂ emissions (kg)
  - CH₄ emissions (kg)
  - N₂O emissions (kg)
  - Total CO₂e (kg CO₂e)
  - Category
  - Scope (jika emission factor memiliki scope)

---

### TC-DEFRA-010: Create Calculation - Minimal Data

**Description:** User membuat calculation dengan hanya required fields

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi hanya required fields:
   - Activity Name: "Natural gas consumption"
   - Quantity: "500"
   - Unit: "kWh"
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ✅ Calculation berhasil dibuat
- ✅ Activity Date default ke hari ini
- ✅ Description dan Location bisa null
- ✅ Category optional, AI akan mencoba infer dari activity name
- ✅ AI tetap bisa memilih emission factor dengan baik

---

### TC-DEFRA-011: Create Calculation - AI Factor Selection

**Description:** User membuat calculation tanpa specify category, AI harus memilih factor

**Preconditions:**

- Project sudah dibuat dengan DEFRA Year "2024"
- Database memiliki multiple emission factors untuk tahun 2024

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan:
   - Activity Name: "Diesel car journey"
   - Quantity: "200"
   - Unit: "km"
   - Category: (kosongkan)
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ✅ AI berhasil memilih emission factor yang sesuai
- ✅ AI menggunakan activity name untuk infer category
- ✅ Calculation berhasil dibuat dengan factor yang tepat
- ✅ Reasoning dari AI tersimpan (jika ada di response)
- ✅ Explanation dari AI tersimpan (jika ada di response)

---

### TC-DEFRA-012: Create Calculation - Different Activity Types

**Description:** User membuat calculations untuk berbagai jenis aktivitas

**Preconditions:**

- Project sudah dibuat
- Database memiliki emission factors untuk berbagai kategori

**Test Steps:**

1. Buat calculation untuk "Natural gas - consumption" (Quantity: 1000, Unit: kWh)
2. Buat calculation untuk "Petrol car - medium" (Quantity: 150, Unit: km)
3. Buat calculation untuk "Paper - production" (Quantity: 500, Unit: kg)
4. Buat calculation untuk "Waste - landfill" (Quantity: 2, Unit: tonnes)

**Expected Result:**

- ✅ Semua calculations berhasil dibuat
- ✅ AI memilih factor yang berbeda untuk setiap aktivitas
- ✅ Setiap calculation memiliki category yang sesuai
- ✅ Scope berbeda-beda sesuai jenis aktivitas:
  - Natural gas → biasanya Scope 1
  - Electricity → biasanya Scope 2
  - Business travel → biasanya Scope 3
- ✅ Total CO₂e di summary adalah sum dari semua calculations

---

### TC-DEFRA-013: Create Calculation - Invalid Quantity

**Description:** User mencoba create calculation dengan quantity yang tidak valid

**Preconditions:**

- Project sudah dibuat

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan:
   - Activity Name: "Test activity"
   - Quantity: "0" atau "-10" atau "abc"
   - Unit: "km"
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ❌ Jika quantity <= 0: Error muncul "Quantity must be a positive number"
- ❌ Jika quantity bukan angka: Error muncul atau form tidak bisa submit
- ❌ Calculation tidak dibuat
- ❌ Error message ditampilkan dengan jelas

---

### TC-DEFRA-014: Create Calculation - Missing Required Fields

**Description:** User mencoba create calculation tanpa required fields

**Preconditions:**

- Project sudah dibuat

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Biarkan Activity Name kosong
3. Isi Quantity: "100"
4. Isi Unit: "km"
5. Klik tombol "Calculate & Save"

**Expected Result:**

- ❌ Button "Calculate & Save" disabled
- ❌ Form tidak bisa di-submit
- ❌ Error message muncul untuk Activity Name (jika ada validation)
- ❌ Calculation tidak dibuat

---

### TC-DEFRA-015: Create Calculation - Unit Mismatch Warning

**Description:** User membuat calculation dengan unit yang tidak match dengan emission factor unit

**Preconditions:**

- Project sudah dibuat
- Emission factor untuk aktivitas tertentu memiliki unit tertentu (e.g., "km")

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan:
   - Activity Name: "Petrol car - medium"
   - Quantity: "100"
   - Unit: "miles" (sedangkan factor menggunakan "km")
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ⚠️ Warning muncul di console/log tentang unit mismatch (jika ada)
- ✅ Calculation tetap dibuat (AI mungkin melakukan konversi atau memilih factor lain)
- ✅ Atau error muncul jika unit benar-benar tidak compatible
- ✅ User diberi informasi yang jelas tentang unit yang digunakan

---

## Calculation Details & Viewing

### TC-DEFRA-016: View Calculation Details

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
- ✅ Menampilkan Calculation Summary:
  - CO₂ Emissions (kg)
  - CH₄ Emissions (kg)
  - N₂O Emissions (kg)
  - Total CO₂e (kg CO₂e) dengan format yang jelas
- ✅ Menampilkan Activity Information:
  - Quantity dengan unit
  - Activity Date (formatted)
  - Location (jika ada)
  - Description (jika ada)
  - Category badge
  - Scope badge (jika ada)
- ✅ Menampilkan Emission Factor Used:
  - Activity Name dari factor
  - Category dari factor
- ✅ Menampilkan GHG Breakdown:
  - CO₂ dengan GWP 1
  - CH₄ dengan GWP 28
  - N₂O dengan GWP 265
  - Total CO₂e calculation
- ✅ Format angka menggunakan formatNumber (dengan thousand separator)
- ✅ Dialog bisa di-close dengan klik outside atau tombol close

---

### TC-DEFRA-017: View Calculations Table

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
  - Activity (category + description)
  - Date (formatted)
  - Quantity (dengan unit)
  - Category (badge)
  - Scope (badge dengan warna berbeda)
  - Total CO₂e (dengan format yang jelas)
  - Actions (view, delete)
- ✅ Calculations diurutkan berdasarkan activityDate descending (terbaru di atas)
- ✅ Format angka menggunakan formatNumber
- ✅ Scope badge memiliki warna berbeda:
  - Scope 1: red
  - Scope 2: blue
  - Scope 3: green
- ✅ Jika tidak ada calculations, menampilkan pesan "No calculations found"

---

### TC-DEFRA-018: Delete Calculation

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

- ✅ Confirmation dialog muncul dengan pesan "Are you sure you want to delete this calculation?"
- ✅ Calculation berhasil dihapus setelah konfirmasi
- ✅ Dialog success muncul dengan pesan "Calculation Deleted"
- ✅ Calculation tidak muncul lagi di table
- ✅ Project summary otomatis terupdate
- ✅ Total CO₂e di metrics card berkurang
- ✅ Calculations count berkurang
- ✅ Scope breakdown terupdate
- ✅ Jika ini adalah calculation terakhir, summary menjadi 0

---

### TC-DEFRA-019: Multiple Calculations - Summary Update

**Description:** User membuat multiple calculations dan verify summary terupdate dengan benar

**Preconditions:**

- Project sudah dibuat
- User berada di project detail page

**Test Steps:**

1. Buat calculation pertama:
   - Activity: "Natural gas" (Scope 1)
   - Quantity: 1000, Unit: kWh
   - Note: Total CO₂e = X
2. Periksa summary metrics
3. Buat calculation kedua:
   - Activity: "Electricity" (Scope 2)
   - Quantity: 500, Unit: kWh
   - Note: Total CO₂e = Y
4. Periksa summary metrics lagi
5. Buat calculation ketiga:
   - Activity: "Business travel" (Scope 3)
   - Quantity: 200, Unit: km
   - Note: Total CO₂e = Z
6. Periksa summary metrics final

**Expected Result:**

- ✅ Setelah calculation pertama:
  - Total CO₂e = X
  - Scope 1 Total = X
  - Scope 2 Total = 0
  - Scope 3 Total = 0
- ✅ Setelah calculation kedua:
  - Total CO₂e = X + Y
  - Scope 1 Total = X
  - Scope 2 Total = Y
  - Scope 3 Total = 0
- ✅ Setelah calculation ketiga:
  - Total CO₂e = X + Y + Z
  - Scope 1 Total = X
  - Scope 2 Total = Y
  - Scope 3 Total = Z
- ✅ Semua calculations muncul di table
- ✅ Summary selalu akurat dan real-time

---

## Project Summary

### TC-DEFRA-020: View Project Summary Metrics

**Description:** User melihat summary metrics di project detail page

**Preconditions:**

- Project sudah dibuat
- Project memiliki minimal 1 calculation
- User berada di project detail page

**Test Steps:**

1. Periksa semua metrics cards di bagian atas
2. Periksa nilai-nilai yang ditampilkan

**Expected Result:**

- ✅ Menampilkan 4 metrics cards:
  - Total CO₂ Equivalent (dengan icon Leaf)
  - Calculations (dengan icon BarChart3)
  - Scope 1 (dengan icon PieChart)
  - Scope 2 (dengan icon Database)
- ✅ Scope 3 card muncul jika scope3Total > 0
- ✅ Format angka menggunakan formatNumber
- ✅ Unit ditampilkan dengan jelas (kg CO₂e)
- ✅ Description di bawah setiap metric jelas
- ✅ Nilai-nilai sesuai dengan summary di database
- ✅ Jika belum ada calculations:
  - Total CO₂e = 0
  - Calculations = 0
  - Scope 1/2/3 = 0

---

### TC-DEFRA-021: Summary Auto-Update After Calculation

**Description:** Summary otomatis terupdate setelah create/delete calculation

**Preconditions:**

- Project sudah dibuat
- Project memiliki 2 calculations dengan total CO₂e = 100 kg

**Test Steps:**

1. Periksa Total CO₂e di metrics card (harus 100 kg)
2. Buat calculation baru dengan CO₂e = 50 kg
3. Periksa Total CO₂e lagi (harus 150 kg)
4. Hapus calculation pertama (CO₂e = 30 kg)
5. Periksa Total CO₂e lagi (harus 120 kg)

**Expected Result:**

- ✅ Summary terupdate secara real-time setelah create
- ✅ Summary terupdate secara real-time setelah delete
- ✅ Tidak perlu refresh page
- ✅ Nilai-nilai akurat sesuai perhitungan
- ✅ Scope breakdown juga terupdate dengan benar

---

### TC-DEFRA-022: Summary Category Breakdown

**Description:** User melihat breakdown summary berdasarkan kategori (fuels, business travel, material use, waste)

**Preconditions:**

- Project sudah dibuat
- Project memiliki calculations dengan berbagai kategori

**Test Steps:**

1. Buat calculations dengan kategori berbeda:
   - Fuels: Natural gas, Petrol
   - Business travel: Car journey, Flight
   - Material use: Paper, Plastic
   - Waste: Landfill, Recycling
2. Periksa summary di database atau API response

**Expected Result:**

- ✅ Summary memiliki breakdown per kategori:
  - fuelsTotal
  - businessTravelTotal
  - materialUseTotal
  - wasteTotal
- ✅ Kategori dihitung berdasarkan category field di calculation
- ✅ Total CO₂e = sum dari semua calculations
- ✅ Breakdown akurat sesuai kategori

---

## Error Scenarios

### TC-DEFRA-023: Access Denied - Different Tenant

**Description:** User mencoba akses project dari tenant yang berbeda

**Preconditions:**

- User A memiliki project di Tenant A
- User B login dengan Tenant B

**Test Steps:**

1. User B mencoba akses project ID milik Tenant A
2. Coba get project detail atau create calculation

**Expected Result:**

- ❌ Error muncul dengan pesan "Access denied to this project" atau "Access denied to this tenant"
- ❌ Data tidak bisa diakses atau diubah
- ❌ Error code adalah FORBIDDEN

---

### TC-DEFRA-024: Invalid Project ID

**Description:** User mencoba akses project dengan ID yang tidak valid

**Preconditions:**

- User sudah login

**Test Steps:**

1. Akses URL dengan project ID yang tidak ada di database
2. Contoh: `/apps/carbon-emission/defra/projects/00000000-0000-0000-0000-000000000000`

**Expected Result:**

- ❌ Error muncul dengan pesan "DEFRA project not found"
- ❌ Halaman menampilkan Empty state dengan pesan "Project Not Found"
- ❌ Error code adalah NOT_FOUND

---

### TC-DEFRA-025: Create Calculation - Project Not Found

**Description:** User mencoba create calculation untuk project yang tidak ada

**Preconditions:**

- User sudah login
- Project ID yang digunakan tidak valid

**Test Steps:**

1. Coba create calculation dengan projectId yang tidak ada
2. Submit form

**Expected Result:**

- ❌ Error muncul dengan pesan "DEFRA project not found"
- ❌ Calculation tidak dibuat
- ❌ Error code adalah NOT_FOUND

---

### TC-DEFRA-026: Create Calculation - No Emission Factors Found

**Description:** User mencoba create calculation untuk DEFRA year yang tidak punya emission factors

**Preconditions:**

- Project dibuat dengan DEFRA Year "2099" (tahun yang tidak ada factors)
- Database tidak memiliki emission factors untuk tahun 2099

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan data valid
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ❌ Error muncul dengan pesan "No emission factors found for year 2099"
- ❌ Calculation tidak dibuat
- ❌ Error message jelas dan informatif
- ❌ User tahu bahwa perlu menggunakan DEFRA year yang valid

---

### TC-DEFRA-027: Create Calculation - AI Selection Failed

**Description:** AI gagal memilih emission factor yang sesuai

**Preconditions:**

- Project sudah dibuat
- Activity name sangat tidak jelas atau tidak ada factor yang match

**Test Steps:**

1. Klik tombol "Add Calculation"
2. Isi form dengan:
   - Activity Name: "Random activity that doesn't exist"
   - Quantity: "100"
   - Unit: "unknown_unit"
3. Klik tombol "Calculate & Save"

**Expected Result:**

- ❌ Error muncul dengan pesan yang menjelaskan bahwa AI tidak bisa menemukan factor yang sesuai
- ❌ Atau error dari AI calculator muncul
- ❌ Calculation tidak dibuat
- ❌ User disarankan untuk memberikan activity name yang lebih spesifik atau category yang jelas

---

### TC-DEFRA-028: Network Error During Calculation

**Description:** Terjadi network error saat melakukan calculation

**Preconditions:**

- Semua data sudah lengkap
- Network connection terputus

**Test Steps:**

1. Putuskan network connection
2. Klik tombol "Calculate & Save"

**Expected Result:**

- ❌ Error muncul dengan pesan error dari network
- ❌ Calculation tidak dilakukan
- ❌ User bisa retry setelah network kembali
- ❌ Error message informatif

---

### TC-DEFRA-029: Invalid Input Format - Quantity

**Description:** User memasukkan quantity dengan format yang tidak valid

**Preconditions:**

- User berada di calculation form

**Test Steps:**

1. Masukkan text di field quantity:
   - Quantity: "abc" atau "12.34.56" atau "12,34"
2. Klik tombol "Calculate & Save"

**Expected Result:**

- ❌ Validation error muncul "Quantity must be a positive number"
- ❌ Atau form tidak bisa di-submit jika quantity bukan angka valid
- ❌ Calculation tidak dibuat
- ❌ Error message jelas

---

## Integration Flow

### TC-DEFRA-030: Complete Flow - End to End

**Description:** Test complete flow dari create project sampai dapat calculation results

**Preconditions:**

- User sudah login
- User memiliki akses ke tenant
- Database memiliki emission factors untuk DEFRA Year 2024

**Test Steps:**

1. **Create Project:**

   - Buat project baru dengan:
     - Name: "Complete Flow Test Project"
     - Description: "End to end test"
     - Organization Name: "Test Company"
     - Reporting Period Start: "2024-01-01"
     - Reporting Period End: "2024-12-31"
     - DEFRA Year: "2024"
     - Status: "draft"

2. **Verify Project Created:**

   - Project muncul di list
   - Status adalah "draft"
   - Summary metrics menunjukkan 0 calculations

3. **Create First Calculation:**

   - Activity Name: "Natural gas - consumption"
   - Quantity: "1000"
   - Unit: "kWh"
   - Category: "Fuels"
   - Description: "Office heating"
   - Location: "Jakarta Office"

4. **Verify First Calculation:**

   - Calculation muncul di table
   - Total CO₂e di metrics card > 0
   - Scope 1 Total > 0 (karena natural gas biasanya Scope 1)
   - Calculations count = 1

5. **Create Second Calculation:**

   - Activity Name: "Electricity - grid"
   - Quantity: "500"
   - Unit: "kWh"
   - Category: "Fuels"
   - Description: "Office electricity"

6. **Verify Second Calculation:**

   - Calculation muncul di table
   - Total CO₂e = sum dari kedua calculations
   - Scope 2 Total > 0 (karena electricity biasanya Scope 2)
   - Calculations count = 2

7. **View Calculation Details:**

   - Klik view icon pada calculation pertama
   - Verify semua detail ditampilkan dengan benar

8. **Delete Calculation:**
   - Hapus calculation kedua
   - Verify summary terupdate
   - Total CO₂e berkurang

**Expected Result:**

- ✅ Semua step berhasil dilakukan tanpa error
- ✅ Project berhasil dibuat
- ✅ Calculations berhasil dibuat dengan AI
- ✅ Summary metrics selalu akurat
- ✅ Calculations table menampilkan semua data dengan benar
- ✅ Detail dialog menampilkan informasi lengkap
- ✅ Delete berfungsi dengan baik
- ✅ Semua data tersimpan di database dengan benar
- ✅ Summary terupdate secara real-time

---

### TC-DEFRA-031: Multiple Projects - Different Summaries

**Description:** User membuat multiple projects dan verify setiap project memiliki summary sendiri

**Preconditions:**

- User sudah login

**Test Steps:**

1. Buat Project A dengan 2 calculations (Total CO₂e = 100 kg)
2. Buat Project B dengan 3 calculations (Total CO₂e = 200 kg)
3. Buat Project C dengan 1 calculation (Total CO₂e = 50 kg)
4. Navigate ke setiap project detail page
5. Verify summary masing-masing project

**Expected Result:**

- ✅ Setiap project memiliki summary sendiri
- ✅ Project A: Total CO₂e = 100 kg, Calculations = 2
- ✅ Project B: Total CO₂e = 200 kg, Calculations = 3
- ✅ Project C: Total CO₂e = 50 kg, Calculations = 1
- ✅ Summary tidak tercampur antar project
- ✅ Calculations di setiap project hanya untuk project tersebut

---

### TC-DEFRA-032: Dashboard Overview

**Description:** User melihat dashboard overview untuk semua DEFRA projects

**Preconditions:**

- User memiliki minimal 3 projects dengan berbagai status
- Beberapa projects memiliki calculations

**Test Steps:**

1. Navigate ke `/apps/carbon-emission/defra/dashboard`
2. Periksa Overview tab
3. Periksa Projects tab
4. Periksa Trends tab

**Expected Result:**

- ✅ Overview tab menampilkan:
  - Total Projects count
  - Active Projects count
  - Completed Projects count
  - Recent Projects list (max 5)
- ✅ Projects tab menampilkan semua projects dalam card layout
- ✅ Trends tab menampilkan chart berdasarkan DEFRA Year
- ✅ Data akurat sesuai dengan projects yang ada
- ✅ Tabs navigation berfungsi dengan baik

---

### TC-DEFRA-033: Search and Filter Projects

**Description:** User mencari dan filter projects di projects list page

**Preconditions:**

- User memiliki minimal 5 projects dengan nama berbeda

**Test Steps:**

1. Navigate ke projects list page
2. Ketik keyword di search input
3. Verify hasil filter
4. Clear search
5. Verify semua projects muncul lagi

**Expected Result:**

- ✅ Search bekerja real-time saat mengetik
- ✅ Search mencari di: name, organizationName, defraYear
- ✅ Case-insensitive search
- ✅ Filtered results update secara real-time
- ✅ Jika tidak ada hasil, menampilkan "Belum ada proyek DEFRA yang tersedia"
- ✅ Clear search menampilkan semua projects lagi

---

## Test Data Examples

### Sample DEFRA Project Data

```json
{
  "name": "Q1 2024 Carbon Audit",
  "description": "Carbon footprint audit for Q1 2024",
  "organizationName": "PT. Green Energy",
  "reportingPeriodStart": "2024-01-01",
  "reportingPeriodEnd": "2024-03-31",
  "defraYear": "2024",
  "status": "draft"
}
```

### Sample Calculation Data

```json
{
  "activityName": "Petrol car - medium (up to 1.4L)",
  "quantity": 100,
  "unit": "km",
  "category": "Business travel",
  "activityDate": "2024-02-15",
  "description": "Business trip from Jakarta to Bandung",
  "location": "Jakarta-Bandung"
}
```

### Sample Calculation Result

```json
{
  "co2Emissions": 23.2,
  "ch4Emissions": 0.001,
  "n2oEmissions": 0.0005,
  "totalCo2e": 23.2265,
  "category": "Business travel",
  "scope": "Scope 3"
}
```

### Sample Project Summary

```json
{
  "scope1Total": 150.5,
  "scope2Total": 200.3,
  "scope3Total": 50.2,
  "fuelsTotal": 120.0,
  "businessTravelTotal": 80.5,
  "materialUseTotal": 100.0,
  "wasteTotal": 100.5,
  "totalCo2e": 401.0
}
```

---

## Notes

- Semua test scenarios di atas harus dijalankan dengan user yang memiliki akses ke tenant yang sesuai
- Pastikan database dalam kondisi clean sebelum menjalankan test scenarios
- **IMPORTANT: Sebelum menjalankan test scenarios untuk calculation, pastikan:**
  - **Emission factors sudah di-seed ke database** dengan menjalankan:
    ```bash
    npx tsx src/scripts/seed-defra-emission-factors.ts
    ```
  - Script ini akan mengisi emission factors untuk tahun 2024 dengan berbagai kategori:
    - Business travel (Road - Cars: Petrol/Diesel, berbagai ukuran)
    - Fuels (Gaseous: Natural gas, LPG; Electricity: UK Grid; Liquid: Petrol, Diesel)
    - Material use (Paper, Plastic PET, Aluminium, Steel)
    - Waste (Landfill, Recycling, Incineration)
  - API key Gemini AI sudah dikonfigurasi dengan benar
  - Network connection stabil untuk AI calls
- Test scenarios ini bisa digunakan untuk manual testing atau sebagai referensi untuk automated testing
- Update test scenarios ini jika ada perubahan pada flow atau requirements
- Pastikan semua calculations menggunakan unit yang sesuai dengan emission factors di database
- AI selection mungkin berbeda setiap kali, jadi pastikan factor yang dipilih masuk akal untuk aktivitas yang diberikan
- Jika ingin menambahkan emission factors untuk tahun lain, update script `seed-defra-emission-factors.ts` atau buat script baru

---

**Last Updated:** 2024-12-19
**Version:** 1.0

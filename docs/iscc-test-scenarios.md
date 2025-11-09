# ISCC Test Scenarios

Dokumen ini berisi test scenarios untuk flow ISCC (International Sustainability and Carbon Certification) dari mulai create project sampai calculate emission.

## Table of Contents
1. [Project Management](#project-management)
2. [Cultivation Data (EEC)](#cultivation-data-eec)
3. [Processing Data (EP)](#processing-data-ep)
4. [Transport Data (ETD)](#transport-data-etd)
5. [Calculation Flow](#calculation-flow)
6. [Error Scenarios](#error-scenarios)
7. [Integration Flow](#integration-flow)

---

## Project Management

### TC-ISCC-001: Create New ISCC Project
**Description:** User membuat project ISCC baru dengan data lengkap

**Preconditions:**
- User sudah login dan memiliki akses ke tenant
- User berada di halaman `/apps/carbon-emission/iscc-ai/projects`

**Test Steps:**
1. Klik tombol "Add Project" atau "Create New Project"
2. Isi form dengan data berikut:
   - Name: "Biodiesel Project Palm Oil 2024"
   - Description: "Project untuk produksi biodiesel dari palm oil"
   - Product Type: "Biodiesel"
   - Feedstock Type: "Palm Oil"
   - Production Volume: "10000"
   - LHV: "37.5"
   - LHV Unit: "MJ/kg"
3. Klik tombol "Save" atau "Create"

**Expected Result:**
- ✅ Project berhasil dibuat
- ✅ Dialog success muncul dengan pesan "Project berhasil dibuat"
- ✅ Project muncul di list projects
- ✅ Status project adalah "draft"
- ✅ User bisa klik project untuk masuk ke detail page

---

### TC-ISCC-002: Create ISCC Project with Minimal Data
**Description:** User membuat project dengan data minimal (hanya required fields)

**Preconditions:**
- User sudah login dan memiliki akses ke tenant

**Test Steps:**
1. Klik tombol "Add Project"
2. Isi hanya required fields:
   - Name: "Test Project"
   - Product Type: "Bioethanol"
   - Feedstock Type: "Corn"
   - LHV: "26.8"
3. Klik tombol "Save"

**Expected Result:**
- ✅ Project berhasil dibuat
- ✅ Description, Production Volume bisa null
- ✅ LHV Unit default ke "MJ/kg"
- ✅ Status project adalah "draft"

---

### TC-ISCC-003: Create ISCC Project - Validation Error
**Description:** User mencoba create project tanpa required fields

**Preconditions:**
- User sudah login

**Test Steps:**
1. Klik tombol "Add Project"
2. Biarkan form kosong atau hanya isi sebagian:
   - Name: (kosong)
   - Product Type: "Biodiesel"
   - Feedstock Type: (kosong)
   - LHV: (kosong)
3. Klik tombol "Save"

**Expected Result:**
- ❌ Form tidak bisa di-submit
- ❌ Error message muncul untuk field yang required
- ❌ Project tidak dibuat

---

### TC-ISCC-004: Update Project Information
**Description:** User mengupdate informasi project yang sudah ada

**Preconditions:**
- Project sudah dibuat
- User berada di project detail page, tab "Project Info"

**Test Steps:**
1. Ubah Production Volume dari "10000" menjadi "15000"
2. Ubah Description menjadi "Updated description"
3. Klik tombol "Save Changes"

**Expected Result:**
- ✅ Project berhasil diupdate
- ✅ Dialog success muncul dengan pesan "Project information updated successfully"
- ✅ Data yang diubah tersimpan dengan benar
- ✅ Updated At timestamp berubah

---

## Cultivation Data (EEC)

### TC-ISCC-005: Create Cultivation Data
**Description:** User mengisi data cultivation untuk project yang belum punya cultivation data

**Preconditions:**
- Project sudah dibuat
- Project belum memiliki cultivation data
- User berada di tab "Cultivation (EEC)"

**Test Steps:**
1. Isi form cultivation dengan data berikut:
   - Land Area: "500"
   - Yield: "4.5"
   - Nitrogen Fertilizer: "150"
   - Phosphate Fertilizer: "80"
   - Potassium Fertilizer: "100"
   - Organic Fertilizer: "200"
   - Diesel Consumption: "50"
   - Electricity Use: "200"
   - Pesticides: "5"
2. Klik tombol "Save Data"

**Expected Result:**
- ✅ Cultivation data berhasil disimpan
- ✅ Dialog success muncul dengan pesan "Cultivation data saved successfully"
- ✅ Data tersimpan di database
- ✅ Tombol berubah menjadi "Update Data"

---

### TC-ISCC-006: Update Cultivation Data
**Description:** User mengupdate cultivation data yang sudah ada

**Preconditions:**
- Project sudah memiliki cultivation data
- User berada di tab "Cultivation (EEC)"

**Test Steps:**
1. Ubah Nitrogen Fertilizer dari "150" menjadi "180"
2. Ubah Yield dari "4.5" menjadi "5.0"
3. Klik tombol "Update Data"

**Expected Result:**
- ✅ Cultivation data berhasil diupdate
- ✅ Dialog success muncul dengan pesan "Cultivation data updated successfully"
- ✅ Data yang diubah tersimpan dengan benar
- ✅ Updated At timestamp berubah

---

### TC-ISCC-007: Create Cultivation Data - Optional Fields Empty
**Description:** User membuat cultivation data dengan beberapa field optional dikosongkan

**Preconditions:**
- Project sudah dibuat
- Project belum memiliki cultivation data

**Test Steps:**
1. Isi hanya beberapa field:
   - Land Area: "500"
   - Yield: "4.5"
   - Nitrogen Fertilizer: "150"
   - Field lainnya dikosongkan
2. Klik tombol "Save Data"

**Expected Result:**
- ✅ Cultivation data berhasil disimpan
- ✅ Field yang dikosongkan tersimpan sebagai null
- ✅ Tidak ada error

---

### TC-ISCC-008: Create Cultivation Data - Duplicate Prevention
**Description:** User mencoba create cultivation data untuk project yang sudah punya cultivation data

**Preconditions:**
- Project sudah memiliki cultivation data

**Test Steps:**
1. Coba create cultivation data baru dengan data apapun
2. Klik tombol "Save Data"

**Expected Result:**
- ❌ Error muncul dengan pesan "Cultivation data already exists for this project. Use update instead."
- ❌ Data tidak dibuat duplicate

---

## Processing Data (EP)

### TC-ISCC-009: Create Processing Data
**Description:** User mengisi data processing untuk project

**Preconditions:**
- Project sudah dibuat
- Project belum memiliki processing data
- User berada di tab "Processing (EP)"

**Test Steps:**
1. Isi form processing dengan data berikut:
   - Electricity Use: "50000"
   - Steam Use: "200"
   - Natural Gas Use: "1000"
   - Diesel Use: "500"
   - Methanol: "100"
   - Catalyst: "50"
   - Acid: "30"
   - Water Consumption: "5000"
2. Klik tombol "Save Data"

**Expected Result:**
- ✅ Processing data berhasil disimpan
- ✅ Dialog success muncul dengan pesan "Processing data saved successfully"
- ✅ Data tersimpan di database
- ✅ Tombol berubah menjadi "Update Data"

---

### TC-ISCC-010: Update Processing Data
**Description:** User mengupdate processing data yang sudah ada

**Preconditions:**
- Project sudah memiliki processing data
- User berada di tab "Processing (EP)"

**Test Steps:**
1. Ubah Electricity Use dari "50000" menjadi "55000"
2. Ubah Methanol dari "100" menjadi "120"
3. Klik tombol "Update Data"

**Expected Result:**
- ✅ Processing data berhasil diupdate
- ✅ Dialog success muncul dengan pesan "Processing data updated successfully"
- ✅ Data yang diubah tersimpan dengan benar

---

### TC-ISCC-011: Create Processing Data - Partial Data
**Description:** User membuat processing data dengan hanya mengisi beberapa field

**Preconditions:**
- Project sudah dibuat
- Project belum memiliki processing data

**Test Steps:**
1. Isi hanya:
   - Electricity Use: "50000"
   - Steam Use: "200"
   - Field lainnya dikosongkan
2. Klik tombol "Save Data"

**Expected Result:**
- ✅ Processing data berhasil disimpan
- ✅ Field yang dikosongkan tersimpan sebagai null
- ✅ Tidak ada error

---

## Transport Data (ETD)

### TC-ISCC-012: Create Transport Data
**Description:** User mengisi data transport untuk project

**Preconditions:**
- Project sudah dibuat
- Project belum memiliki transport data
- User berada di tab "Transport (ETD)"

**Test Steps:**
1. Isi form transport dengan data berikut:
   - Feedstock Distance: "100"
   - Feedstock Mode: "Truck"
   - Feedstock Weight: "1000"
   - Product Distance: "200"
   - Product Mode: "Ship"
   - Product Weight: "800"
2. Klik tombol "Save Data"

**Expected Result:**
- ✅ Transport data berhasil disimpan
- ✅ Dialog success muncul dengan pesan "Transport data saved successfully"
- ✅ Data tersimpan di database
- ✅ Tombol berubah menjadi "Update Data"

---

### TC-ISCC-013: Update Transport Data
**Description:** User mengupdate transport data yang sudah ada

**Preconditions:**
- Project sudah memiliki transport data
- User berada di tab "Transport (ETD)"

**Test Steps:**
1. Ubah Feedstock Distance dari "100" menjadi "150"
2. Ubah Product Mode dari "Ship" menjadi "Rail"
3. Klik tombol "Update Data"

**Expected Result:**
- ✅ Transport data berhasil diupdate
- ✅ Dialog success muncul dengan pesan "Transport data updated successfully"
- ✅ Data yang diubah tersimpan dengan benar

---

### TC-ISCC-014: Create Transport Data - Different Transport Modes
**Description:** User membuat transport data dengan berbagai kombinasi transport mode

**Preconditions:**
- Project sudah dibuat
- Project belum memiliki transport data

**Test Steps:**
1. Test dengan kombinasi berikut:
   - Feedstock Mode: "Truck", Product Mode: "Ship"
   - Feedstock Mode: "Rail", Product Mode: "Pipeline"
   - Feedstock Mode: "Ship", Product Mode: "Truck"
2. Untuk setiap kombinasi, isi distance dan weight
3. Klik tombol "Save Data"

**Expected Result:**
- ✅ Semua kombinasi transport mode bisa disimpan
- ✅ Data tersimpan dengan benar sesuai pilihan mode

---

## Calculation Flow

### TC-ISCC-015: Calculate Emissions - Complete Data
**Description:** User melakukan calculate emissions dengan semua data lengkap

**Preconditions:**
- Project sudah dibuat dengan LHV terisi
- Cultivation data sudah ada
- Processing data sudah ada
- Transport data sudah ada
- User berada di tab "Calculations"

**Test Steps:**
1. Pastikan semua data sudah terisi (cek warning message tidak muncul)
2. Klik tombol "Calculate Emissions"
3. Tunggu proses calculation selesai

**Expected Result:**
- ✅ Calculation berhasil dilakukan
- ✅ Dialog success muncul dengan pesan "Calculation completed successfully"
- ✅ Calculation result muncul di list calculations
- ✅ Menampilkan:
   - EEC (g CO₂eq/MJ)
   - EP (g CO₂eq/MJ)
   - ETD (g CO₂eq/MJ)
   - Total Emissions (g CO₂eq/MJ)
   - GHG Savings (%)
   - Fossil Fuel Baseline (g CO₂eq/MJ)
- ✅ Status calculation adalah "calculated"
- ✅ Project status berubah menjadi "calculated"
- ✅ Calculated At timestamp terisi

---

### TC-ISCC-016: Calculate Emissions - Missing LHV
**Description:** User mencoba calculate emissions tanpa LHV di project

**Preconditions:**
- Project dibuat tanpa LHV atau LHV dihapus
- Cultivation, Processing, Transport data sudah ada

**Test Steps:**
1. Pastikan project tidak punya LHV
2. Klik tombol "Calculate Emissions"

**Expected Result:**
- ❌ Error muncul dengan pesan "LHV (Lower Heating Value) is required for calculation"
- ❌ Calculation tidak dilakukan
- ❌ Warning message muncul di UI bahwa LHV belum diisi

---

### TC-ISCC-017: Calculate Emissions - Missing Cultivation Data
**Description:** User mencoba calculate emissions tanpa cultivation data

**Preconditions:**
- Project sudah dibuat dengan LHV
- Cultivation data belum ada
- Processing dan Transport data sudah ada

**Test Steps:**
1. Pastikan cultivation data belum ada
2. Klik tombol "Calculate Emissions"

**Expected Result:**
- ❌ Error muncul dengan pesan "Cultivation data is required for calculation"
- ❌ Calculation tidak dilakukan
- ❌ Warning message muncul di UI bahwa Cultivation Data belum diisi

---

### TC-ISCC-018: Calculate Emissions - Missing Processing Data
**Description:** User mencoba calculate emissions tanpa processing data

**Preconditions:**
- Project sudah dibuat dengan LHV
- Processing data belum ada
- Cultivation dan Transport data sudah ada

**Test Steps:**
1. Pastikan processing data belum ada
2. Klik tombol "Calculate Emissions"

**Expected Result:**
- ❌ Error muncul dengan pesan "Processing data is required for calculation"
- ❌ Calculation tidak dilakukan
- ❌ Warning message muncul di UI bahwa Processing Data belum diisi

---

### TC-ISCC-019: Calculate Emissions - Missing Transport Data
**Description:** User mencoba calculate emissions tanpa transport data

**Preconditions:**
- Project sudah dibuat dengan LHV
- Transport data belum ada
- Cultivation dan Processing data sudah ada

**Test Steps:**
1. Pastikan transport data belum ada
2. Klik tombol "Calculate Emissions"

**Expected Result:**
- ❌ Error muncul dengan pesan "Transport data is required for calculation"
- ❌ Calculation tidak dilakukan
- ❌ Warning message muncul di UI bahwa Transport Data belum diisi

---

### TC-ISCC-020: View Calculation Results
**Description:** User melihat hasil calculation yang sudah dilakukan

**Preconditions:**
- Project sudah memiliki minimal 1 calculation result
- User berada di tab "Calculations"

**Test Steps:**
1. Scroll ke calculation result yang ingin dilihat
2. Periksa semua informasi yang ditampilkan

**Expected Result:**
- ✅ Calculation result ditampilkan dalam card
- ✅ Menampilkan:
   - Calculated at timestamp
   - Status badge (calculated/verified/approved)
   - EEC, EP, ETD dalam format g CO₂eq/MJ
   - EL dan ECCR (jika ada)
   - Total Emissions dalam format besar dan jelas
   - GHG Savings dengan icon trending
   - Fossil Fuel Baseline
   - Notes (jika ada)
- ✅ Format angka sesuai (4 decimal untuk emissions, 2 decimal untuk percentage)
- ✅ Unit ditampilkan dengan jelas

---

### TC-ISCC-021: Multiple Calculations
**Description:** User melakukan multiple calculations untuk project yang sama

**Preconditions:**
- Project sudah memiliki 1 calculation result
- Data cultivation/processing/transport diupdate setelah calculation pertama

**Test Steps:**
1. Update cultivation data (misal: ubah nitrogen fertilizer)
2. Klik tombol "Calculate Emissions" lagi
3. Tunggu calculation selesai

**Expected Result:**
- ✅ Calculation baru berhasil dibuat
- ✅ Calculation baru muncul di list (di atas calculation lama)
- ✅ Hasil calculation berbeda dari calculation sebelumnya
- ✅ Semua calculation history tersimpan
- ✅ User bisa melihat perbandingan antara calculations

---

## Error Scenarios

### TC-ISCC-022: Access Denied - Different Tenant
**Description:** User mencoba akses project dari tenant yang berbeda

**Preconditions:**
- User A memiliki project di Tenant A
- User B login dengan Tenant B

**Test Steps:**
1. User B mencoba akses project ID milik Tenant A
2. Coba get project detail atau update data

**Expected Result:**
- ❌ Error muncul dengan pesan "Access denied to this project" atau "Access denied to this tenant"
- ❌ Data tidak bisa diakses atau diubah

---

### TC-ISCC-023: Invalid Project ID
**Description:** User mencoba akses project dengan ID yang tidak valid

**Preconditions:**
- User sudah login

**Test Steps:**
1. Akses URL dengan project ID yang tidak ada di database
2. Contoh: `/apps/carbon-emission/iscc-ai/projects/00000000-0000-0000-0000-000000000000`

**Expected Result:**
- ❌ Error muncul dengan pesan "ISCC project not found"
- ❌ Halaman menampilkan pesan "Project not found"

---

### TC-ISCC-024: Invalid Input Format
**Description:** User memasukkan data dengan format yang tidak valid

**Preconditions:**
- User berada di form cultivation/processing/transport

**Test Steps:**
1. Masukkan text di field yang seharusnya number:
   - Land Area: "abc"
   - Electricity Use: "xyz"
   - Feedstock Distance: "test"
2. Klik tombol save

**Expected Result:**
- ✅ Form tetap bisa di-submit (karena menggunakan string)
- ✅ Data tersimpan sebagai string
- ⚠️ Warning: Sebaiknya ada validation untuk memastikan input adalah angka

---

### TC-ISCC-025: Network Error During Calculation
**Description:** Terjadi network error saat melakukan calculation

**Preconditions:**
- Semua data sudah lengkap
- Network connection terputus

**Test Steps:**
1. Putuskan network connection
2. Klik tombol "Calculate Emissions"

**Expected Result:**
- ❌ Error muncul dengan pesan error dari network
- ❌ Calculation tidak dilakukan
- ❌ User bisa retry setelah network kembali

---

## Integration Flow

### TC-ISCC-026: Complete Flow - End to End
**Description:** Test complete flow dari create project sampai dapat calculation result

**Preconditions:**
- User sudah login
- User memiliki akses ke tenant

**Test Steps:**
1. **Create Project:**
   - Buat project baru dengan:
     - Name: "Complete Flow Test Project"
     - Product Type: "Biodiesel"
     - Feedstock Type: "Palm Oil"
     - Production Volume: "10000"
     - LHV: "37.5"
     - LHV Unit: "MJ/kg"

2. **Fill Cultivation Data:**
   - Land Area: "500"
   - Yield: "4.5"
   - Nitrogen Fertilizer: "150"
   - Phosphate Fertilizer: "80"
   - Potassium Fertilizer: "100"
   - Organic Fertilizer: "200"
   - Diesel Consumption: "50"
   - Electricity Use: "200"
   - Pesticides: "5"

3. **Fill Processing Data:**
   - Electricity Use: "50000"
   - Steam Use: "200"
   - Natural Gas Use: "1000"
   - Diesel Use: "500"
   - Methanol: "100"
   - Catalyst: "50"
   - Acid: "30"
   - Water Consumption: "5000"

4. **Fill Transport Data:**
   - Feedstock Distance: "100"
   - Feedstock Mode: "Truck"
   - Feedstock Weight: "1000"
   - Product Distance: "200"
   - Product Mode: "Ship"
   - Product Weight: "800"

5. **Calculate Emissions:**
   - Klik tombol "Calculate Emissions"
   - Tunggu proses selesai

6. **Verify Results:**
   - Periksa calculation result
   - Pastikan semua nilai terisi dan masuk akal

**Expected Result:**
- ✅ Semua step berhasil dilakukan tanpa error
- ✅ Project berhasil dibuat
- ✅ Semua data (cultivation, processing, transport) berhasil disimpan
- ✅ Calculation berhasil dilakukan
- ✅ Calculation result menampilkan:
   - EEC > 0
   - EP > 0
   - ETD > 0
   - Total Emissions > 0
   - GHG Savings dalam range yang masuk akal (biasanya 0-100%)
- ✅ Semua data tersimpan di database dengan benar
- ✅ User bisa melihat calculation history

---

### TC-ISCC-027: Update Data and Recalculate
**Description:** User mengupdate data setelah calculation dan melakukan recalculate

**Preconditions:**
- Project sudah memiliki calculation result

**Test Steps:**
1. Update cultivation data (ubah nitrogen fertilizer)
2. Klik "Update Data"
3. Klik "Calculate Emissions" untuk recalculate
4. Bandingkan hasil calculation baru dengan yang lama

**Expected Result:**
- ✅ Data berhasil diupdate
- ✅ Calculation baru berhasil dibuat
- ✅ Hasil calculation berbeda dari sebelumnya
- ✅ Calculation lama tetap tersimpan untuk history
- ✅ User bisa melihat perubahan nilai emissions

---

### TC-ISCC-028: Tab Navigation
**Description:** User navigasi antar tabs di project detail page

**Preconditions:**
- Project sudah dibuat
- User berada di project detail page

**Test Steps:**
1. Klik tab "Project Info" → verify data project
2. Klik tab "Cultivation (EEC)" → verify form cultivation
3. Klik tab "Processing (EP)" → verify form processing
4. Klik tab "Transport (ETD)" → verify form transport
5. Klik tab "Calculations" → verify calculation results
6. Klik kembali ke tab sebelumnya

**Expected Result:**
- ✅ Semua tab bisa diklik dan navigasi berjalan lancar
- ✅ URL berubah sesuai tab aktif (?tab=project-info, ?tab=cultivation, dll)
- ✅ Data di setiap tab tetap tersimpan saat pindah tab
- ✅ Form state tidak hilang saat navigasi

---

## Test Data Examples

### Sample Project Data
```json
{
  "name": "Biodiesel Production Plant",
  "description": "Large scale biodiesel production from palm oil",
  "productType": "biodiesel",
  "feedstockType": "palm_oil",
  "productionVolume": "50000",
  "lhv": "37.5",
  "lhvUnit": "MJ/kg"
}
```

### Sample Cultivation Data
```json
{
  "landArea": "1000",
  "yield": "4.5",
  "nitrogenFertilizer": "150",
  "phosphateFertilizer": "80",
  "potassiumFertilizer": "100",
  "organicFertilizer": "200",
  "dieselConsumption": "50",
  "electricityUse": "200",
  "pesticides": "5"
}
```

### Sample Processing Data
```json
{
  "electricityUse": "100000",
  "steamUse": "500",
  "naturalGasUse": "2000",
  "dieselUse": "1000",
  "methanol": "200",
  "catalyst": "100",
  "acid": "50",
  "waterConsumption": "10000"
}
```

### Sample Transport Data
```json
{
  "feedstockDistance": "150",
  "feedstockMode": "truck",
  "feedstockWeight": "2000",
  "productDistance": "300",
  "productMode": "ship",
  "productWeight": "1500"
}
```

---

## Notes

- Semua test scenarios di atas harus dijalankan dengan user yang memiliki akses ke tenant yang sesuai
- Pastikan database dalam kondisi clean sebelum menjalankan test scenarios
- Untuk test calculation, pastikan API key Gemini AI sudah dikonfigurasi dengan benar
- Test scenarios ini bisa digunakan untuk manual testing atau sebagai referensi untuk automated testing
- Update test scenarios ini jika ada perubahan pada flow atau requirements

---

**Last Updated:** 2024-12-19
**Version:** 1.0


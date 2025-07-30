# Database Schema Documentation

## Overview
Dokumentasi ini menjelaskan struktur database aplikasi TIC (Tenant-based Carbon Calculation System) yang menggunakan PostgreSQL dengan Drizzle ORM.

## Database Architecture

Database ini menggunakan arsitektur multi-tenant dengan fokus pada perhitungan emisi karbon untuk pertanian jagung. Setiap tenant dapat memiliki beberapa proyek karbon dengan data perhitungan yang terisolasi.

## Tables Overview

### 1. Authentication Schema (`auth-schema.ts`)

#### `user`
Tabel utama untuk menyimpan data pengguna aplikasi.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | ID unik pengguna |
| `name` | text | NOT NULL | Nama lengkap pengguna |
| `email` | text | NOT NULL, UNIQUE | Email pengguna (login identifier) |
| `email_verified` | boolean | NOT NULL, DEFAULT false | Status verifikasi email |
| `image` | text | NULLABLE | URL avatar/foto profil |
| `created_at` | timestamp | NOT NULL, DEFAULT now() | Waktu pembuatan akun |
| `updated_at` | timestamp | NOT NULL, DEFAULT now() | Waktu update terakhir |

**Purpose**: Menyimpan data dasar pengguna untuk autentikasi dan profil.

#### `session`
Tabel untuk mengelola sesi login pengguna.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | ID unik sesi |
| `expires_at` | timestamp | NOT NULL | Waktu kadaluarsa sesi |
| `token` | text | NOT NULL, UNIQUE | Token sesi |
| `created_at` | timestamp | NOT NULL | Waktu pembuatan sesi |
| `updated_at` | timestamp | NOT NULL | Waktu update terakhir |
| `ip_address` | text | NULLABLE | IP address pengguna |
| `user_agent` | text | NULLABLE | Browser/device info |
| `user_id` | text | NOT NULL, FK → user.id | Referensi ke pengguna |

**Purpose**: Manajemen sesi login dan keamanan akun.

#### `account`
Tabel untuk menyimpan informasi akun OAuth/eksternal.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | ID unik akun |
| `account_id` | text | NOT NULL | ID akun di provider |
| `provider_id` | text | NOT NULL | Nama provider (google, github, etc) |
| `user_id` | text | NOT NULL, FK → user.id | Referensi ke pengguna |
| `access_token` | text | NULLABLE | Access token dari provider |
| `refresh_token` | text | NULLABLE | Refresh token |
| `id_token` | text | NULLABLE | ID token |
| `access_token_expires_at` | timestamp | NULLABLE | Expiry access token |
| `refresh_token_expires_at` | timestamp | NULLABLE | Expiry refresh token |
| `scope` | text | NULLABLE | Scope permissions |
| `password` | text | NULLABLE | Hashed password (jika login lokal) |
| `created_at` | timestamp | NOT NULL | Waktu pembuatan |
| `updated_at` | timestamp | NOT NULL | Waktu update terakhir |

**Purpose**: Menyimpan data autentikasi OAuth dan login lokal.

#### `verification`
Tabel untuk menyimpan token verifikasi (email, reset password).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | ID unik verifikasi |
| `identifier` | text | NOT NULL | Email atau identifier |
| `value` | text | NOT NULL | Token verifikasi |
| `expires_at` | timestamp | NOT NULL | Waktu kadaluarsa |
| `created_at` | timestamp | DEFAULT now() | Waktu pembuatan |
| `updated_at` | timestamp | DEFAULT now() | Waktu update |

**Purpose**: Manajemen token untuk verifikasi email dan reset password.

### 2. Tenant Schema (`tenant-schema.ts`)

#### `tenant`
Tabel untuk menyimpan data organisasi/perusahaan.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | ID unik tenant |
| `name` | text | NOT NULL | Nama organisasi/perusahaan |
| `slug` | text | NOT NULL, UNIQUE | URL-friendly identifier |
| `domain` | text | UNIQUE, NULLABLE | Domain khusus tenant |
| `logo` | text | NULLABLE | URL logo organisasi |
| `is_active` | boolean | NOT NULL, DEFAULT true | Status aktif tenant |
| `created_at` | timestamp | NOT NULL, DEFAULT now() | Waktu pembuatan |
| `updated_at` | timestamp | NOT NULL, DEFAULT now() | Waktu update terakhir |

**Purpose**: Multi-tenancy support - setiap organisasi memiliki data terpisah.

#### `tenant_user`
Tabel junction untuk menghubungkan pengguna dengan tenant beserta rolenya.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | ID unik relasi |
| `tenant_id` | uuid | NOT NULL, FK → tenant.id | Referensi ke tenant |
| `user_id` | text | NOT NULL, FK → user.id | Referensi ke pengguna |
| `role` | text | NOT NULL, DEFAULT 'member' | Role: superadmin, admin, member |
| `is_active` | boolean | NOT NULL, DEFAULT true | Status aktif dalam tenant |
| `joined_at` | timestamp | NOT NULL, DEFAULT now() | Waktu bergabung |

**Purpose**: Mengatur akses dan role pengguna dalam setiap tenant.

**Roles Available**:
- `superadmin`: Full access, can manage all aspects
- `admin`: Can manage members and data
- `member`: Read-only or limited access

#### `tenant_invitation`
Tabel untuk mengelola undangan bergabung ke tenant.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | ID unik undangan |
| `tenant_id` | uuid | NOT NULL, FK → tenant.id | Referensi ke tenant |
| `email` | text | NOT NULL | Email yang diundang |
| `role` | text | NOT NULL, DEFAULT 'member' | Role yang akan diberikan |
| `invited_by` | text | NOT NULL, FK → user.id | Pengguna yang mengundang |
| `token` | text | NOT NULL, UNIQUE | Token undangan |
| `expires_at` | timestamp | NOT NULL | Waktu kadaluarsa undangan |
| `accepted_at` | timestamp | NULLABLE | Waktu penerimaan undangan |
| `created_at` | timestamp | NOT NULL, DEFAULT now() | Waktu pembuatan |

**Purpose**: Sistem undangan untuk menambah anggota baru ke tenant.

### 3. Carbon Calculation Schema (`carbon-calculation-schema.ts`)

#### `carbon_project`
Tabel induk untuk proyek perhitungan emisi karbon.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | ID unik proyek |
| `name` | text | NOT NULL | Nama proyek karbon |
| `created_at` | timestamp | NOT NULL, DEFAULT now() | Waktu pembuatan |
| `updated_at` | timestamp | NOT NULL, DEFAULT now() | Waktu update terakhir |

**Purpose**: Mengelompokkan semua data perhitungan dalam satu proyek karbon.

#### `products`
Data produk jagung yang dihasilkan.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | ID unik produk |
| `tenant_id` | uuid | NOT NULL, FK → tenant.id | Tenant pemilik |
| `carbon_project_id` | uuid | NOT NULL, FK → carbon_project.id | Proyek terkait |
| `corn_wet` | decimal(10,2) | NULLABLE | Berat jagung basah (kg) |
| `moisture_content` | decimal(10,2) | NULLABLE | Kandungan air (%) |
| `corn_dry` | decimal(10,2) | NULLABLE | Berat jagung kering (kg) |
| `cultivation_area` | decimal(10,2) | NULLABLE | Luas area budidaya (ha) |
| `created_at` | timestamp | NOT NULL | Waktu pembuatan |
| `updated_at` | timestamp | NOT NULL | Waktu update |

**Purpose**: Data hasil produksi jagung untuk perhitungan emisi per unit produk.

#### `raws`
Data bahan baku untuk budidaya jagung.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | ID unik |
| `tenant_id` | uuid | NOT NULL, FK → tenant.id | Tenant pemilik |
| `carbon_project_id` | uuid | NOT NULL, FK → carbon_project.id | Proyek terkait |
| `corn_seeds_amount` | decimal(10,2) | NULLABLE | Jumlah benih jagung (kg) |
| `emission_factor_corn_seeds` | decimal(10,2) | NULLABLE | Faktor emisi benih |
| `co2eq_emissions_raw_material_input_ha_yr` | decimal(10,2) | NULLABLE | Emisi CO2eq per ha/tahun |
| `co2eq_emissions_raw_material_input_tffb` | decimal(10,2) | NULLABLE | Emisi per ton FFB |
| `created_at` | timestamp | NOT NULL | Waktu pembuatan |
| `updated_at` | timestamp | NOT NULL | Waktu update |

**Purpose**: Perhitungan emisi dari penggunaan bahan baku.

#### `fertilizer_nitrogen`
Data penggunaan pupuk nitrogen dan perhitungan emisinya.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | ID unik |
| `tenant_id` | uuid | NOT NULL, FK → tenant.id | Tenant pemilik |
| `carbon_project_id` | uuid | NOT NULL, FK → carbon_project.id | Proyek terkait |
| `ammonium_nitrate` | decimal(10,2) | NULLABLE | Jumlah amonium nitrat (kg) |
| `urea` | decimal(10,2) | NULLABLE | Jumlah urea (kg) |
| `applied_manure` | decimal(10,2) | NULLABLE | Pupuk kandang (kg) |
| `n_content_crop_residue` | decimal(10,2) | NULLABLE | Kandungan N dalam residu tanaman |
| `total_n_synthetic_fertilizer` | decimal(10,2) | NULLABLE | Total N dari pupuk sintetik |
| `emission_factor_ammonium_nitrate` | decimal(10,2) | NULLABLE | Faktor emisi amonium nitrat |
| `emission_factor_urea` | decimal(10,2) | NULLABLE | Faktor emisi urea |
| `emission_factor_direct_n2o` | decimal(10,2) | NULLABLE | Faktor emisi langsung N2O |
| `fraction_n_volatilized_synthetic` | decimal(10,2) | NULLABLE | Fraksi N yang menguap (sintetik) |
| `fraction_n_volatilized_organic` | decimal(10,2) | NULLABLE | Fraksi N yang menguap (organik) |
| `emission_factor_atmospheric_deposition` | decimal(10,2) | NULLABLE | Faktor emisi deposisi atmosfer |
| `fraction_n_lost_runoff` | decimal(10,2) | NULLABLE | Fraksi N hilang karena runoff |
| `emission_factor_leaching_runoff` | decimal(10,2) | NULLABLE | Faktor emisi leaching/runoff |
| `direct_n2o_emissions` | decimal(10,2) | NULLABLE | Emisi N2O langsung |
| `indirect_n2o_emissions_nh3_nox` | decimal(10,2) | NULLABLE | Emisi N2O tidak langsung (NH3/NOx) |
| `indirect_n2o_emissions_n_leaching_runoff` | decimal(10,2) | NULLABLE | Emisi N2O tidak langsung (leaching) |
| `co2eq_emissions_nitrogen_fertilizers_ha_yr` | decimal(10,2) | NULLABLE | Total emisi pupuk N per ha/tahun |
| `co2eq_emissions_nitrogen_fertilizers_field_n20_ha_yr` | decimal(10,2) | NULLABLE | Emisi N2O lapangan per ha/tahun |
| `co2eq_emissions_nitrogen_fertilizers_field_n20_tffb` | decimal(10,2) | NULLABLE | Emisi N2O per ton FFB |
| `created_at` | timestamp | NOT NULL | Waktu pembuatan |
| `updated_at` | timestamp | NOT NULL | Waktu update |

**Purpose**: Perhitungan komprehensif emisi dari penggunaan pupuk nitrogen.

#### `herbicides`
Data penggunaan herbisida dan pestisida.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | ID unik |
| `tenant_id` | uuid | NOT NULL, FK → tenant.id | Tenant pemilik |
| `carbon_project_id` | uuid | NOT NULL, FK → carbon_project.id | Proyek terkait |
| `acetochlor` | decimal(10,2) | NULLABLE | Jumlah acetochlor (kg) |
| `emission_factor_pesticides` | decimal(10,2) | NULLABLE | Faktor emisi pestisida |
| `co2eq_emissions_herbicides_pesticides_ha_yr` | decimal(10,2) | NULLABLE | Emisi herbisida per ha/tahun |
| `co2eq_emissions_herbicides_pesticides_tffb` | decimal(10,2) | NULLABLE | Emisi herbisida per ton FFB |
| `created_at` | timestamp | NOT NULL | Waktu pembuatan |
| `updated_at` | timestamp | Not NULL | Waktu update |

**Purpose**: Perhitungan emisi dari penggunaan herbisida dan pestisida.

#### `energy_electricity`
Data konsumsi energi listrik.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | ID unik |
| `tenant_id` | uuid | NOT NULL, FK → tenant.id | Tenant pemilik |
| `carbon_project_id` | uuid | NOT NULL, FK → carbon_project.id | Proyek terkait |
| `electricity_consumption_soil_prep` | decimal(10,2) | NULLABLE | Konsumsi listrik untuk persiapan tanah (kWh) |
| `emission_factor_electricity` | decimal(10,2) | NULLABLE | Faktor emisi listrik |
| `co2e_emissions_electricity_yr` | decimal(10,2) | NULLABLE | Emisi CO2e listrik per tahun |
| `co2e_emissions_electricity_tffb` | decimal(10,2) | NULLABLE | Emisi CO2e listrik per ton FFB |
| `created_at` | timestamp | NOT NULL | Waktu pembuatan |
| `updated_at` | timestamp | NOT NULL | Waktu update |

**Purpose**: Perhitungan emisi dari konsumsi energi listrik.

#### `energy_diesel`
Data konsumsi energi diesel.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | ID unik |
| `tenant_id` | uuid | NOT NULL, FK → tenant.id | Tenant pemilik |
| `carbon_project_id` | uuid | NOT NULL, FK → carbon_project.id | Proyek terkait |
| `diesel_consumed` | decimal(10,2) | NULLABLE | Konsumsi diesel (liter) |
| `emission_factor_diesel` | decimal(10,2) | NULLABLE | Faktor emisi diesel |
| `co2e_emissions_diesel_yr` | decimal(10,2) | NULLABLE | Emisi CO2e diesel per tahun |
| `co2e_emissions_diesel_tffb` | decimal(10,2) | NULLABLE | Emisi CO2e diesel per ton FFB |
| `created_at` | timestamp | NOT NULL | Waktu pembuatan |
| `updated_at` | timestamp | NOT NULL | Waktu update |

**Purpose**: Perhitungan emisi dari konsumsi bahan bakar diesel.

#### `cultivation`
Data gabungan emisi dari aktivitas budidaya.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | ID unik |
| `tenant_id` | uuid | Not NULL, FK → tenant.id | Tenant pemilik |
| `carbon_project_id` | uuid | NOT NULL, FK → carbon_project.id | Proyek terkait |
| `ghg_emissions_raw_material_input` | decimal(10,2) | NULLABLE | Emisi GHG dari bahan baku |
| `ghg_emissions_fertilizers` | decimal(10,2) | NULLABLE | Emisi GHG dari pupuk |
| `ghg_emissions_herbicides_pesticides` | decimal(10,2) | NULLABLE | Emisi GHG dari herbisida/pestisida |
| `ghg_emissions_energy` | decimal(10,2) | NULLABLE | Emisi GHG dari energi |
| `total_emissions_corn` | decimal(10,2) | NULLABLE | Total emisi untuk produksi jagung |
| `created_at` | timestamp | NOT NULL | Waktu pembuatan |
| `updated_at` | timestamp | NOT NULL | Waktu update |

**Purpose**: Ringkasan total emisi dari semua aktivitas budidaya.

#### `actual_carbon`
Data kondisi karbon tanah saat ini (aktual).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | ID unik |
| `tenant_id` | uuid | NOT NULL, FK → tenant.id | Tenant pemilik |
| `carbon_project_id` | uuid | NOT NULL, FK → carbon_project.id | Proyek terkait |
| `actual_land_use` | text | NULLABLE | Penggunaan lahan aktual |
| `climate_region_actual` | text | NULLABLE | Wilayah iklim aktual |
| `soil_type_actual` | text | NULLABLE | Jenis tanah aktual |
| `current_soil_management_actual` | text | NULLABLE | Manajemen tanah aktual |
| `current_input_to_soil_actual` | text | NULLABLE | Input ke tanah aktual |
| `socst_actual` | decimal(10,2) | NULLABLE | Stock karbon organik tanah aktual |
| `flu_actual` | decimal(10,2) | NULLABLE | Faktor penggunaan lahan aktual |
| `fmg_actual` | decimal(10,2) | NULLABLE | Faktor manajemen aktual |
| `fi_actual` | decimal(10,2) | NULLABLE | Faktor input aktual |
| `cveg_actual` | decimal(10,2) | NULLABLE | Karbon vegetasi aktual |
| `created_at` | timestamp | NOT NULL | Waktu pembuatan |
| `updated_at` | timestamp | NOT NULL | Waktu update |

**Purpose**: Data kondisi karbon tanah dalam kondisi aktual/saat ini.

#### `reference_carbon`
Data kondisi karbon tanah referensi dan perhitungan LUC (Land Use Change).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | ID unik |
| `tenant_id` | uuid | NOT NULL, FK → tenant.id | Tenant pemilik |
| `carbon_project_id` | uuid | NOT NULL, FK → carbon_project.id | Proyek terkait |
| `reference_land_use` | text | NULLABLE | Penggunaan lahan referensi |
| `climate_region_reference` | text | NULLABLE | Wilayah iklim referensi |
| `soil_type_reference` | text | NULLABLE | Jenis tanah referensi |
| `current_soil_management_reference` | text | NULLABLE | Manajemen tanah referensi |
| `current_input_to_soil_reference` | text | NULLABLE | Input ke tanah referensi |
| `socst_reference` | decimal(10,2) | NULLABLE | Stock karbon organik tanah referensi |
| `flu_reference` | decimal(10,2) | NULLABLE | Faktor penggunaan lahan referensi |
| `fmg_reference` | decimal(10,2) | NULLABLE | Faktor manajemen referensi |
| `fi_reference` | decimal(10,2) | NULLABLE | Faktor input referensi |
| `cveg_reference` | decimal(10,2) | NULLABLE | Karbon vegetasi referensi |
| `soil_organic_carbon_actual` | decimal(10,2) | NULLABLE | Karbon organik tanah aktual |
| `soil_organic_carbon_reference` | decimal(10,2) | NULLABLE | Karbon organik tanah referensi |
| `accumulated_soil_carbon` | decimal(10,2) | NULLABLE | Akumulasi karbon tanah |
| `luc_carbon_emissions_per_kg_corn` | decimal(10,2) | NULLABLE | Emisi LUC per kg jagung |
| `total_luc_co2_emissions_ha_yr` | decimal(10,2) | NULLABLE | Total emisi LUC CO2 per ha/tahun |
| `total_luc_co2_emissions_t_dry_corn` | decimal(10,2) | NULLABLE | Total emisi LUC per ton jagung kering |
| `created_at` | timestamp | NOT NULL | Waktu pembuatan |
| `updated_at` | timestamp | NOT NULL | Waktu update |

**Purpose**: Perhitungan emisi dari perubahan penggunaan lahan (Land Use Change).

## Database Relations

### Relationship Diagram

```
user (1) ←→ (M) tenant_user (M) ←→ (1) tenant
                                       ↓ (1:M)
user (1) ←→ (M) tenant_invitation      carbon_project
                                       ↓ (1:M)
user (1) ←→ (M) session               ┌─products
                                      ├─raws  
user (1) ←→ (M) account               ├─fertilizer_nitrogen
                                      ├─herbicides
user (1) ←→ (M) verification          ├─energy_electricity
                                      ├─energy_diesel
                                      ├─cultivation
                                      ├─actual_carbon
                                      └─reference_carbon
```

### Key Relationships

1. **User-Tenant Relationship**:
   - Many-to-Many melalui `tenant_user`
   - Setiap pengguna bisa menjadi anggota beberapa tenant
   - Setiap tenant bisa memiliki banyak anggota dengan role berbeda

2. **Tenant-Carbon Project Relationship**:
   - One-to-Many: Satu tenant bisa memiliki banyak carbon project
   - Semua data perhitungan emisi terikat pada tenant untuk isolasi data

3. **Carbon Project-Calculation Data**:
   - One-to-Many: Satu carbon project memiliki beberapa tabel data perhitungan
   - Semua tabel perhitungan memiliki `carbon_project_id` dan `tenant_id`

## Data Flow

### 1. User Onboarding
```
1. User signup → user table
2. Create/join tenant → tenant + tenant_user tables  
3. Setup carbon project → carbon_project table
4. Input calculation data → various calculation tables
```

### 2. Multi-tenant Data Isolation
```
Request → Check user → Get user's tenants → Filter data by tenant_id
```

### 3. Carbon Calculation Flow
```
Products Data → Raw Materials → Fertilizers → Herbicides → Energy → 
Cultivation Summary → Land Use Change → Final Carbon Footprint
```

## Indexes and Performance

### Recommended Indexes
```sql
-- Tenant isolation
CREATE INDEX idx_tenant_user_tenant_id ON tenant_user(tenant_id);
CREATE INDEX idx_tenant_user_user_id ON tenant_user(user_id);

-- Carbon calculation queries
CREATE INDEX idx_products_tenant_carbon ON products(tenant_id, carbon_project_id);
CREATE INDEX idx_raws_tenant_carbon ON raws(tenant_id, carbon_project_id);
-- ... similar indexes for other calculation tables

-- Authentication
CREATE INDEX idx_session_user_id ON session(user_id);
CREATE INDEX idx_session_token ON session(token);
```

## Data Types Reference

- `uuid`: PostgreSQL UUID type untuk primary keys
- `text`: Variable-length string
- `decimal(10,2)`: Numeric dengan 10 digit total, 2 decimal places
- `timestamp`: Date and time dengan timezone
- `boolean`: True/false values

## Migration History

Berdasarkan migration files:
- `0000_fair_tana_nile`: Initial auth and tenant schema
- `0001_cold_nighthawk`: Carbon calculation tables
- `0002_busy_the_hood`: Additional calculation fields
- `0003_freezing_lilandra`: Schema refinements
- `0004_light_night_nurse`: Carbon project integration

## Security Considerations

1. **Row Level Security**: Semua tabel memiliki `tenant_id` untuk isolasi data
2. **Role-based Access**: Three-tier role system (superadmin, admin, member)
3. **Session Management**: Proper session expiry dan token management
4. **Cascade Deletes**: Proper cleanup saat tenant atau user dihapus

## Usage Examples

### Creating a New Carbon Project
```sql
-- 1. Create carbon project
INSERT INTO carbon_project (name) VALUES ('Corn Farm 2024');

-- 2. Add product data
INSERT INTO products (tenant_id, carbon_project_id, corn_wet, corn_dry, cultivation_area)
VALUES ('tenant-uuid', 'project-uuid', 1000.00, 850.00, 10.50);

-- 3. Add calculation data to other tables...
```

### Querying Tenant-specific Data
```sql
-- Get all carbon projects for a tenant
SELECT cp.* FROM carbon_project cp
JOIN products p ON cp.id = p.carbon_project_id
WHERE p.tenant_id = 'tenant-uuid';
```

### User Permissions Check
```sql
-- Check if user can access tenant data
SELECT tu.role FROM tenant_user tu
WHERE tu.user_id = 'user-id' 
AND tu.tenant_id = 'tenant-id' 
AND tu.is_active = true;
```

## Best Practices

1. **Always filter by tenant_id** dalam queries untuk data isolation
2. **Use transactions** untuk operasi yang melibatkan multiple tables
3. **Validate permissions** sebelum akses data tenant
4. **Monitor query performance** dengan proper indexing
5. **Regular backup** khususnya untuk data perhitungan karbon yang kompleks
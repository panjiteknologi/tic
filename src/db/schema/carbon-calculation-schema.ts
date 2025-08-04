import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { tenant } from "./tenant-schema";

// Carbon Project
export const carbonProject = pgTable("carbon_project", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Step 1 - GHG Verification
export const stepSatuGhgVerification = pgTable("step_satu_ghg_verification", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  keterangan: text("keterangan").notNull(),
  nilaiInt: integer("nilai_int"),
  nilaiString: text("nilai_string"),
  satuan: text("satuan"),
  source: text("source"),
});

// Step 2 - GHG Calculation
export const stepDuaGhgCalculation = pgTable("step_dua_ghg_calculation", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  keterangan: text("keterangan").notNull(),
  nilaiInt: integer("nilai_int"),
  nilaiString: text("nilai_string"),
  satuan: text("satuan"),
  source: text("source"),
});

// Step 3 - GHG Calculation Process
export const stepTigaGhgCalculationProcess = pgTable(
  "step_tiga_ghg_calculation_process",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    carbonProjectId: uuid("carbon_project_id")
      .notNull()
      .references(() => carbonProject.id, { onDelete: "cascade" }),
    keterangan: text("keterangan").notNull(),
    nilaiInt: integer("nilai_int"),
    nilaiString: text("nilai_string"),
    satuan: text("satuan"),
    source: text("source"),
  }
);

// Step 3 - Additional
export const stepTigaAdditional = pgTable("step_tiga_additional", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  keterangan: text("keterangan").notNull(),
  nilaiInt: integer("nilai_int"),
  nilaiString: text("nilai_string"),
  satuan: text("satuan"),
  source: text("source"),
});

// Step 3 - Other Case
export const stepTigaOtherCase = pgTable("step_tiga_other_case", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  keterangan: text("keterangan").notNull(),
  nilaiInt: integer("nilai_int"),
  nilaiString: text("nilai_string"),
  satuan: text("satuan"),
  source: text("source"),
});

// Step 4 - GHG Audit
export const stepEmpatGhgAudit = pgTable("step_empat_ghg_audit", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  keterangan: text("keterangan").notNull(),
  nilaiInt: integer("nilai_int"),
  nilaiString: text("nilai_string"),
  satuan: text("satuan"),
  source: text("source"),
});

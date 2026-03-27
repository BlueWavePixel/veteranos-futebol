import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  decimal,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("admin_role", [
  "super_admin",
  "moderator",
]);

export const actorTypeEnum = pgEnum("actor_type", [
  "coordinator",
  "moderator",
  "super_admin",
]);

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  coordinatorName: text("coordinator_name").notNull(),
  coordinatorAltName: text("coordinator_alt_name"),
  coordinatorEmail: text("coordinator_email").notNull(),
  coordinatorPhone: text("coordinator_phone"),
  coordinatorAltPhone: text("coordinator_alt_phone"),
  dinnerThirdParty: boolean("dinner_third_party"),
  kitPrimary: text("kit_primary"),
  kitSecondary: text("kit_secondary"),
  fieldName: text("field_name"),
  fieldAddress: text("field_address"),
  location: text("location"),
  mapsUrl: text("maps_url"),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  notes: text("notes"),
  rgpdConsent: boolean("rgpd_consent").notNull().default(false),
  rgpdConsentAt: timestamp("rgpd_consent_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: adminRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const authTokens = pgTable("auth_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorType: actorTypeEnum("actor_type").notNull(),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type Admin = typeof admins.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;

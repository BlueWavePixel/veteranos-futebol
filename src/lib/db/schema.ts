import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  decimal,
  jsonb,
  pgEnum,
  integer,
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
  // Kit details - primary
  kitPrimary: text("kit_primary"),
  kitPrimaryShirt: text("kit_primary_shirt"),
  kitPrimaryShorts: text("kit_primary_shorts"),
  kitPrimarySocks: text("kit_primary_socks"),
  // Kit details - secondary
  kitSecondary: text("kit_secondary"),
  kitSecondaryShirt: text("kit_secondary_shirt"),
  kitSecondaryShorts: text("kit_secondary_shorts"),
  kitSecondarySocks: text("kit_secondary_socks"),
  // Team types (multiple possible)
  teamTypeF11: boolean("team_type_f11").default(false),
  teamTypeF7: boolean("team_type_f7").default(false),
  teamTypeFutsal: boolean("team_type_futsal").default(false),
  // Field info
  fieldName: text("field_name"),
  fieldAddress: text("field_address"),
  fieldType: text("field_type"),
  location: text("location"),
  localidade: text("localidade"),
  concelho: text("concelho"),
  distrito: text("distrito"),
  mapsUrl: text("maps_url"),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  // New optional fields
  teamPhotoUrl: text("team_photo_url"),
  foundedYear: integer("founded_year"),
  playerCount: integer("player_count"),
  ageGroup: text("age_group"),
  socialFacebook: text("social_facebook"),
  socialInstagram: text("social_instagram"),
  trainingSchedule: text("training_schedule"),
  notes: text("notes"),
  rgpdConsent: boolean("rgpd_consent").notNull().default(false),
  rgpdConsentAt: timestamp("rgpd_consent_at"),
  duplicateFlag: text("duplicate_flag"),
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

export const matches = pgTable("matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  opponent: text("opponent").notNull(),
  matchDate: timestamp("match_date").notNull(),
  location: text("location"),
  fieldName: text("field_name"),
  isHome: boolean("is_home").default(true),
  goalsFor: integer("goals_for"),
  goalsAgainst: integer("goals_against"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const suggestionStatusEnum = pgEnum("suggestion_status", [
  "pending",
  "read",
  "resolved",
]);

export const suggestions = pgTable("suggestions", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: suggestionStatusEnum("status").notNull().default("pending"),
  adminReply: text("admin_reply"),
  lastModifiedBy: text("last_modified_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const securityLog = pgTable("security_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  email: text("email"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type Admin = typeof admins.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type Suggestion = typeof suggestions.$inferSelect;
export type SecurityLogEntry = typeof securityLog.$inferSelect;

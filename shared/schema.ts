import { pgTable, text, serial, integer, boolean, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: text("role").notNull().default("conservator"), // Legacy field, kept for compatibility
  globalRole: text("global_role", { enum: ["admin", "conservator", "attorney", "observer"] }).notNull().default("conservator"),
  oauthProvider: text("oauth_provider"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conservatees = pgTable("conservatees", {
  id: serial("id").primaryKey(),
  conservatorId: integer("conservator_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  dob: date("dob"),
  contactInfo: text("contact_info"),
  caseNumber: text("case_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  conservatorId: integer("conservator_id").notNull().references(() => users.id),
  conservateeId: integer("conservatee_id").references(() => conservatees.id),
  date: date("date").notNull(),
  taskDescription: text("task_description").notNull(),
  memo: text("memo"),
  timeSpent: decimal("time_spent", { precision: 4, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailVerifications = pgTable("email_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", { enum: ["active", "inactive", "closed"] }).notNull().default("active"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const caseRoles = pgTable("case_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  permissions: text("permissions").notNull(), // JSON string of permissions
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userCaseRoles = pgTable("user_case_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  caseId: integer("case_id").notNull().references(() => cases.id),
  roleId: integer("role_id").notNull().references(() => caseRoles.id),
  invitedBy: integer("invited_by").notNull().references(() => users.id),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const caseInvitations = pgTable("case_invitations", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  caseId: integer("case_id").notNull().references(() => cases.id),
  roleId: integer("role_id").notNull().references(() => caseRoles.id),
  invitedBy: integer("invited_by").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  conservatees: many(conservatees),
  timeEntries: many(timeEntries),
  emailVerification: one(emailVerifications),
  createdCases: many(cases),
  userCaseRoles: many(userCaseRoles),
  sentInvitations: many(caseInvitations, { relationName: "invitedBy" }),
}));

export const conservateesRelations = relations(conservatees, ({ one, many }) => ({
  conservator: one(users, {
    fields: [conservatees.conservatorId],
    references: [users.id],
  }),
  timeEntries: many(timeEntries),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  conservator: one(users, {
    fields: [timeEntries.conservatorId],
    references: [users.id],
  }),
  conservatee: one(conservatees, {
    fields: [timeEntries.conservateeId],
    references: [conservatees.id],
  }),
}));

export const emailVerificationsRelations = relations(emailVerifications, ({ one }) => ({
  user: one(users, {
    fields: [emailVerifications.userId],
    references: [users.id],
  }),
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [cases.createdBy],
    references: [users.id],
  }),
  userCaseRoles: many(userCaseRoles),
  invitations: many(caseInvitations),
}));

export const caseRolesRelations = relations(caseRoles, ({ many }) => ({
  userCaseRoles: many(userCaseRoles),
  invitations: many(caseInvitations),
}));

export const userCaseRolesRelations = relations(userCaseRoles, ({ one }) => ({
  user: one(users, {
    fields: [userCaseRoles.userId],
    references: [users.id],
  }),
  case: one(cases, {
    fields: [userCaseRoles.caseId],
    references: [cases.id],
  }),
  role: one(caseRoles, {
    fields: [userCaseRoles.roleId],
    references: [caseRoles.id],
  }),
  inviter: one(users, {
    fields: [userCaseRoles.invitedBy],
    references: [users.id],
  }),
}));

export const caseInvitationsRelations = relations(caseInvitations, ({ one }) => ({
  case: one(cases, {
    fields: [caseInvitations.caseId],
    references: [cases.id],
  }),
  role: one(caseRoles, {
    fields: [caseInvitations.roleId],
    references: [caseRoles.id],
  }),
  inviter: one(users, {
    fields: [caseInvitations.invitedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Enhanced validation schema for signup form
export const signupValidationSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[A-Za-z\s]{2,50}$/, "Name can only contain letters and spaces"),
  email: z.string()
    .email("Invalid email address")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      "Password must contain uppercase, lowercase, number, and special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertConservateeSchema = createInsertSchema(conservatees).pick({
  conservatorId: true,
  name: true,
  dob: true,
  contactInfo: true,
  caseNumber: true,
  notes: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).pick({
  conservatorId: true,
  conservateeId: true,
  date: true,
  taskDescription: true,
  memo: true,
  timeSpent: true,
});

export const insertEmailVerificationSchema = createInsertSchema(emailVerifications).pick({
  userId: true,
  token: true,
  expiresAt: true,
  verified: true,
});

export const insertCaseSchema = createInsertSchema(cases).omit({
  id: true,
  createdAt: true,
});

export const insertCaseRoleSchema = createInsertSchema(caseRoles).omit({
  id: true,
  createdAt: true,
});

export const insertUserCaseRoleSchema = createInsertSchema(userCaseRoles).omit({
  id: true,
  createdAt: true,
});

export const insertCaseInvitationSchema = createInsertSchema(caseInvitations).omit({
  id: true,
  createdAt: true,
});

// Validation schemas
const conservateeSchema = insertConservateeSchema.extend({
  name: z.string().min(1, "Name is required"),
});

const timeEntrySchema = insertTimeEntrySchema.extend({
  taskDescription: z.string().min(1, "Task description is required"),
  timeSpent: z.string().min(1, "Time spent is required"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export { conservateeSchema, timeEntrySchema, loginSchema };

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConservatee = z.infer<typeof insertConservateeSchema>;
export type Conservatee = typeof conservatees.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertEmailVerification = z.infer<typeof insertEmailVerificationSchema>;
export type EmailVerification = typeof emailVerifications.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof cases.$inferSelect;
export type InsertCaseRole = z.infer<typeof insertCaseRoleSchema>;
export type CaseRole = typeof caseRoles.$inferSelect;
export type InsertUserCaseRole = z.infer<typeof insertUserCaseRoleSchema>;
export type UserCaseRole = typeof userCaseRoles.$inferSelect;
export type InsertCaseInvitation = z.infer<typeof insertCaseInvitationSchema>;
export type CaseInvitation = typeof caseInvitations.$inferSelect;

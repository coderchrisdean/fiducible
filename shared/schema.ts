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

// Document Management Tables
export const documentFolders = pgTable("document_folders", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull().references(() => cases.id),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  caseId: integer("case_id").notNull().references(() => cases.id),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  // Keep additional fields for compatibility
  description: text("description"),
  fileSize: integer("file_size"), // bytes
  mimeType: text("mime_type"),
  folderId: integer("folder_id").references(() => documentFolders.id),
  searchVector: text("search_vector"), // TSVector for full-text search
  downloadCount: integer("download_count").notNull().default(0),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documentTags = pgTable("document_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6366f1"), // Hex color for UI
  caseId: integer("case_id").notNull().references(() => cases.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentTagRelations = pgTable("document_tag_relations", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  tagId: integer("tag_id").notNull().references(() => documentTags.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentAccessLogs = pgTable("document_access_logs", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action", { enum: ["view", "download", "edit", "delete"] }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentAccess = pgTable("document_access", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  userId: integer("user_id").notNull().references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
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

export const documentFoldersRelations = relations(documentFolders, ({ one, many }) => ({
  case: one(cases, {
    fields: [documentFolders.caseId],
    references: [cases.id],
  }),
  creator: one(users, {
    fields: [documentFolders.createdBy],
    references: [users.id],
  }),
  parent: one(documentFolders, {
    fields: [documentFolders.parentId],
    references: [documentFolders.id],
    relationName: "parent",
  }),
  children: many(documentFolders),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  case: one(cases, {
    fields: [documents.caseId],
    references: [cases.id],
  }),
  owner: one(users, {
    fields: [documents.ownerId],
    references: [users.id],
  }),
  folder: one(documentFolders, {
    fields: [documents.folderId],
    references: [documentFolders.id],
  }),
  tagRelations: many(documentTagRelations),
  accessLogs: many(documentAccessLogs),
  accessGrants: many(documentAccess),
}));

export const documentTagsRelations = relations(documentTags, ({ one, many }) => ({
  case: one(cases, {
    fields: [documentTags.caseId],
    references: [cases.id],
  }),
  creator: one(users, {
    fields: [documentTags.createdBy],
    references: [users.id],
  }),
  tagRelations: many(documentTagRelations),
}));

export const documentTagRelationsRelations = relations(documentTagRelations, ({ one }) => ({
  document: one(documents, {
    fields: [documentTagRelations.documentId],
    references: [documents.id],
  }),
  tag: one(documentTags, {
    fields: [documentTagRelations.tagId],
    references: [documentTags.id],
  }),
}));

export const documentAccessLogsRelations = relations(documentAccessLogs, ({ one }) => ({
  document: one(documents, {
    fields: [documentAccessLogs.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [documentAccessLogs.userId],
    references: [users.id],
  }),
}));

export const documentAccessRelations = relations(documentAccess, ({ one }) => ({
  document: one(documents, {
    fields: [documentAccess.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [documentAccess.userId],
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
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 
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

export const insertDocumentFolderSchema = createInsertSchema(documentFolders).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentTagSchema = createInsertSchema(documentTags).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentTagRelationSchema = createInsertSchema(documentTagRelations).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentAccessLogSchema = createInsertSchema(documentAccessLogs).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentAccessSchema = createInsertSchema(documentAccess).omit({
  id: true,
  grantedAt: true,
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
export type InsertDocumentFolder = z.infer<typeof insertDocumentFolderSchema>;
export type DocumentFolder = typeof documentFolders.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocumentTag = z.infer<typeof insertDocumentTagSchema>;
export type DocumentTag = typeof documentTags.$inferSelect;
export type InsertDocumentTagRelation = z.infer<typeof insertDocumentTagRelationSchema>;
export type DocumentTagRelation = typeof documentTagRelations.$inferSelect;
export type InsertDocumentAccessLog = z.infer<typeof insertDocumentAccessLogSchema>;
export type DocumentAccessLog = typeof documentAccessLogs.$inferSelect;
export type InsertDocumentAccess = z.infer<typeof insertDocumentAccessSchema>;
export type DocumentAccess = typeof documentAccess.$inferSelect;

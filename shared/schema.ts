import { pgTable, text, serial, integer, boolean, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: text("role").notNull().default("conservator"),
  oauthProvider: text("oauth_provider"),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  conservatees: many(conservatees),
  timeEntries: many(timeEntries),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  passwordHash: true,
  role: true,
  oauthProvider: true,
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConservatee = z.infer<typeof insertConservateeSchema>;
export type Conservatee = typeof conservatees.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;

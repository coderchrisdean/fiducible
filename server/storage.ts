import { 
  users, 
  conservatees, 
  timeEntries, 
  emailVerifications,
  cases,
  caseRoles,
  userCaseRoles,
  caseInvitations,
  type User, 
  type InsertUser, 
  type Conservatee, 
  type InsertConservatee, 
  type TimeEntry, 
  type InsertTimeEntry,
  type EmailVerification,
  type InsertEmailVerification,
  type Case,
  type InsertCase,
  type CaseRole,
  type InsertCaseRole,
  type UserCaseRole,
  type InsertUserCaseRole,
  type CaseInvitation,
  type InsertCaseInvitation
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Conservatee methods
  getConservatee(id: number): Promise<Conservatee | undefined>;
  getConservateesByConservator(conservatorId: number): Promise<Conservatee[]>;
  createConservatee(conservatee: InsertConservatee): Promise<Conservatee>;
  updateConservatee(id: number, conservatee: Partial<InsertConservatee>): Promise<Conservatee | undefined>;
  deleteConservatee(id: number): Promise<boolean>;
  
  // Time entry methods
  getTimeEntry(id: number): Promise<TimeEntry | undefined>;
  getTimeEntriesByConservator(conservatorId: number): Promise<TimeEntry[]>;
  getTimeEntriesByConservatee(conservateeId: number): Promise<TimeEntry[]>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: number): Promise<boolean>;
  
  // Email verification methods
  getEmailVerification(token: string): Promise<EmailVerification | undefined>;
  getEmailVerificationByUserId(userId: number): Promise<EmailVerification | undefined>;
  createEmailVerification(verification: InsertEmailVerification): Promise<EmailVerification>;
  updateEmailVerification(id: number, verification: Partial<InsertEmailVerification>): Promise<EmailVerification | undefined>;
  deleteEmailVerification(id: number): Promise<boolean>;
  
  // Case methods
  getCase(id: number): Promise<Case | undefined>;
  getCasesByUser(userId: number): Promise<Case[]>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: number, caseData: Partial<InsertCase>): Promise<Case | undefined>;
  deleteCase(id: number): Promise<boolean>;
  
  // Case role methods
  getCaseRole(id: number): Promise<CaseRole | undefined>;
  getAllCaseRoles(): Promise<CaseRole[]>;
  createCaseRole(roleData: InsertCaseRole): Promise<CaseRole>;
  updateCaseRole(id: number, roleData: Partial<InsertCaseRole>): Promise<CaseRole | undefined>;
  deleteCaseRole(id: number): Promise<boolean>;
  
  // User case role methods
  getUserCaseRole(userId: number, caseId: number): Promise<UserCaseRole | undefined>;
  getUserCaseRoles(userId: number): Promise<UserCaseRole[]>;
  getCaseUserRoles(caseId: number): Promise<UserCaseRole[]>;
  createUserCaseRole(userCaseRole: InsertUserCaseRole): Promise<UserCaseRole>;
  updateUserCaseRole(id: number, userCaseRole: Partial<InsertUserCaseRole>): Promise<UserCaseRole | undefined>;
  deleteUserCaseRole(id: number): Promise<boolean>;
  
  // Case invitation methods
  getCaseInvitation(token: string): Promise<CaseInvitation | undefined>;
  getCaseInvitationsByCase(caseId: number): Promise<CaseInvitation[]>;
  createCaseInvitation(invitation: InsertCaseInvitation): Promise<CaseInvitation>;
  updateCaseInvitation(id: number, invitation: Partial<InsertCaseInvitation>): Promise<CaseInvitation | undefined>;
  deleteCaseInvitation(id: number): Promise<boolean>;
  
  // Document methods
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByCase(caseId: number, options?: {
    folderId?: number;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "date" | "size" | "downloads";
    sortOrder?: "asc" | "desc";
    archived?: boolean;
  }): Promise<{
    documents: Document[];
    totalCount: number;
    page: number;
    totalPages: number;
  }>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  searchDocuments(caseId: number, query: string, options?: {
    tags?: string[];
    folderId?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    documents: Document[];
    totalCount: number;
    searchTime: number;
  }>;
  
  // Document folder methods
  getDocumentFolder(id: number): Promise<DocumentFolder | undefined>;
  getDocumentFoldersByCase(caseId: number): Promise<DocumentFolder[]>;
  createDocumentFolder(folder: InsertDocumentFolder): Promise<DocumentFolder>;
  updateDocumentFolder(id: number, folder: Partial<InsertDocumentFolder>): Promise<DocumentFolder | undefined>;
  deleteDocumentFolder(id: number): Promise<boolean>;
  
  // Document tag methods
  getDocumentTag(id: number): Promise<DocumentTag | undefined>;
  getDocumentTagsByCase(caseId: number): Promise<DocumentTag[]>;
  createDocumentTag(tag: InsertDocumentTag): Promise<DocumentTag>;
  updateDocumentTag(id: number, tag: Partial<InsertDocumentTag>): Promise<DocumentTag | undefined>;
  deleteDocumentTag(id: number): Promise<boolean>;
  
  // Document tag relation methods
  addTagsToDocument(documentId: number, tagIds: number[]): Promise<DocumentTagRelation[]>;
  removeTagFromDocument(documentId: number, tagId: number): Promise<boolean>;
  getDocumentTags(documentId: number): Promise<DocumentTag[]>;
  
  // Document access log methods
  logDocumentAccess(log: InsertDocumentAccessLog): Promise<DocumentAccessLog>;
  getDocumentAccessLogs(documentId: number): Promise<DocumentAccessLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conservatees: Map<number, Conservatee>;
  private timeEntries: Map<number, TimeEntry>;
  private emailVerifications: Map<number, EmailVerification>;
  private cases: Map<number, Case>;
  private caseRoles: Map<number, CaseRole>;
  private userCaseRoles: Map<number, UserCaseRole>;
  private caseInvitations: Map<number, CaseInvitation>;
  private currentUserId: number;
  private currentConservateeId: number;
  private currentTimeEntryId: number;
  private currentEmailVerificationId: number;
  private currentCaseId: number;
  private currentCaseRoleId: number;
  private currentUserCaseRoleId: number;
  private currentCaseInvitationId: number;

  constructor() {
    this.users = new Map();
    this.conservatees = new Map();
    this.timeEntries = new Map();
    this.emailVerifications = new Map();
    this.cases = new Map();
    this.caseRoles = new Map();
    this.userCaseRoles = new Map();
    this.caseInvitations = new Map();
    this.currentUserId = 1;
    this.currentConservateeId = 1;
    this.currentTimeEntryId = 1;
    this.currentEmailVerificationId = 1;
    this.currentCaseId = 1;
    this.currentCaseRoleId = 1;
    this.currentUserCaseRoleId = 1;
    this.currentCaseInvitationId = 1;
    
    // Initialize default case roles
    this.initializeDefaultCaseRoles();
  }

  private initializeDefaultCaseRoles() {
    const defaultRoles = [
      {
        name: "Owner",
        permissions: JSON.stringify({
          read: true,
          write: true,
          delete: true,
          invite: true,
          manage: true
        }),
        description: "Full access to the case"
      },
      {
        name: "Editor",
        permissions: JSON.stringify({
          read: true,
          write: true,
          delete: false,
          invite: false,
          manage: false
        }),
        description: "Can view and edit case information"
      },
      {
        name: "Viewer",
        permissions: JSON.stringify({
          read: true,
          write: false,
          delete: false,
          invite: false,
          manage: false
        }),
        description: "Can only view case information"
      }
    ];

    defaultRoles.forEach((role) => {
      const caseRole: CaseRole = {
        id: this.currentCaseRoleId++,
        name: role.name,
        permissions: role.permissions,
        description: role.description,
        createdAt: new Date()
      };
      this.caseRoles.set(caseRole.id, caseRole);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id,
      name: insertUser.name,
      email: insertUser.email,
      passwordHash: insertUser.passwordHash || null,
      role: insertUser.role || "conservator",
      globalRole: insertUser.globalRole || "conservator",
      oauthProvider: insertUser.oauthProvider || null,
      emailVerified: insertUser.emailVerified || false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;

    const updated: User = { ...existing, ...updateData };
    this.users.set(id, updated);
    return updated;
  }

  // Conservatee methods
  async getConservatee(id: number): Promise<Conservatee | undefined> {
    return this.conservatees.get(id);
  }

  async getConservateesByConservator(conservatorId: number): Promise<Conservatee[]> {
    return Array.from(this.conservatees.values()).filter(
      (conservatee) => conservatee.conservatorId === conservatorId,
    );
  }

  async createConservatee(insertConservatee: InsertConservatee): Promise<Conservatee> {
    const id = this.currentConservateeId++;
    const conservatee: Conservatee = { 
      id,
      name: insertConservatee.name,
      conservatorId: insertConservatee.conservatorId,
      dob: insertConservatee.dob || null,
      contactInfo: insertConservatee.contactInfo || null,
      caseNumber: insertConservatee.caseNumber || null,
      notes: insertConservatee.notes || null,
      createdAt: new Date()
    };
    this.conservatees.set(id, conservatee);
    return conservatee;
  }

  async updateConservatee(id: number, updateData: Partial<InsertConservatee>): Promise<Conservatee | undefined> {
    const existing = this.conservatees.get(id);
    if (!existing) return undefined;

    const updated: Conservatee = { ...existing, ...updateData };
    this.conservatees.set(id, updated);
    return updated;
  }

  async deleteConservatee(id: number): Promise<boolean> {
    return this.conservatees.delete(id);
  }

  // Time entry methods
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    return this.timeEntries.get(id);
  }

  async getTimeEntriesByConservator(conservatorId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(
      (entry) => entry.conservatorId === conservatorId,
    );
  }

  async getTimeEntriesByConservatee(conservateeId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(
      (entry) => entry.conservateeId === conservateeId,
    );
  }

  async createTimeEntry(insertTimeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const id = this.currentTimeEntryId++;
    const timeEntry: TimeEntry = { 
      id,
      conservatorId: insertTimeEntry.conservatorId,
      conservateeId: insertTimeEntry.conservateeId || null,
      date: insertTimeEntry.date,
      taskDescription: insertTimeEntry.taskDescription,
      memo: insertTimeEntry.memo || null,
      timeSpent: insertTimeEntry.timeSpent,
      createdAt: new Date()
    };
    this.timeEntries.set(id, timeEntry);
    return timeEntry;
  }

  async updateTimeEntry(id: number, updateData: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    const existing = this.timeEntries.get(id);
    if (!existing) return undefined;

    const updated: TimeEntry = { ...existing, ...updateData };
    this.timeEntries.set(id, updated);
    return updated;
  }

  async deleteTimeEntry(id: number): Promise<boolean> {
    return this.timeEntries.delete(id);
  }

  // Email verification methods
  async getEmailVerification(token: string): Promise<EmailVerification | undefined> {
    return Array.from(this.emailVerifications.values()).find(
      (verification) => verification.token === token,
    );
  }

  async getEmailVerificationByUserId(userId: number): Promise<EmailVerification | undefined> {
    return Array.from(this.emailVerifications.values()).find(
      (verification) => verification.userId === userId,
    );
  }

  async createEmailVerification(insertVerification: InsertEmailVerification): Promise<EmailVerification> {
    const id = this.currentEmailVerificationId++;
    const verification: EmailVerification = {
      id,
      userId: insertVerification.userId,
      token: insertVerification.token,
      expiresAt: insertVerification.expiresAt,
      verified: insertVerification.verified || false,
      createdAt: new Date()
    };
    this.emailVerifications.set(id, verification);
    return verification;
  }

  async updateEmailVerification(id: number, updateData: Partial<InsertEmailVerification>): Promise<EmailVerification | undefined> {
    const existing = this.emailVerifications.get(id);
    if (!existing) return undefined;

    const updated: EmailVerification = { ...existing, ...updateData };
    this.emailVerifications.set(id, updated);
    return updated;
  }

  async deleteEmailVerification(id: number): Promise<boolean> {
    return this.emailVerifications.delete(id);
  }

  // Case methods
  async getCase(id: number): Promise<Case | undefined> {
    return this.cases.get(id);
  }

  async getCasesByUser(userId: number): Promise<Case[]> {
    const userCaseRoles = Array.from(this.userCaseRoles.values()).filter(
      (ucr) => ucr.userId === userId && ucr.acceptedAt !== null
    );
    const caseIds = userCaseRoles.map((ucr) => ucr.caseId);
    return Array.from(this.cases.values()).filter((c) => caseIds.includes(c.id));
  }

  async createCase(insertCase: InsertCase): Promise<Case> {
    const id = this.currentCaseId++;
    const caseData: Case = {
      id,
      name: insertCase.name,
      description: insertCase.description || null,
      status: insertCase.status || "active",
      createdBy: insertCase.createdBy,
      createdAt: new Date()
    };
    this.cases.set(id, caseData);
    return caseData;
  }

  async updateCase(id: number, updateData: Partial<InsertCase>): Promise<Case | undefined> {
    const existing = this.cases.get(id);
    if (!existing) return undefined;

    const updated: Case = { ...existing, ...updateData };
    this.cases.set(id, updated);
    return updated;
  }

  async deleteCase(id: number): Promise<boolean> {
    return this.cases.delete(id);
  }

  // Case role methods
  async getCaseRole(id: number): Promise<CaseRole | undefined> {
    return this.caseRoles.get(id);
  }

  async getAllCaseRoles(): Promise<CaseRole[]> {
    return Array.from(this.caseRoles.values());
  }

  async createCaseRole(insertRole: InsertCaseRole): Promise<CaseRole> {
    const id = this.currentCaseRoleId++;
    const role: CaseRole = {
      id,
      name: insertRole.name,
      permissions: insertRole.permissions,
      description: insertRole.description || null,
      createdAt: new Date()
    };
    this.caseRoles.set(id, role);
    return role;
  }

  async updateCaseRole(id: number, updateData: Partial<InsertCaseRole>): Promise<CaseRole | undefined> {
    const existing = this.caseRoles.get(id);
    if (!existing) return undefined;

    const updated: CaseRole = { ...existing, ...updateData };
    this.caseRoles.set(id, updated);
    return updated;
  }

  async deleteCaseRole(id: number): Promise<boolean> {
    return this.caseRoles.delete(id);
  }

  // User case role methods
  async getUserCaseRole(userId: number, caseId: number): Promise<UserCaseRole | undefined> {
    return Array.from(this.userCaseRoles.values()).find(
      (ucr) => ucr.userId === userId && ucr.caseId === caseId
    );
  }

  async getUserCaseRoles(userId: number): Promise<UserCaseRole[]> {
    return Array.from(this.userCaseRoles.values()).filter(
      (ucr) => ucr.userId === userId
    );
  }

  async getCaseUserRoles(caseId: number): Promise<UserCaseRole[]> {
    return Array.from(this.userCaseRoles.values()).filter(
      (ucr) => ucr.caseId === caseId
    );
  }

  async createUserCaseRole(insertUserCaseRole: InsertUserCaseRole): Promise<UserCaseRole> {
    const id = this.currentUserCaseRoleId++;
    const userCaseRole: UserCaseRole = {
      id,
      userId: insertUserCaseRole.userId,
      caseId: insertUserCaseRole.caseId,
      roleId: insertUserCaseRole.roleId,
      invitedBy: insertUserCaseRole.invitedBy,
      acceptedAt: insertUserCaseRole.acceptedAt || null,
      createdAt: new Date()
    };
    this.userCaseRoles.set(id, userCaseRole);
    return userCaseRole;
  }

  async updateUserCaseRole(id: number, updateData: Partial<InsertUserCaseRole>): Promise<UserCaseRole | undefined> {
    const existing = this.userCaseRoles.get(id);
    if (!existing) return undefined;

    const updated: UserCaseRole = { ...existing, ...updateData };
    this.userCaseRoles.set(id, updated);
    return updated;
  }

  async deleteUserCaseRole(id: number): Promise<boolean> {
    return this.userCaseRoles.delete(id);
  }

  // Case invitation methods
  async getCaseInvitation(token: string): Promise<CaseInvitation | undefined> {
    return Array.from(this.caseInvitations.values()).find(
      (invitation) => invitation.token === token
    );
  }

  async getCaseInvitationsByCase(caseId: number): Promise<CaseInvitation[]> {
    return Array.from(this.caseInvitations.values()).filter(
      (invitation) => invitation.caseId === caseId && invitation.acceptedAt === null
    );
  }

  async createCaseInvitation(insertInvitation: InsertCaseInvitation): Promise<CaseInvitation> {
    const id = this.currentCaseInvitationId++;
    const invitation: CaseInvitation = {
      id,
      email: insertInvitation.email,
      caseId: insertInvitation.caseId,
      roleId: insertInvitation.roleId,
      invitedBy: insertInvitation.invitedBy,
      token: insertInvitation.token,
      expiresAt: insertInvitation.expiresAt,
      acceptedAt: insertInvitation.acceptedAt || null,
      createdAt: new Date()
    };
    this.caseInvitations.set(id, invitation);
    return invitation;
  }

  async updateCaseInvitation(id: number, updateData: Partial<InsertCaseInvitation>): Promise<CaseInvitation | undefined> {
    const existing = this.caseInvitations.get(id);
    if (!existing) return undefined;

    const updated: CaseInvitation = { ...existing, ...updateData };
    this.caseInvitations.set(id, updated);
    return updated;
  }

  async deleteCaseInvitation(id: number): Promise<boolean> {
    return this.caseInvitations.delete(id);
  }
}

export const storage = new MemStorage();

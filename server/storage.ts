import { 
  users, 
  conservatees, 
  timeEntries, 
  type User, 
  type InsertUser, 
  type Conservatee, 
  type InsertConservatee, 
  type TimeEntry, 
  type InsertTimeEntry 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conservatees: Map<number, Conservatee>;
  private timeEntries: Map<number, TimeEntry>;
  private currentUserId: number;
  private currentConservateeId: number;
  private currentTimeEntryId: number;

  constructor() {
    this.users = new Map();
    this.conservatees = new Map();
    this.timeEntries = new Map();
    this.currentUserId = 1;
    this.currentConservateeId = 1;
    this.currentTimeEntryId = 1;
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
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
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
      ...insertConservatee, 
      id,
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
      ...insertTimeEntry, 
      id,
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
}

export const storage = new MemStorage();

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertConservateeSchema, insertTimeEntrySchema } from "@shared/schema";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      
      const userData = insertUserSchema.parse({
        name,
        email,
        passwordHash,
        role: "conservator"
      });

      const user = await storage.createUser(userData);
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    // For now, return a mock authenticated user
    // In production, this would check session/JWT
    const mockUser = {
      id: 1,
      name: "Demo Conservator",
      email: "demo@example.com",
      role: "conservator"
    };
    res.json(mockUser);
  });

  // Conservatee routes
  app.get("/api/conservatees", async (req, res) => {
    try {
      // In production, get conservatorId from authenticated session
      const conservatorId = 1; // Mock for now
      const conservatees = await storage.getConservateesByConservator(conservatorId);
      res.json(conservatees);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/conservatees", async (req, res) => {
    try {
      const conservatorId = 1; // Mock for now
      const conservateeData = insertConservateeSchema.parse({
        ...req.body,
        conservatorId
      });

      const conservatee = await storage.createConservatee(conservateeData);
      res.json(conservatee);
    } catch (error) {
      res.status(400).json({ message: "Invalid conservatee data" });
    }
  });

  app.put("/api/conservatees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid conservatee ID" });
      }
      
      const updateData = req.body;
      const conservatee = await storage.updateConservatee(id, updateData);
      if (!conservatee) {
        return res.status(404).json({ message: "Conservatee not found" });
      }
      
      res.json(conservatee);
    } catch (error) {
      console.error("Update conservatee error:", error);
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/conservatees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid conservatee ID" });
      }
      
      const deleted = await storage.deleteConservatee(id);
      if (!deleted) {
        return res.status(404).json({ message: "Conservatee not found" });
      }
      
      res.json({ message: "Conservatee deleted" });
    } catch (error) {
      console.error("Delete conservatee error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Time entry routes
  app.get("/api/time-entries", async (req, res) => {
    try {
      const conservatorId = 1; // Mock for now
      const timeEntries = await storage.getTimeEntriesByConservator(conservatorId);
      res.json(timeEntries);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/time-entries", async (req, res) => {
    try {
      const conservatorId = 1; // Mock for now
      const timeEntryData = insertTimeEntrySchema.parse({
        ...req.body,
        conservatorId
      });

      const timeEntry = await storage.createTimeEntry(timeEntryData);
      res.json(timeEntry);
    } catch (error) {
      res.status(400).json({ message: "Invalid time entry data" });
    }
  });

  app.put("/api/time-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid time entry ID" });
      }
      
      const updateData = req.body;
      const timeEntry = await storage.updateTimeEntry(id, updateData);
      if (!timeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      res.json(timeEntry);
    } catch (error) {
      console.error("Update time entry error:", error);
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/time-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid time entry ID" });
      }
      
      const deleted = await storage.deleteTimeEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      res.json({ message: "Time entry deleted" });
    } catch (error) {
      console.error("Delete time entry error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

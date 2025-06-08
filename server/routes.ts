import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertConservateeSchema, insertTimeEntrySchema, insertEmailVerificationSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { emailService } from "./emailService";

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

      // Create email verification token
      const token = emailService.generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const verificationData = insertEmailVerificationSchema.parse({
        userId: user.id,
        token,
        expiresAt,
        verified: false
      });

      await storage.createEmailVerification(verificationData);

      // Send verification email
      try {
        await emailService.sendVerificationEmail(email, name, token);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue with signup even if email fails
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      
      res.json({ 
        user: userWithoutPassword,
        message: "Account created successfully. Please check your email to verify your account."
      });
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

  // Email verification routes
  app.get("/api/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Verification token is required" });
      }

      const verification = await storage.getEmailVerification(token);
      if (!verification) {
        return res.status(404).json({ message: "Invalid verification token" });
      }

      if (verification.verified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      if (new Date() > verification.expiresAt) {
        return res.status(400).json({ message: "Verification token has expired" });
      }

      // Mark verification as completed
      await storage.updateEmailVerification(verification.id, { verified: true });
      
      // Mark user as verified
      await storage.updateUser(verification.userId, { emailVerified: true });

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/emails/resend", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Check for existing verification
      const existingVerification = await storage.getEmailVerificationByUserId(user.id);
      if (existingVerification && !existingVerification.verified) {
        // Check rate limiting - prevent resending within 60 seconds
        const timeSinceCreated = Date.now() - existingVerification.createdAt.getTime();
        if (timeSinceCreated < 60000) {
          return res.status(429).json({ message: "Please wait before requesting another verification email" });
        }

        // Delete old verification
        await storage.deleteEmailVerification(existingVerification.id);
      }

      // Create new verification token
      const token = emailService.generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const verificationData = insertEmailVerificationSchema.parse({
        userId: user.id,
        token,
        expiresAt,
        verified: false
      });

      await storage.createEmailVerification(verificationData);

      // Send verification email
      await emailService.sendVerificationEmail(email, user.name, token);

      res.json({ message: "Verification email sent successfully" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

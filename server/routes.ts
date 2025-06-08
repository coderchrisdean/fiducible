import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertConservateeSchema, 
  insertTimeEntrySchema, 
  insertEmailVerificationSchema,
  insertCaseSchema,
  insertCaseInvitationSchema,
  insertUserCaseRoleSchema
} from "@shared/schema";
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

  // Profile routes
  app.get("/api/profile", async (req, res) => {
    try {
      // TODO: Get user from session/auth
      const userId = 1; // Placeholder - should come from authenticated session
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userCaseRoles = await storage.getUserCaseRoles(userId);
      const cases = await storage.getCasesByUser(userId);
      
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        caseRoles: userCaseRoles,
        cases: cases
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/profile", async (req, res) => {
    try {
      // TODO: Get user from session/auth
      const userId = 1; // Placeholder - should come from authenticated session
      
      const { name, email, globalRole } = req.body;
      
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (globalRole) updateData.globalRole = globalRole;

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { passwordHash: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Case invitation routes
  app.post("/api/cases/:caseId/invitations", async (req, res) => {
    try {
      const caseId = parseInt(req.params.caseId);
      const { email, roleId, message } = req.body;
      
      // TODO: Get user from session/auth
      const inviterId = 1; // Placeholder - should come from authenticated session

      if (isNaN(caseId)) {
        return res.status(400).json({ message: "Invalid case ID" });
      }

      const caseData = await storage.getCase(caseId);
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }

      const role = await storage.getCaseRole(roleId);
      if (!role) {
        return res.status(400).json({ message: "Invalid role ID" });
      }

      // Check if user already has access to this case
      const targetUser = await storage.getUserByEmail(email);
      if (targetUser) {
        const existingRole = await storage.getUserCaseRole(targetUser.id, caseId);
        if (existingRole) {
          return res.status(400).json({ message: "User already has access to this case" });
        }
      }

      // Create invitation token and expiration
      const token = emailService.generateVerificationToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const invitationData = insertCaseInvitationSchema.parse({
        email,
        caseId,
        roleId,
        invitedBy: inviterId,
        token,
        expiresAt
      });

      const invitation = await storage.createCaseInvitation(invitationData);

      // Send invitation email
      const inviter = await storage.getUser(inviterId);
      if (inviter) {
        try {
          await emailService.sendCaseInvitationEmail(email, inviter.name, caseData.name, token);
        } catch (emailError) {
          console.error('Failed to send invitation email:', emailError);
          // Continue with invitation creation even if email fails
        }
      }

      res.json({ invitation });
    } catch (error) {
      console.error("Create invitation error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/cases/:caseId/invitations", async (req, res) => {
    try {
      const caseId = parseInt(req.params.caseId);
      
      if (isNaN(caseId)) {
        return res.status(400).json({ message: "Invalid case ID" });
      }

      const invitations = await storage.getCaseInvitationsByCase(caseId);
      res.json({ invitations });
    } catch (error) {
      console.error("Get invitations error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/cases/:caseId/invitations/:invitationId", async (req, res) => {
    try {
      const caseId = parseInt(req.params.caseId);
      const invitationId = parseInt(req.params.invitationId);
      
      if (isNaN(caseId) || isNaN(invitationId)) {
        return res.status(400).json({ message: "Invalid case or invitation ID" });
      }

      const deleted = await storage.deleteCaseInvitation(invitationId);
      if (!deleted) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      res.json({ message: "Invitation cancelled" });
    } catch (error) {
      console.error("Delete invitation error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/invitations/:token/accept", async (req, res) => {
    try {
      const { token } = req.params;
      
      // TODO: Get user from session/auth
      const userId = 1; // Placeholder - should come from authenticated session

      const invitation = await storage.getCaseInvitation(token);
      if (!invitation) {
        return res.status(404).json({ message: "Invalid invitation token" });
      }

      if (invitation.acceptedAt) {
        return res.status(400).json({ message: "Invitation already accepted" });
      }

      if (new Date() > invitation.expiresAt) {
        return res.status(400).json({ message: "Invitation has expired" });
      }

      // Check if user's email matches invitation
      const user = await storage.getUser(userId);
      if (!user || user.email !== invitation.email) {
        return res.status(400).json({ message: "Invitation email does not match your account" });
      }

      // Create user case role
      const userCaseRoleData = insertUserCaseRoleSchema.parse({
        userId,
        caseId: invitation.caseId,
        roleId: invitation.roleId,
        invitedBy: invitation.invitedBy,
        acceptedAt: new Date()
      });

      const userCaseRole = await storage.createUserCaseRole(userCaseRoleData);

      // Mark invitation as accepted
      await storage.updateCaseInvitation(invitation.id, { acceptedAt: new Date() });

      res.json({ caseRole: userCaseRole });
    } catch (error) {
      console.error("Accept invitation error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Document Management Routes
  const { upload } = await import("./upload");
  const { documentStorage } = await import("./documentStorage");
  const { LocalFileStorage, validateFile, generateSearchText } = await import("./fileStorage");
  
  const fileStorage = new LocalFileStorage('./uploads');

  // Document upload
  app.post("/api/cases/:caseId/documents/upload", upload.array('files', 10), async (req, res) => {
    try {
      // TODO: Get user from session/auth - using mock for now
      const userId = 1;

      const caseId = parseInt(req.params.caseId);
      if (isNaN(caseId)) {
        return res.status(400).json({ message: "Invalid case ID" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const { folderId, description } = req.body;
      const uploadedDocuments = [];

      for (const file of files) {
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
          return res.status(400).json({ message: validation.error });
        }

        // Save file to storage
        const filePath = await fileStorage.saveFile(file.buffer, file.originalname, file.mimetype);
        
        // Generate search text
        const searchVector = generateSearchText(file.originalname, file.mimetype);

        // Create document record
        const documentData = {
          caseId,
          uploadedBy: userId,
          title: file.originalname,
          description: description || null,
          fileName: file.originalname,
          filePath,
          fileSize: file.size,
          mimeType: file.mimetype,
          folderId: folderId ? parseInt(folderId) : null,
          searchVector,
          downloadCount: 0,
          isArchived: false
        };

        const document = await documentStorage.createDocument(documentData);
        uploadedDocuments.push(document);
      }

      res.json({ 
        documents: uploadedDocuments,
        message: `${uploadedDocuments.length} file(s) uploaded successfully`
      });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({ message: "Failed to upload documents" });
    }
  });

  // List documents
  app.get("/api/cases/:caseId/documents", async (req, res) => {
    try {
      // TODO: Get user from session/auth - using mock for now
      const userId = 1;

      const caseId = parseInt(req.params.caseId);
      if (isNaN(caseId)) {
        return res.status(400).json({ message: "Invalid case ID" });
      }

      const {
        folderId,
        tags,
        search,
        page = 1,
        limit = 50,
        sortBy = "date",
        sortOrder = "desc",
        archived = false
      } = req.query;

      const options = {
        folderId: folderId ? parseInt(folderId as string) : undefined,
        tags: tags ? (tags as string).split(',') : undefined,
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as "name" | "date" | "size" | "downloads",
        sortOrder: sortOrder as "asc" | "desc",
        archived: archived === 'true'
      };

      const result = await documentStorage.getDocumentsByCase(caseId, options);
      
      // Get folders and tags for the case
      const [folders, docTags] = await Promise.all([
        documentStorage.getDocumentFoldersByCase(caseId),
        documentStorage.getDocumentTagsByCase(caseId)
      ]);

      res.json({
        ...result,
        folders,
        tags: docTags
      });
    } catch (error) {
      console.error("Document listing error:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Download document
  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      // TODO: Get user from session/auth - using mock for now
      const userId = 1;

      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await documentStorage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Log download access
      await documentStorage.logDocumentAccess({
        documentId,
        userId,
        action: "download",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null
      });

      // Increment download count
      await documentStorage.incrementDownloadCount(documentId);

      // Get file from storage
      const fileBuffer = await fileStorage.getFile(document.filePath);

      res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Length', document.fileSize);
      
      res.send(fileBuffer);
    } catch (error) {
      console.error("Document download error:", error);
      res.status(500).json({ message: "Failed to download document" });
    }
  });

  // Search documents
  app.get("/api/cases/:caseId/documents/search", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const caseId = parseInt(req.params.caseId);
      if (isNaN(caseId)) {
        return res.status(400).json({ message: "Invalid case ID" });
      }

      const { q, tags, folderId, page = 1, limit = 50 } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query required" });
      }

      const options = {
        tags: tags ? (tags as string).split(',') : undefined,
        folderId: folderId ? parseInt(folderId as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await documentStorage.searchDocuments(caseId, q, options);
      res.json(result);
    } catch (error) {
      console.error("Document search error:", error);
      res.status(500).json({ message: "Failed to search documents" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

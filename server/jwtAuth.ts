import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";
const JWT_EXPIRES_IN = "7d";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    globalRole: string;
  };
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export function generateToken(user: { id: number; email: string; name: string; globalRole: string }) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      globalRole: user.globalRole,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      name: string;
      globalRole: string;
    };
  } catch (error) {
    return null;
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  (req as any).user = decoded;
  next();
};

export async function setupJWTAuth(app: Express) {
  // Login route with email verification check
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(403).json({ 
          message: "Please verify your email address before signing in. Check your inbox for a verification link.",
          emailVerificationRequired: true
        });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        globalRole: user.globalRole,
      });

      const { passwordHash: _, ...userWithoutPassword } = user;

      console.log(`[AUTH] [LOGIN] User ${email} successfully logged in`);

      res.json({
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Register route with email verification
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const { name, email, password } = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user with emailVerified: false
      const newUser = await storage.createUser({
        name,
        email,
        passwordHash,
        globalRole: "conservator",
        emailVerified: false,
      });

      // Import email service and create verification token
      const { emailService } = await import("./emailService");
      const verificationToken = emailService.generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store email verification
      await storage.createEmailVerification({
        userId: newUser.id,
        token: verificationToken,
        expiresAt,
        verified: false,
      });

      // Send verification email using Resend
      try {
        await emailService.sendVerificationEmail(email, name, verificationToken);
        console.log(`[AUTH] [REGISTER] Verification email sent to ${email}`);
      } catch (emailError) {
        console.error(`[AUTH] [REGISTER] Failed to send verification email:`, emailError);
        // Don't fail registration if email sending fails
      }

      const { passwordHash: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        user: userWithoutPassword,
        message: "Account created successfully. Please check your email to verify your account before signing in.",
        emailSent: true,
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Get current user route
  app.get("/api/user", authenticateToken, async (req: any, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Email verification route
  app.get("/api/verify-email/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      const verification = await storage.getEmailVerification(token);
      if (!verification) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      if (verification.verified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      if (verification.expiresAt < new Date()) {
        return res.status(400).json({ message: "Verification token has expired" });
      }

      // Mark email as verified
      await storage.updateUser(verification.userId, { emailVerified: true });
      await storage.updateEmailVerification(verification.id, { verified: true });

      console.log(`[AUTH] [VERIFY] Email verified for user ID ${verification.userId}`);

      res.json({ 
        message: "Email successfully verified. You can now sign in to your account.",
        verified: true 
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Resend verification email route
  app.post("/api/resend-verification", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Generate new verification token
      const { emailService } = await import("./emailService");
      const verificationToken = emailService.generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update existing verification or create new one
      const existingVerification = await storage.getEmailVerificationByUserId(user.id);
      if (existingVerification) {
        await storage.updateEmailVerification(existingVerification.id, {
          token: verificationToken,
          expiresAt,
          verified: false,
        });
      } else {
        await storage.createEmailVerification({
          userId: user.id,
          token: verificationToken,
          expiresAt,
          verified: false,
        });
      }

      // Send verification email
      try {
        await emailService.sendVerificationEmail(email, user.name, verificationToken);
        console.log(`[AUTH] [RESEND] Verification email resent to ${email}`);
        res.json({ message: "Verification email sent successfully" });
      } catch (emailError) {
        console.error(`[AUTH] [RESEND] Failed to resend verification email:`, emailError);
        res.status(500).json({ message: "Failed to send verification email" });
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Logout route (client-side token removal)
  app.post("/api/logout", (req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
  });
}
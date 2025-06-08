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
  req: AuthenticatedRequest,
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

  req.user = decoded;
  next();
};

export async function setupJWTAuth(app: Express) {
  // Login route
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

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        globalRole: user.globalRole,
      });

      const { passwordHash: _, ...userWithoutPassword } = user;

      res.json({
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Register route
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

      // Create user
      const newUser = await storage.createUser({
        name,
        email,
        passwordHash,
        globalRole: "conservator",
      });

      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        globalRole: newUser.globalRole,
      });

      const { passwordHash: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Get current user route
  app.get("/api/user", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
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

  // Logout route (client-side token removal)
  app.post("/api/logout", (req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
  });
}
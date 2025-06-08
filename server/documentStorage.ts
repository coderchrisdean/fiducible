import { db } from "./db";
import { 
  documents, 
  documentFolders, 
  documentTags, 
  documentTagRelations, 
  documentAccessLogs,
  type Document, 
  type InsertDocument, 
  type DocumentFolder, 
  type InsertDocumentFolder, 
  type DocumentTag, 
  type InsertDocumentTag, 
  type DocumentTagRelation, 
  type InsertDocumentTagRelation, 
  type DocumentAccessLog, 
  type InsertDocumentAccessLog 
} from "@shared/schema";
import { eq, and, like, desc, asc, count, inArray, sql } from "drizzle-orm";

export class DocumentStorage {
  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentsByCase(caseId: number, options?: {
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
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const offset = (page - 1) * limit;
    
    let query = db.select().from(documents).where(eq(documents.caseId, caseId));
    let countQuery = db.select({ count: count() }).from(documents).where(eq(documents.caseId, caseId));

    // Build query conditions
    const conditions = [eq(documents.caseId, caseId)];
    
    if (options?.folderId !== undefined) {
      conditions.push(eq(documents.folderId, options.folderId));
    }
    
    if (options?.search) {
      conditions.push(like(documents.title, `%${options.search}%`));
    }
    
    if (options?.archived !== undefined) {
      conditions.push(eq(documents.isArchived, options.archived));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Build sorting
    let orderByClause;
    if (options?.sortBy) {
      const sortField = options.sortBy === "name" ? documents.title :
                       options.sortBy === "date" ? documents.createdAt :
                       options.sortBy === "size" ? documents.fileSize :
                       documents.downloadCount;
      
      orderByClause = options?.sortOrder === "desc" ? desc(sortField) : asc(sortField);
    } else {
      orderByClause = desc(documents.createdAt);
    }

    // Execute queries
    query = db.select().from(documents).where(whereClause).orderBy(orderByClause).limit(limit).offset(offset);
    countQuery = db.select({ count: count() }).from(documents).where(whereClause);

    const [documentsResult, countResult] = await Promise.all([
      query,
      countQuery
    ]);

    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      documents: documentsResult,
      totalCount,
      page,
      totalPages
    };
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updated] = await db
      .update(documents)
      .set({ ...document, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async searchDocuments(caseId: number, query: string, options?: {
    tags?: string[];
    folderId?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    documents: Document[];
    totalCount: number;
    searchTime: number;
  }> {
    const startTime = Date.now();
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const offset = (page - 1) * limit;

    const conditions = [
      eq(documents.caseId, caseId),
      like(documents.searchVector, `%${query.toLowerCase()}%`)
    ];

    if (options?.folderId !== undefined) {
      conditions.push(eq(documents.folderId, options.folderId));
    }

    const searchQuery = db.select().from(documents)
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt))
      .limit(limit)
      .offset(offset);

    const countQuery = db.select({ count: count() }).from(documents)
      .where(and(...conditions));

    const [documentsResult, countResult] = await Promise.all([
      searchQuery,
      countQuery
    ]);

    const searchTime = Date.now() - startTime;
    const totalCount = countResult[0]?.count || 0;

    return {
      documents: documentsResult,
      totalCount,
      searchTime
    };
  }

  // Document folder methods
  async getDocumentFolder(id: number): Promise<DocumentFolder | undefined> {
    const [folder] = await db.select().from(documentFolders).where(eq(documentFolders.id, id));
    return folder || undefined;
  }

  async getDocumentFoldersByCase(caseId: number): Promise<DocumentFolder[]> {
    return await db.select().from(documentFolders)
      .where(eq(documentFolders.caseId, caseId))
      .orderBy(asc(documentFolders.name));
  }

  async createDocumentFolder(folder: InsertDocumentFolder): Promise<DocumentFolder> {
    const [newFolder] = await db.insert(documentFolders).values(folder).returning();
    return newFolder;
  }

  async updateDocumentFolder(id: number, folder: Partial<InsertDocumentFolder>): Promise<DocumentFolder | undefined> {
    const [updated] = await db
      .update(documentFolders)
      .set(folder)
      .where(eq(documentFolders.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDocumentFolder(id: number): Promise<boolean> {
    // Check if folder is empty
    const documentsInFolder = await db.select({ count: count() })
      .from(documents)
      .where(eq(documents.folderId, id));
    
    if (documentsInFolder[0]?.count > 0) {
      throw new Error("Cannot delete folder with documents");
    }

    const result = await db.delete(documentFolders).where(eq(documentFolders.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Document tag methods
  async getDocumentTag(id: number): Promise<DocumentTag | undefined> {
    const [tag] = await db.select().from(documentTags).where(eq(documentTags.id, id));
    return tag || undefined;
  }

  async getDocumentTagsByCase(caseId: number): Promise<DocumentTag[]> {
    return await db.select().from(documentTags)
      .where(eq(documentTags.caseId, caseId))
      .orderBy(asc(documentTags.name));
  }

  async createDocumentTag(tag: InsertDocumentTag): Promise<DocumentTag> {
    const [newTag] = await db.insert(documentTags).values(tag).returning();
    return newTag;
  }

  async updateDocumentTag(id: number, tag: Partial<InsertDocumentTag>): Promise<DocumentTag | undefined> {
    const [updated] = await db
      .update(documentTags)
      .set(tag)
      .where(eq(documentTags.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDocumentTag(id: number): Promise<boolean> {
    // Remove all tag relations first
    await db.delete(documentTagRelations).where(eq(documentTagRelations.tagId, id));
    
    const result = await db.delete(documentTags).where(eq(documentTags.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Document tag relation methods
  async addTagsToDocument(documentId: number, tagIds: number[]): Promise<DocumentTagRelation[]> {
    const relations = tagIds.map(tagId => ({
      documentId,
      tagId
    }));

    return await db.insert(documentTagRelations).values(relations).returning();
  }

  async removeTagFromDocument(documentId: number, tagId: number): Promise<boolean> {
    const result = await db.delete(documentTagRelations)
      .where(and(
        eq(documentTagRelations.documentId, documentId),
        eq(documentTagRelations.tagId, tagId)
      ));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getDocumentTags(documentId: number): Promise<DocumentTag[]> {
    const result = await db.select({
      id: documentTags.id,
      name: documentTags.name,
      color: documentTags.color,
      caseId: documentTags.caseId,
      createdBy: documentTags.createdBy,
      createdAt: documentTags.createdAt
    })
    .from(documentTagRelations)
    .innerJoin(documentTags, eq(documentTagRelations.tagId, documentTags.id))
    .where(eq(documentTagRelations.documentId, documentId));

    return result;
  }

  // Document access log methods
  async logDocumentAccess(log: InsertDocumentAccessLog): Promise<DocumentAccessLog> {
    const [accessLog] = await db.insert(documentAccessLogs).values(log).returning();
    return accessLog;
  }

  async getDocumentAccessLogs(documentId: number): Promise<DocumentAccessLog[]> {
    return await db.select().from(documentAccessLogs)
      .where(eq(documentAccessLogs.documentId, documentId))
      .orderBy(desc(documentAccessLogs.createdAt));
  }

  async incrementDownloadCount(documentId: number): Promise<void> {
    await db.update(documents)
      .set({ downloadCount: sql`${documents.downloadCount} + 1` })
      .where(eq(documents.id, documentId));
  }
}

export const documentStorage = new DocumentStorage();
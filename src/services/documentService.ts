import { Document, SearchResult, User } from '../types';
import { AIService } from './aiService';
import { databaseService } from './database';

export class DocumentService {
  private static documents: Document[] = [
    {
      id: '1',
      title: 'Q3 Financial Report',
      author: 'John Smith',
      category: 'Finance',
      uploadDate: '2024-01-15',
      uploader: 'finance_user',
      fileName: 'q3-financial-report.pdf',
      fileSize: 2048000,
      fileType: 'application/pdf',
      summary: 'Quarterly financial performance showing 15% revenue growth year-over-year. Key highlights include increased market share in the technology sector and successful cost reduction initiatives.',
      metadata: {
        title: 'Q3 Financial Report',
        author: 'John Smith',
        date: '2024-01-15',
        entities: {
          people: ['John Smith', 'Jane Doe'],
          organizations: ['TechCorp Inc', 'Global Finance Ltd'],
          amounts: ['$2.5M', '$150K', '$300K'],
          dates: ['2024-01-15', '2023-12-31']
        },
        keywords: ['revenue', 'growth', 'financial', 'quarterly', 'performance']
      },
      content: 'Q3 Financial Report - Executive Summary\n\nOur company has achieved remarkable financial performance in Q3 2024, with revenue growth of 15% year-over-year. The technology sector continues to be our strongest performing division, contributing $2.5M in revenue. Cost reduction initiatives have saved approximately $150K this quarter. Market expansion efforts have resulted in a 12% increase in market share.',
      embedding: []
    },
    {
      id: '2',
      title: 'Employee Handbook 2024',
      author: 'HR Department',
      category: 'HR',
      uploadDate: '2024-01-10',
      uploader: 'hr_user',
      fileName: 'employee-handbook-2024.pdf',
      fileSize: 5120000,
      fileType: 'application/pdf',
      summary: 'Comprehensive guide covering company policies, benefits, procedures, and workplace guidelines. Updated with new remote work policies and enhanced diversity and inclusion initiatives.',
      metadata: {
        title: 'Employee Handbook 2024',
        author: 'HR Department',
        date: '2024-01-01',
        entities: {
          people: ['Sarah Johnson', 'Mike Wilson'],
          organizations: ['HR Department', 'Benefits Corp'],
          amounts: ['$5000', '$2500'],
          dates: ['2024-01-01', '2024-12-31']
        },
        keywords: ['employee', 'policies', 'benefits', 'workplace', 'remote']
      },
      content: 'Employee Handbook 2024\n\nWelcome to our company! This handbook contains important information about company policies, employee benefits, and workplace procedures. New for 2024: enhanced remote work policies, updated parental leave benefits up to $5000 compensation, and comprehensive diversity and inclusion training programs.',
      embedding: []
    },
    {
      id: '3',
      title: 'Software License Agreement',
      author: 'Legal Team',
      category: 'Legal',
      uploadDate: '2024-01-12',
      uploader: 'legal_user',
      fileName: 'software-license-agreement.pdf',
      fileSize: 1024000,
      fileType: 'application/pdf',
      summary: 'Standard software licensing terms and conditions for enterprise customers. Includes usage rights, limitations, support terms, and liability clauses.',
      metadata: {
        title: 'Software License Agreement',
        author: 'Legal Team',
        date: '2024-01-12',
        entities: {
          people: ['Robert Brown', 'Alice Cooper'],
          organizations: ['Legal Corp', 'Software Solutions Inc'],
          amounts: ['$10,000', '$500'],
          dates: ['2024-01-12', '2025-01-12']
        },
        keywords: ['license', 'software', 'agreement', 'terms', 'conditions']
      },
      content: 'Software License Agreement\n\nThis agreement grants you a non-exclusive license to use our software products. The license fee is $10,000 annually with $500 monthly support fees. Terms include usage limitations, intellectual property rights, and liability limitations. Agreement is valid from 2024-01-12 to 2025-01-12.',
      embedding: []
    },
    {
      id: '4',
      title: 'Technical Architecture Review',
      author: 'Engineering Team',
      category: 'Technical Reports',
      uploadDate: '2024-01-08',
      uploader: 'admin',
      fileName: 'tech-architecture-review.pdf',
      fileSize: 3072000,
      fileType: 'application/pdf',
      summary: 'Comprehensive review of current system architecture, performance analysis, and recommendations for scalability improvements. Focus on microservices migration and cloud infrastructure.',
      metadata: {
        title: 'Technical Architecture Review',
        author: 'Engineering Team',
        date: '2024-01-08',
        entities: {
          people: ['David Kim', 'Lisa Chen'],
          organizations: ['Engineering Dept', 'Cloud Systems Inc'],
          amounts: ['$50,000', '$25,000'],
          dates: ['2024-01-08', '2024-06-30']
        },
        keywords: ['architecture', 'technical', 'microservices', 'cloud', 'scalability']
      },
      content: 'Technical Architecture Review\n\nCurrent system analysis reveals opportunities for improvement in scalability and performance. Recommendation: migrate to microservices architecture with estimated cost of $50,000. Cloud infrastructure upgrade will require additional $25,000 investment. Timeline for completion: 2024-06-30.',
      embedding: []
    }
  ];

  // Initialize embeddings for existing documents
  static async initializeEmbeddings() {
    for (const doc of this.documents) {
      if (!doc.embedding || doc.embedding.length === 0) {
        doc.embedding = await AIService.generateEmbedding(doc.content + ' ' + doc.title + ' ' + doc.summary);
      }
    }
  }

  // Get documents accessible to user based on role
  static async getDocumentsForUser(user: User): Promise<Document[]> {
    try {
      const dbDocuments = await databaseService.getDocumentsByRole(user.role);
      
      // Convert database documents to app documents
      const documents: Document[] = dbDocuments.map(dbDoc => ({
        id: dbDoc.id,
        title: dbDoc.title,
        author: dbDoc.author,
        category: dbDoc.category as any,
        uploadDate: dbDoc.uploadDate,
        uploader: dbDoc.uploader,
        fileName: dbDoc.fileName,
        fileSize: dbDoc.fileSize,
        fileType: dbDoc.fileType,
        summary: dbDoc.summary,
        metadata: JSON.parse(dbDoc.metadata || '{}'),
        content: dbDoc.content,
        embedding: JSON.parse(dbDoc.embedding || '[]')
      }));

      // If no documents in DB, return the static ones for demo
      if (documents.length === 0) {
        if (user.role === 'admin') {
          return this.documents;
        }
        
        const roleMapping = {
          finance: ['Finance', 'Invoices'],
          hr: ['HR'],
          legal: ['Legal', 'Contracts'],
          technical: ['Technical Reports']
        };
        
        const allowedCategories = roleMapping[user.role] || [];
        return this.documents.filter(doc => allowedCategories.includes(doc.category));
      }

      return documents;
    } catch (error) {
      console.error('Error getting documents for user:', error);
      return [];
    }
  }

  // Add new document
  static async addDocument(file: File, content: string, user: User): Promise<Document> {
    const metadata = await AIService.extractMetadata(content, file.name);
    const category = await AIService.classifyDocument(content, file.name);
    const summary = await AIService.generateSummary(content);
    const embedding = await AIService.generateEmbedding(content + ' ' + metadata.title + ' ' + summary);

    const document: Document = {
      id: Date.now().toString(),
      title: metadata.title,
      author: metadata.author,
      category,
      uploadDate: new Date().toISOString().split('T')[0],
      uploader: user.username,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      summary,
      metadata,
      content,
      embedding
    };

    this.documents.push(document);
    return document;
  }

  // Add new document with detailed information
  static async addDocumentWithDetails(
    file: File, 
    content: string, 
    user: User, 
    details: {
      title: string;
      author: string;
      category: string;
      date: string;
    }
  ): Promise<Document> {
    // Still extract metadata and generate AI summary, but use user-provided details where available
    const extractedMetadata = await AIService.extractMetadata(content, file.name);
    const aiCategory = await AIService.classifyDocument(content, file.name);
    const summary = await AIService.generateSummary(content);
    
    // Create enhanced metadata with user inputs
    const metadata = {
      ...extractedMetadata,
      title: details.title,
      author: details.author,
      date: details.date,
      userProvidedCategory: details.category,
      aiSuggestedCategory: aiCategory
    };

    const searchText = `${details.title} ${content} ${summary}`;
    const embedding = await AIService.generateEmbedding(searchText);

    const document: Document = {
      id: Date.now().toString(),
      title: details.title,
      author: details.author,
      category: details.category as any, // User-provided category takes precedence
      uploadDate: details.date, // Use user-provided date instead of current date
      uploader: user.username,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      summary,
      metadata,
      content,
      embedding
    };

    // Save to database
    try {
      await databaseService.saveDocument({
        title: document.title,
        author: document.author,
        category: document.category,
        uploadDate: document.uploadDate,
        uploader: document.uploader,
        fileName: document.fileName,
        fileSize: document.fileSize,
        fileType: document.fileType,
        summary: document.summary,
        content: document.content,
        metadata: JSON.stringify(document.metadata),
        embedding: JSON.stringify(document.embedding),
        accessLevel: 'internal',
        department: user.role === 'admin' ? 'Administration' : 
                   user.role === 'finance' ? 'Finance' :
                   user.role === 'hr' ? 'Human Resources' :
                   user.role === 'legal' ? 'Legal' : 'Technical',
        tags: JSON.stringify([]),
        version: '1.0',
        isActive: true
      });
    } catch (error) {
      console.error('Error saving document to database:', error);
    }

    // Also add to memory for immediate access
    this.documents.push(document);
    return document;
  }

  // Semantic search
  static async semanticSearch(query: string, user: User, limit: number = 10): Promise<SearchResult[]> {
    await this.initializeEmbeddings();
    
    const queryEmbedding = await AIService.generateEmbedding(query);
    const userDocuments = await this.getDocumentsForUser(user);
    
    const results = userDocuments.map(doc => {
      const similarity = doc.embedding 
        ? AIService.calculateSimilarity(queryEmbedding, doc.embedding)
        : 0;
      
      // Generate snippet
      const queryWords = query.toLowerCase().split(/\s+/);
      const contentLower = doc.content.toLowerCase();
      let snippetStart = 0;
      
      for (const word of queryWords) {
        const index = contentLower.indexOf(word);
        if (index !== -1) {
          snippetStart = Math.max(0, index - 50);
          break;
        }
      }
      
      const snippet = doc.content.substring(snippetStart, snippetStart + 200) + '...';
      
      return {
        document: doc,
        score: similarity,
        snippet
      };
    });

    return results
      .filter(result => result.score > 0.1) // Minimum similarity threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Keyword search (fallback)
  static async keywordSearch(query: string, user: User): Promise<SearchResult[]> {
    const userDocuments = await this.getDocumentsForUser(user);
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const results = userDocuments.map(doc => {
      const searchText = (doc.title + ' ' + doc.content + ' ' + doc.summary + ' ' + doc.metadata.keywords.join(' ')).toLowerCase();
      
      let score = 0;
      for (const word of queryWords) {
        const regex = new RegExp(word, 'gi');
        const matches = searchText.match(regex);
        if (matches) {
          score += matches.length;
        }
      }
      
      // Find snippet
      const firstMatch = queryWords.find(word => searchText.includes(word));
      let snippet = doc.summary;
      if (firstMatch) {
        const index = doc.content.toLowerCase().indexOf(firstMatch);
        if (index !== -1) {
          const start = Math.max(0, index - 50);
          snippet = doc.content.substring(start, start + 200) + '...';
        }
      }
      
      return {
        document: doc,
        score,
        snippet
      };
    });

    return results
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  // Get document by ID (with access control)
  static async getDocument(id: string, user: User): Promise<Document | null> {
    const userDocuments = await this.getDocumentsForUser(user);
    return userDocuments.find(doc => doc.id === id) || null;
  }

  // Get recent documents
  static async getRecentDocuments(user: User, limit: number = 5): Promise<Document[]> {
    const userDocuments = await this.getDocumentsForUser(user);
    return userDocuments
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
      .slice(0, limit);
  }

  // Get category statistics
  static async getCategoryStats(user: User): Promise<Record<string, number>> {
    const userDocuments = await this.getDocumentsForUser(user);
    const stats: Record<string, number> = {};
    
    for (const doc of userDocuments) {
      stats[doc.category] = (stats[doc.category] || 0) + 1;
    }
    
    return stats;
  }
}
// SQLite Database Service using Web SQL API (for demo purposes)
// In production, you would use a proper backend with SQLite

interface DBUser {
  id: string;
  username: string;
  password: string; // In production, this would be hashed
  role: 'admin' | 'finance' | 'hr' | 'legal' | 'technical';
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

interface DBDocument {
  id: string;
  title: string;
  author: string;
  category: string;
  uploadDate: string;
  uploader: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  summary: string;
  content: string;
  metadata: string; // JSON string
  embedding: string; // JSON string of embedding array
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  department: string;
  tags: string; // JSON array string
  version: string;
  isActive: boolean;
}

class DatabaseService {
  private dbName = 'DocumentManagementDB';
  private version = '1.0';
  private displayName = 'Document Management Database';
  private maxSize = 50 * 1024 * 1024; // 50MB

  // Initialize database and create tables
  async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Use localStorage for demo purposes since WebSQL is deprecated
        // In production, you would use a proper backend database
        
        if (!localStorage.getItem('db_initialized')) {
          this.createDefaultUsers();
          this.createDefaultDocuments();
          localStorage.setItem('db_initialized', 'true');
        }
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create default users
  private createDefaultUsers(): void {
    const defaultUsers: DBUser[] = [
      {
        id: '1',
        username: 'admin',
        password: 'admin123', // In production, this would be hashed
        role: 'admin',
        email: 'admin@company.com',
        firstName: 'System',
        lastName: 'Administrator',
        department: 'IT',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '2',
        username: 'john.finance',
        password: 'finance123',
        role: 'finance',
        email: 'john.smith@company.com',
        firstName: 'John',
        lastName: 'Smith',
        department: 'Finance',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '3',
        username: 'sarah.hr',
        password: 'hr123',
        role: 'hr',
        email: 'sarah.johnson@company.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        department: 'Human Resources',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '4',
        username: 'mike.legal',
        password: 'legal123',
        role: 'legal',
        email: 'mike.wilson@company.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        department: 'Legal',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '5',
        username: 'lisa.tech',
        password: 'tech123',
        role: 'technical',
        email: 'lisa.chen@company.com',
        firstName: 'Lisa',
        lastName: 'Chen',
        department: 'Engineering',
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ];

    localStorage.setItem('db_users', JSON.stringify(defaultUsers));
  }

  // Create default documents (empty for now, will be populated by uploads)
  private createDefaultDocuments(): void {
    const defaultDocuments: DBDocument[] = [];
    localStorage.setItem('db_documents', JSON.stringify(defaultDocuments));
  }

  // User authentication
  async authenticateUser(username: string, password: string): Promise<DBUser | null> {
    try {
      const users: DBUser[] = JSON.parse(localStorage.getItem('db_users') || '[]');
      const user = users.find(u => 
        u.username === username && 
        u.password === password && 
        u.isActive
      );

      if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        const updatedUsers = users.map(u => u.id === user.id ? user : u);
        localStorage.setItem('db_users', JSON.stringify(updatedUsers));
        return user;
      }

      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<DBUser | null> {
    try {
      const users: DBUser[] = JSON.parse(localStorage.getItem('db_users') || '[]');
      return users.find(u => u.id === id && u.isActive) || null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<DBUser[]> {
    try {
      const users: DBUser[] = JSON.parse(localStorage.getItem('db_users') || '[]');
      return users.filter(u => u.isActive);
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }

  // Create new user
  async createUser(userData: Omit<DBUser, 'id' | 'createdAt'>): Promise<DBUser> {
    try {
      const users: DBUser[] = JSON.parse(localStorage.getItem('db_users') || '[]');
      
      // Check if username already exists
      if (users.some(u => u.username === userData.username)) {
        throw new Error('Username already exists');
      }

      const newUser: DBUser = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('db_users', JSON.stringify(users));
      
      return newUser;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(id: string, updates: Partial<DBUser>): Promise<DBUser | null> {
    try {
      const users: DBUser[] = JSON.parse(localStorage.getItem('db_users') || '[]');
      const userIndex = users.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        return null;
      }

      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('db_users', JSON.stringify(users));
      
      return users[userIndex];
    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  }

  // Save document to database
  async saveDocument(doc: Omit<DBDocument, 'id'>): Promise<DBDocument> {
    try {
      const documents: DBDocument[] = JSON.parse(localStorage.getItem('db_documents') || '[]');
      
      const newDocument: DBDocument = {
        ...doc,
        id: Date.now().toString()
      };

      documents.push(newDocument);
      localStorage.setItem('db_documents', JSON.stringify(documents));
      
      return newDocument;
    } catch (error) {
      console.error('Save document error:', error);
      throw error;
    }
  }

  // Get documents by user role
  async getDocumentsByRole(role: string): Promise<DBDocument[]> {
    try {
      const documents: DBDocument[] = JSON.parse(localStorage.getItem('db_documents') || '[]');
      
      if (role === 'admin') {
        return documents.filter(d => d.isActive);
      }

      // Role-based filtering
      const roleMapping: Record<string, string[]> = {
        finance: ['Finance', 'Invoices'],
        hr: ['HR'],
        legal: ['Legal', 'Contracts'],
        technical: ['Technical Reports']
      };

      const allowedCategories = roleMapping[role] || [];
      return documents.filter(d => 
        d.isActive && allowedCategories.includes(d.category)
      );
    } catch (error) {
      console.error('Get documents error:', error);
      return [];
    }
  }

  // Get document by ID
  async getDocumentById(id: string): Promise<DBDocument | null> {
    try {
      const documents: DBDocument[] = JSON.parse(localStorage.getItem('db_documents') || '[]');
      return documents.find(d => d.id === id && d.isActive) || null;
    } catch (error) {
      console.error('Get document error:', error);
      return null;
    }
  }

  // Search documents
  async searchDocuments(query: string, role: string): Promise<DBDocument[]> {
    try {
      const documents = await this.getDocumentsByRole(role);
      const searchTerms = query.toLowerCase().split(' ');
      
      return documents.filter(doc => {
        const searchText = `${doc.title} ${doc.content} ${doc.summary} ${doc.author}`.toLowerCase();
        return searchTerms.some(term => searchText.includes(term));
      });
    } catch (error) {
      console.error('Search documents error:', error);
      return [];
    }
  }

  // Update document
  async updateDocument(id: string, updates: Partial<DBDocument>): Promise<DBDocument | null> {
    try {
      const documents: DBDocument[] = JSON.parse(localStorage.getItem('db_documents') || '[]');
      const docIndex = documents.findIndex(d => d.id === id);
      
      if (docIndex === -1) {
        return null;
      }

      documents[docIndex] = { ...documents[docIndex], ...updates };
      localStorage.setItem('db_documents', JSON.stringify(documents));
      
      return documents[docIndex];
    } catch (error) {
      console.error('Update document error:', error);
      return null;
    }
  }

  // Delete document (soft delete)
  async deleteDocument(id: string): Promise<boolean> {
    try {
      return !!(await this.updateDocument(id, { isActive: false }));
    } catch (error) {
      console.error('Delete document error:', error);
      return false;
    }
  }

  // Get database statistics
  async getStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalDocuments: number;
    documentsByCategory: Record<string, number>;
  }> {
    try {
      const users: DBUser[] = JSON.parse(localStorage.getItem('db_users') || '[]');
      const documents: DBDocument[] = JSON.parse(localStorage.getItem('db_documents') || '[]');
      
      const activeUsers = users.filter(u => u.isActive);
      const activeDocuments = documents.filter(d => d.isActive);
      
      const documentsByCategory: Record<string, number> = {};
      activeDocuments.forEach(doc => {
        documentsByCategory[doc.category] = (documentsByCategory[doc.category] || 0) + 1;
      });

      return {
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        totalDocuments: activeDocuments.length,
        documentsByCategory
      };
    } catch (error) {
      console.error('Get statistics error:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalDocuments: 0,
        documentsByCategory: {}
      };
    }
  }
}

export const databaseService = new DatabaseService();
export type { DBUser, DBDocument };
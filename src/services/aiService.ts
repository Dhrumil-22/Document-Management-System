import { Document, DocumentCategory, DocumentMetadata } from '../types';

// Mock AI service that simulates document classification, metadata extraction, and summarization
export class AIService {
  // Simulate document classification
  static async classifyDocument(content: string, fileName: string): Promise<DocumentCategory> {
    // Mock classification based on keywords and filename
    const lowerContent = content.toLowerCase();
    const lowerFileName = fileName.toLowerCase();
    
    if (lowerContent.includes('invoice') || lowerContent.includes('payment') || 
        lowerContent.includes('budget') || lowerFileName.includes('invoice')) {
      return 'Finance';
    }
    
    if (lowerContent.includes('employee') || lowerContent.includes('hiring') || 
        lowerContent.includes('salary') || lowerFileName.includes('hr')) {
      return 'HR';
    }
    
    if (lowerContent.includes('contract') || lowerContent.includes('agreement') || 
        lowerContent.includes('terms') || lowerFileName.includes('contract')) {
      return 'Contracts';
    }
    
    if (lowerContent.includes('legal') || lowerContent.includes('compliance') || 
        lowerContent.includes('regulation') || lowerFileName.includes('legal')) {
      return 'Legal';
    }
    
    if (lowerContent.includes('technical') || lowerContent.includes('software') || 
        lowerContent.includes('development') || lowerFileName.includes('tech')) {
      return 'Technical Reports';
    }
    
    return 'Other';
  }

  // Extract metadata from document content
  static async extractMetadata(content: string, fileName: string): Promise<DocumentMetadata> {
    const lines = content.split('\n');
    
    // Extract title (first non-empty line or filename)
    let title = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
    const firstLine = lines.find(line => line.trim().length > 0);
    if (firstLine && firstLine.length < 100) {
      title = firstLine.trim();
    }
    
    // Extract author
    let author = 'Unknown';
    const authorPatterns = [
      /Author:\s*(.+)/i,
      /By:\s*(.+)/i,
      /Created by:\s*(.+)/i,
      /([a-zA-Z]+\.[a-zA-Z]+@[a-zA-Z]+\.[a-zA-Z]+)/
    ];
    
    for (const pattern of authorPatterns) {
      const match = content.match(pattern);
      if (match) {
        author = match[1].trim();
        break;
      }
    }
    
    // Extract entities (simplified)
    const entities = {
      people: this.extractPeople(content),
      organizations: this.extractOrganizations(content),
      amounts: this.extractAmounts(content),
      dates: this.extractDates(content)
    };
    
    // Extract keywords
    const keywords = this.extractKeywords(content);
    
    return {
      title,
      author,
      entities,
      keywords
    };
  }

  // Generate document summary
  static async generateSummary(content: string): Promise<string> {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length <= 3) {
      return content.substring(0, 300) + (content.length > 300 ? '...' : '');
    }
    
    // Simple extractive summarization - score sentences by word frequency
    const wordFreq = this.calculateWordFrequency(content);
    const sentenceScores = sentences.map(sentence => {
      const words = sentence.toLowerCase().split(/\s+/);
      const score = words.reduce((sum, word) => sum + (wordFreq[word] || 0), 0) / words.length;
      return { sentence: sentence.trim(), score };
    });
    
    // Select top 3 sentences
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.sentence);
    
    return topSentences.join('. ') + '.';
  }

  // Generate embeddings for semantic search (mock)
  static async generateEmbedding(text: string): Promise<number[]> {
    // Mock embedding generation - in reality, this would use a transformer model
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // Mock 384-dimensional embedding
    
    // Simple hash-based mock embedding
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j);
        embedding[charCode % 384] += Math.sin(charCode * (i + 1)) * 0.1;
      }
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  // Calculate cosine similarity between embeddings
  static calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private static extractPeople(content: string): string[] {
    // Simple pattern for names (capitalized words)
    const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    const matches = content.match(namePattern) || [];
    return [...new Set(matches)].slice(0, 10);
  }

  private static extractOrganizations(content: string): string[] {
    // Look for common organization patterns
    const orgPatterns = [
      /\b[A-Z][a-z]+ (?:Corp|Corporation|Inc|LLC|Ltd|Company|Co\.)\b/g,
      /\b[A-Z][A-Z]+ [A-Z][a-z]+\b/g
    ];
    
    const orgs: string[] = [];
    for (const pattern of orgPatterns) {
      const matches = content.match(pattern) || [];
      orgs.push(...matches);
    }
    
    return [...new Set(orgs)].slice(0, 10);
  }

  private static extractAmounts(content: string): string[] {
    const amountPattern = /\$[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|dollars?)/g;
    const matches = content.match(amountPattern) || [];
    return [...new Set(matches)].slice(0, 10);
  }

  private static extractDates(content: string): string[] {
    const datePatterns = [
      /\d{1,2}\/\d{1,2}\/\d{4}/g,
      /\d{1,2}-\d{1,2}-\d{4}/g,
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g
    ];
    
    const dates: string[] = [];
    for (const pattern of datePatterns) {
      const matches = content.match(pattern) || [];
      dates.push(...matches);
    }
    
    return [...new Set(dates)].slice(0, 10);
  }

  private static extractKeywords(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordFreq = this.calculateWordFrequency(content);
    
    // Filter out common stop words
    const stopWords = new Set(['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were']);
    
    const keywords = Object.entries(wordFreq)
      .filter(([word]) => !stopWords.has(word) && word.length > 3)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
    
    return keywords;
  }

  private static calculateWordFrequency(text: string): Record<string, number> {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    const freq: Record<string, number> = {};
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1;
    }
    
    return freq;
  }
}
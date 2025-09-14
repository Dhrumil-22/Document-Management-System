import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DocumentService } from '../services/documentService';
import { SearchResult, Document } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Sparkles, Clock, User, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SearchInterfaceProps {
  onDocumentSelect: (document: Document) => void;
}

export function SearchInterface({ onDocumentSelect }: SearchInterfaceProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'semantic' | 'keyword'>('semantic');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { user } = useAuth();

  const availableCategories = ['Finance', 'HR', 'Legal', 'Contracts', 'Technical Reports', 'Invoices', 'Other'];

  const handleSearch = async () => {
    if (!query.trim() || !user) return;

    setIsSearching(true);
    try {
      let searchResults: SearchResult[];
      
      if (searchType === 'semantic') {
        searchResults = await DocumentService.semanticSearch(query, user);
      } else {
        searchResults = await DocumentService.keywordSearch(query, user);
      }

      // Apply category filter
      if (categoryFilter !== 'all') {
        searchResults = searchResults.filter(result => 
          result.document.category === categoryFilter
        );
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Finance': 'bg-green-100 text-green-800',
      'HR': 'bg-blue-100 text-blue-800',
      'Legal': 'bg-purple-100 text-purple-800',
      'Contracts': 'bg-orange-100 text-orange-800',
      'Technical Reports': 'bg-cyan-100 text-cyan-800',
      'Invoices': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents with AI-powered semantic search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
                {isSearching ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>

            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Search Type:</label>
                <Select value={searchType} onValueChange={(value: 'semantic' | 'keyword') => setSearchType(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semantic">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4" />
                        <span>Semantic</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="keyword">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4" />
                        <span>Keyword</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Category:</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {availableCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {searchType === 'semantic' && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Semantic Search Active</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  AI-powered search that understands meaning and context, not just keywords.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Search Results ({results.length})
            </h3>
            <Badge variant="outline">
              {searchType === 'semantic' ? 'AI-Powered' : 'Keyword'} Search
            </Badge>
          </div>

          {results.map((result, index) => (
            <Card 
              key={result.document.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onDocumentSelect(result.document)}
            >
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium hover:text-primary">
                          {result.document.title}
                        </h4>
                        {searchType === 'semantic' && (
                          <Badge variant="outline" className="text-xs">
                            {(result.score * 100).toFixed(1)}% match
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.snippet}
                      </p>
                    </div>
                    <Badge className={getCategoryColor(result.document.category)}>
                      {result.document.category}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{result.document.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(result.document.uploadDate)}</span>
                    </div>
                    <span>{result.document.fileName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {query && results.length === 0 && !isSearching && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No documents found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search terms or using {searchType === 'semantic' ? 'keyword' : 'semantic'} search.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      {!query && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3">Search Tips</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <Sparkles className="h-4 w-4 mt-0.5 text-blue-500" />
                <div>
                  <strong>Semantic Search:</strong> Use natural language queries like "financial reports about revenue growth" or "HR policies for remote work"
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Search className="h-4 w-4 mt-0.5 text-gray-500" />
                <div>
                  <strong>Keyword Search:</strong> Use specific terms and keywords that might appear in documents
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
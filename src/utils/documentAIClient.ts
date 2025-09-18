import { DocumentProcessorServiceClient } from "@google-cloud/documentai";

// ================== OPTIMIZED CLIENT INSTANTIATION ==================
// Singleton pattern to reuse the same client instance across requests
// This eliminates the overhead of creating new clients for each request

class DocumentAIClientSingleton {
  private static instance: DocumentProcessorServiceClient | null = null;
  private static isInitializing = false;

  /**
   * Get or create the Document AI client instance
   * Uses singleton pattern for better performance and resource management
   */
  static async getClient(): Promise<DocumentProcessorServiceClient> {
    
    // LAZY CHECK: Return existing instance if available
    if (this.instance) {
      return this.instance;
    }

    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      return this.instance!;
    }

    try {
      this.isInitializing = true;

      // Validate required environment variables
      const projectId = process.env.DOCUMENT_AI_PROJECT_ID;
      const location = process.env.DOCUMENT_AI_LOCATION || 'us';
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

      if (!projectId) {
        throw new Error('DOCUMENT_AI_PROJECT_ID environment variable is required');
      }

      if (!credentialsPath) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is required');
      }

      // Create client with optimized configuration
      this.instance = new DocumentProcessorServiceClient({
        apiEndpoint: `${location}-documentai.googleapis.com`,
        keyFilename: credentialsPath,
        projectId: projectId,
        timeout: 60000,        
        retry: { 
            retryCodes: [14, 13],
            maxRetries: 3,
        },
      });

      console.log('✅ Document AI client initialized successfully');
      return this.instance;

    } catch (error) {
      console.error('❌ Failed to initialize Document AI client:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }
}


export default DocumentAIClientSingleton;
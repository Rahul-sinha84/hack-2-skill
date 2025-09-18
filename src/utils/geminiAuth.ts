import { GoogleAuth } from 'google-auth-library';

/**
 * Manages authentication for the Gemini/Vertex AI API.
 * This singleton caches the access token to avoid re-authenticating on every request,
 * which significantly improves performance.
 */
class GeminiAuthSingleton {
  private static auth: GoogleAuth | null = null;
  private static accessToken: { token: string | null; expiry: number } | null = null;

  /**
   * Initializes the GoogleAuth instance using credentials from environment variables.
   */
  private static getAuth(): GoogleAuth {
    if (!this.auth) {
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      
      if (!credentialsPath) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is required');
      }

      this.auth = new GoogleAuth({
        keyFilename: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
    }
    return this.auth;
  }

  /**
   * Retrieves a valid access token, either from the cache or by fetching a new one.
   */
  static async getAccessToken(): Promise<string> {
    if (this.accessToken && this.accessToken.expiry > Date.now()) {
      return this.accessToken.token!;
    }

    console.log('🔄 Refreshing Gemini API access token...');
    const auth = this.getAuth();
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    
    if (!tokenResponse.token) {
      throw new Error("Failed to retrieve access token from Google Auth");
    }
    
    // Tokens are valid for 1 hour (3600s). We'll set the cache to expire
    // after 55 minutes (3300s) to be safe.
    this.accessToken = {
      token: tokenResponse.token,
      expiry: Date.now() + 3300 * 1000 
    };
    
    console.log('✅ Gemini API access token refreshed and cached.');
    return this.accessToken.token!;
  }

  /**
   * Retrieves the configured GCP Project ID from environment variables.
   */
  static getProjectId(): string {
    const projectId =  process.env.GOOGLE_CLOUD_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('GEMINI_PROJECT_ID or GOOGLE_CLOUD_PROJECT environment variable is required');
    }
    
    return projectId;
  }
}

export default GeminiAuthSingleton;

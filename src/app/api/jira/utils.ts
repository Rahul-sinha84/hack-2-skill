export enum JiraCookieKeys {
  ACCESS_TOKEN = "jira_access_token",
  REFRESH_TOKEN = "jira_refresh_token",
}

export const refreshAccessToken = async (
  refreshToken: string
): Promise<{
  accessToken: string;
  expiresIn: number;
}> => {
  try {
    const response = await fetch("https://auth.atlassian.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        client_id: process.env.JIRA_CLIENT_ID,
        grant_type: "refresh_token",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to refresh access token");
    }

    const { access_token, expires_in } = data;

    return { accessToken: access_token, expiresIn: expires_in };
  } catch (err: any) {
    console.error(err);
    throw new Error(err);
  }
};

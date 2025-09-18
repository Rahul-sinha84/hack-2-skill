export enum JiraCookieKeys {
  ACCESS_TOKEN = "jira_access_token",
  REFRESH_TOKEN = "jira_refresh_token",
  CLOUD_ID = "jira_cloud_id",
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

export const getCloudId = async (accessToken: string): Promise<string> => {
  try {
    const response = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get cloud id");
    }

    const data = await response.json();
    return data[0].id;
  } catch (err: any) {
    console.error(err);
    throw new Error(err);
  }
};

import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const { userId } = await req.json();

    if (!userId) throw new Error("User ID is required");

    const scopes = [
      "read:jira-work",
      "manage:jira-project",
      "manage:jira-configuration",
      "read:jira-user",
      "write:jira-work",
      "manage:jira-webhook",
      "manage:jira-data-provider",
      // for refresh token
      "offline_access",
    ];

    const encodedScopes = scopes
      .map((scope) => encodeURIComponent(scope))
      .join(" ");

    const encodedRedirectUri = encodeURIComponent(
      process.env.JIRA_REDIRECT_URI!
    );

    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${process.env.JIRA_CLIENT_ID}&scope=${encodedScopes}&redirect_uri=${encodedRedirectUri}&state=${userId}&response_type=code&prompt=consent`;

    return NextResponse.json({ authUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

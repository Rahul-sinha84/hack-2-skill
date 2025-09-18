import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { JiraCookieKeys } from "../utils";

export const POST = async (req: Request) => {
  try {
    const cookieStore = await cookies();

    const jiraAccessToken = cookieStore.get(JiraCookieKeys.ACCESS_TOKEN)?.value;
    const jiraRefreshToken = cookieStore.get(
      JiraCookieKeys.REFRESH_TOKEN
    )?.value;

    if (jiraAccessToken && jiraRefreshToken) {
      return NextResponse.json({}, { status: 200 });
    }

    const { code, userId } = await req.json();

    if (!code || !userId) {
      throw new Error("Code and userId are required");
    }

    const accessTokenResponse = await fetch(
      "https://auth.atlassian.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          client_id: process.env.JIRA_CLIENT_ID,
          client_secret: process.env.JIRA_CLIENT_SECRET,
          redirect_uri: process.env.JIRA_REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      }
    );

    const accessTokenData = await accessTokenResponse.json();

    const { access_token, expires_in, refresh_token } = accessTokenData;

    // setting tokens in cookies
    cookieStore.set({
      name: JiraCookieKeys.ACCESS_TOKEN,
      value: access_token,
      expires: new Date(Date.now() + expires_in * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    cookieStore.set({
      name: JiraCookieKeys.REFRESH_TOKEN,
      value: refresh_token,
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json({}, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

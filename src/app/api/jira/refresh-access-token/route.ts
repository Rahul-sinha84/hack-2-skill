import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { JiraCookieKeys } from "../utils";

export const GET = async () => {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(JiraCookieKeys.REFRESH_TOKEN)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token found" },
        { status: 401 }
      );
    }

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
      console.log({ data });
      return NextResponse.json(
        { error: "Failed to refresh access token" },
        { status: 401 }
      );
    }

    const { access_token, expires_in, refresh_token } = data;

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

    return NextResponse.json({}, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

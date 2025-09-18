import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { JiraCookieKeys, refreshAccessToken } from "../utils";

export const GET = async () => {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get(JiraCookieKeys.ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(JiraCookieKeys.REFRESH_TOKEN)?.value;

    if (!accessToken) {
      if (!refreshToken)
        return NextResponse.json(
          { error: "No access token found" },
          { status: 401 }
        );

      // refresh token available
      // ? send 401 error always when this api fails
      try {
        const { accessToken: refreshedAccessToken, expiresIn } =
          await refreshAccessToken(refreshToken);
        accessToken = refreshedAccessToken;
        cookieStore.set({
          name: JiraCookieKeys.ACCESS_TOKEN,
          value: accessToken,
          expires: new Date(Date.now() + expiresIn * 1000),
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });
      } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 401 });
      }
    }

    const uri = `${process.env.JIRA_CLIENT_URL}/rest/api/3/project`;

    const response = await fetch(uri, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const projectsData = await response.json();

    if (!response.ok) {
      throw new Error(
        projectsData.errorMessages?.join(", ") || "Failed to get projects"
      );
    }

    // Return simplified project data
    const projects = projectsData.map((project: any) => ({
      key: project.key,
      name: project.name,
      id: project.id,
    }));

    return NextResponse.json({ projects });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

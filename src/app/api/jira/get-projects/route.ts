import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCloudId, JiraCookieKeys, refreshAccessToken } from "../utils";

export const GET = async () => {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get(JiraCookieKeys.ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(JiraCookieKeys.REFRESH_TOKEN)?.value;
    let cloudId = cookieStore.get(JiraCookieKeys.CLOUD_ID)?.value;

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

    if (!cloudId) {
      cloudId = await getCloudId(accessToken);
      cookieStore.set({
        name: JiraCookieKeys.CLOUD_ID,
        value: cloudId,
        expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    }

    const uri = `${process.env.JIRA_CLIENT_URL}/${cloudId}/rest/api/3/project`;

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

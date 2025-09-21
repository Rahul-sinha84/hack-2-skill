import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCloudId, JiraCookieKeys, refreshAccessToken } from "../../utils";

export const POST = async (request: Request) => {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get(JiraCookieKeys.ACCESS_TOKEN)?.value;
    let cloudId = cookieStore.get(JiraCookieKeys.CLOUD_ID)?.value;
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

    if (!cloudId) {
      cloudId = await getCloudId(accessToken);
      cookieStore.set({
        name: JiraCookieKeys.CLOUD_ID,
        value: cloudId,
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    }

    const { projectId } = await request.json();

    const uri = `${process.env.JIRA_CLIENT_URL}/${cloudId}/rest/api/3/issuetype/project?projectId=${projectId}`;

    const response = await fetch(uri, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const issueTypeData = await response.json();

    if (!response.ok) {
      console.error(issueTypeData);
      throw new Error(
        issueTypeData.errorMessages?.join(", ") ||
          "Failed to get issue type data"
      );
    }

    // // Extract issue types from issue type data
    // const issueTypes = issueTypeData.issueTypes.map((issueType: any) => ({
    //   id: issueType.id,
    //   name: issueType.name,
    //   description: issueType.description,
    //   iconUrl: issueType.iconUrl,
    // }));

    return NextResponse.json({ issueTypeData });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

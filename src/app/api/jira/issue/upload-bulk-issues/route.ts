import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCloudId, JiraCookieKeys, refreshAccessToken } from "../../utils";

export const POST = async (req: Request) => {
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
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    }

    const { testCases, projectKey, issueType } = await req.json();

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: "Test cases array is required" },
        { status: 400 }
      );
    }

    if (testCases.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 issues can be created in a single request" },
        { status: 400 }
      );
    }

    // Prepare the bulk create payload
    const issues = testCases.map((testCase) => ({
      fields: {
        project: {
          key: projectKey,
        },
        summary: testCase.title,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: testCase.content,
                },
              ],
            },
          ],
        },
        issuetype: {
          name: issueType,
        },
        // Add labels if needed
        labels: ["Knull"],
        // Add priority if needed
        priority: testCase.priority ? { name: testCase.priority } : undefined,
      },
    }));

    console.log({ issues: JSON.stringify(issues, null, 2) });

    // Create the bulk create request
    const jiraResponse = await fetch(
      `${process.env.JIRA_CLIENT_URL}/${cloudId}/rest/api/3/issue/bulk`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          issueUpdates: issues,
        }),
      }
    );

    const result = await jiraResponse.json();

    if (!jiraResponse.ok) {
      console.log({ result: JSON.stringify(result, null, 2) });
      throw new Error(
        result.errorMessages?.join(", ") || "Failed to create test cases"
      );
    }

    return NextResponse.json({
      success: true,
      createdIssues:
        result.issues?.map((issue: any) => ({
          key: issue.key,
          id: issue.id,
          summary: issue.fields?.summary,
        })) || [],
      errors: result.errors || [],
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

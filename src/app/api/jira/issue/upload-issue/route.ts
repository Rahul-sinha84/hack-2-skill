// /src/app/api/jira/create-test-case/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { JiraCookieKeys } from "../../utils";

export const POST = async (req: Request) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(JiraCookieKeys.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }

    const { testCase, projectKey } = await req.json();

    // First, get the current user's accountId
    // const userResponse = await fetch(
    //   `${process.env.JIRA_CLIENT_URL}/rest/api/3/myself`,
    //   {
    //     method: "GET",
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       Accept: "application/json",
    //     },
    //   }
    // );

    // const userData = await userResponse.json();
    // const assigneeId = userData.accountId;

    // Create the test case
    const jiraResponse = await fetch(
      `${process.env.JIRA_CLIENT_URL}/rest/api/3/issue`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fields: {
            project: {
              key: "DP",
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
              name: "Task",
            },
            // assignee: {
            //   accountId: assigneeId,
            // },
          },
        }),
      }
    );

    const result = await jiraResponse.json();

    if (!jiraResponse.ok) {
      console.log({ result });
      throw new Error(
        result.errorMessages?.join(", ") || "Failed to create test case"
      );
    }

    return NextResponse.json({
      success: true,
      issueKey: result.key,
      issueId: result.id,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

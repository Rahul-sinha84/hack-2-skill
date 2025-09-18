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

    const { testCases, projectKey, issueType = "Task" } = await req.json();

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
          key: projectKey || "DP", // Use provided projectKey or default to "DP"
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
      `${process.env.JIRA_CLIENT_URL}/rest/api/3/issue/bulk`,
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

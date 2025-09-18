import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { JiraCookieKeys } from "../../utils";

export const GET = async () => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(JiraCookieKeys.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }

    const uri = `${process.env.JIRA_CLIENT_URL}/rest/api/3/issuetype/project?projectId=10000`;

    const response = await fetch(uri, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const issueTypeData = await response.json();

    if (!response.ok) {
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

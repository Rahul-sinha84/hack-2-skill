import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { JiraCookieKeys } from "../utils";

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

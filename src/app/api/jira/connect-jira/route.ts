import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const { authUrl } = await req.json();

    if (!authUrl) throw new Error("Auth URL is required");

    const jiraConnect = await fetch(authUrl);
    const jiraConnectData = await jiraConnect.json();

    return NextResponse.json({ jiraConnectData });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

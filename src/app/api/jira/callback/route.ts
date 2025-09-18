import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    console.log({ code, url });

    return NextResponse.json({ message: "Jira callback successful" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

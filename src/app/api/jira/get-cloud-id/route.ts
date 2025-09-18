import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { JiraCookieKeys } from "../utils";

export const GET = async (request: Request) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(JiraCookieKeys.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token not found" },
        { status: 401 }
      );
    }

    const response = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

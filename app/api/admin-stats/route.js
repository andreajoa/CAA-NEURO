import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { d1Query } from "../../../lib/d1";

export async function GET() {

  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const email=user?.emailAddresses?.[0]?.emailAddress||"";

  if(email!=="tdahma2@gmail.com"){
    return NextResponse.json(
      {error:"Forbidden"},
      {status:403}
    );
  }

  const [
    patients,
    sessions,
    cards,
    logs
  ]=await Promise.all([

    d1Query(
      "SELECT COUNT(*) as total FROM patients",[]
    ),

    d1Query(
      "SELECT COUNT(*) as total FROM sessions",[]
    ),

    d1Query(
      "SELECT COUNT(*) as total FROM cards",[]
    ),

    d1Query(
      "SELECT COUNT(*) as total FROM app_logs",[]
    )

  ]);

  return NextResponse.json({

    patients:patients?.[0]?.total||0,
    sessions:sessions?.[0]?.total||0,
    cards:cards?.[0]?.total||0,
    logs:logs?.[0]?.total||0

  });

}

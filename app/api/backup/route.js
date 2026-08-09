import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { d1Query } from "../../../lib/d1";
import { isAdmin } from "../../../lib/admin";

export async function GET(){

const {userId}=await auth();

if(!userId || !isAdmin(userId)){
return NextResponse.json(
{error:"Forbidden"},
{status:403}
)
}

try{

const patients=await d1Query(
"SELECT * FROM patients",
[]
)

const sessions=await d1Query(
"SELECT * FROM sessions",
[]
)

const cards=await d1Query(
"SELECT * FROM cards",
[]
)

const logs=await d1Query(
"SELECT * FROM app_logs",
[]
)

return NextResponse.json({
createdAt:new Date(),
patients,
sessions,
cards,
logs
})

}catch(e){

return NextResponse.json(
{error:e.message},
{status:500}
)

}

}

import { auth,currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { d1Query } from "../../../lib/d1";

export async function POST(){

const {userId}=await auth();
const user=await currentUser();

if(!userId){
return NextResponse.json(
{error:"Unauthorized"},
{status:401}
)
}

const email=user?.emailAddresses?.[0]?.emailAddress||"";

if(email!=="tdahma2@gmail.com"){
return NextResponse.json(
{error:"Forbidden"},
{status:403}
)
}

try{

const snapshot={

createdAt:new Date(),

patients:await d1Query(
"SELECT * FROM patients",[]
),

sessions:await d1Query(
"SELECT * FROM sessions",[]
),

cards:await d1Query(
"SELECT * FROM cards",[]
),

logs:await d1Query(
"SELECT * FROM app_logs",[]
)

};

await fetch(
process.env.R2_ENDPOINT+"/backups/"+Date.now()+".json",
{
method:"PUT",
headers:{
Authorization:`Bearer ${process.env.CLOUDFLARE_D1_API_TOKEN}`,
"Content-Type":"application/json"
},
body:JSON.stringify(snapshot)
}
);

return NextResponse.json({
success:true
})

}catch(e){

return NextResponse.json(
{
success:false,
error:e.message
},
{
status:500
}
)

}

}

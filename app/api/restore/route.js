import { auth,currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { d1Query } from "../../../lib/d1";

export async function POST(req){

const {userId}=await auth();
const user=await currentUser();

const email=user?.emailAddresses?.[0]?.emailAddress||"";

if(!userId || email!=="tdahma2@gmail.com"){
return NextResponse.json(
{error:"Forbidden"},
{status:403}
)
}

try{

const body=await req.json();

const backupId=body.backupId;

const data=await d1Query(
"SELECT snapshot FROM backups WHERE id=?",
[backupId]
);

if(!data?.length){
return NextResponse.json(
{error:"Backup not found"},
{status:404}
)
}

const snapshot=JSON.parse(
data[0].snapshot
);

return NextResponse.json({
success:true,
preview:{
patients:snapshot.patients?.length||0,
sessions:snapshot.sessions?.length||0,
cards:snapshot.cards?.length||0
}
});

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

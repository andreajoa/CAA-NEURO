"use client";

import { useEffect } from "react";

export default function ErrorTracker(){

useEffect(()=>{

const oldError=window.onerror;

window.onerror=async function(message,source,line,col,error){

try{

await fetch("/api/logs",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
level:"error",
source:source||"frontend",
message:String(message||"Unknown"),
details:{
line,
col,
stack:error?.stack||""
}
})
})

}catch(e){}

if(oldError){
return oldError(message,source,line,col,error)
}

}

},[])

return null

}

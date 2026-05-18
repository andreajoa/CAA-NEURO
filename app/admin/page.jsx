"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function AdminPage(){

const {user,isLoaded}=useUser();

const [stats,setStats]=useState(null);
const [logs,setLogs]=useState([]);
const [loading,setLoading]=useState(false);

const email=user?.primaryEmailAddress?.emailAddress;

async function loadData(){

try{

const [statsRes,logsRes]=await Promise.all([
fetch("/api/admin-stats"),
fetch("/api/logs")
]);

const statsData=await statsRes.json();
const logsData=await logsRes.json();

setStats(statsData);
setLogs(logsData.logs||[]);

}catch(e){
console.error(e);
}

}

async function createBackup(){

setLoading(true);

try{

const res=await fetch(
"/api/backup-auto",
{
method:"POST"
}
);

const data=await res.json();

if(data.success){
alert("Backup criado");
}else{
alert(data.error||"Erro backup");
}

}catch(e){
alert("Erro ao criar backup");
}

setLoading(false);

}

async function downloadBackup(){

window.open(
"/api/backup",
"_blank"
);

}

useEffect(()=>{

if(
isLoaded &&
email==="tdahma2@gmail.com"
){
loadData();
}

},[isLoaded,email]);

if(!isLoaded){
return <main style={{padding:40}}>Carregando...</main>;
}

if(email!=="tdahma2@gmail.com"){
return(
<main style={{padding:40}}>
<h1>Acesso restrito</h1>
</main>
)
}

return(

<main style={{
padding:"40px",
maxWidth:"1200px",
margin:"0 auto"
}}>

<h1>Painel Administrativo</h1>

<div style={{
display:"flex",
gap:"10px",
marginBottom:"30px"
}}>

<button
onClick={createBackup}
disabled={loading}
>
{loading?"Criando...":"Criar backup"}
</button>

<button
onClick={downloadBackup}
>
Baixar backup
</button>

</div>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(4,1fr)",
gap:"20px",
marginBottom:"30px"
}}>

{[
["Pacientes",stats?.patients],
["Sessões",stats?.sessions],
["Cards",stats?.cards],
["Logs",stats?.logs]
].map(([title,value])=>(

<div
key={title}
style={{
padding:"20px",
background:"#fff",
borderRadius:"20px"
}}
>

<h3>{title}</h3>
<h2>{value ?? 0}</h2>

</div>

))}

</div>

<div
style={{
background:"#fff",
padding:"20px",
borderRadius:"20px"
}}
>

<h2>Últimos logs</h2>

{logs.slice(0,10).map(log=>(

<div
key={log.id}
style={{
padding:"12px",
borderBottom:"1px solid #ddd"
}}
>

<b>{log.level}</b>
<p>{log.message}</p>

</div>

))}

</div>

</main>

)

}

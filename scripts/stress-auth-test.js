const urls=[
"https://www.adhdautism.online/api/patients",
"https://www.adhdautism.online/api/sessions",
"https://www.adhdautism.online/api/cards"
];

const users=250;
const requestsPerUser=4;

async function hit(url){

const start=Date.now();

try{

const res=await fetch(url);

return{
ok:true,
status:res.status,
ms:Date.now()-start
}

}catch(e){

return{
ok:false,
error:e.message
}

}

}

async function run(){

const jobs=[];

for(let i=0;i<users;i++){

for(let j=0;j<requestsPerUser;j++){

jobs.push(
hit(
urls[
j%urls.length
]
)
)

}

}

const result=
await Promise.all(jobs);

const ok=
result.filter(
r=>r.ok
).length;

const fail=
result.filter(
r=>!r.ok
).length;

const avg=
Math.round(

result
.filter(r=>r.ms)
.reduce(
(a,b)=>a+b.ms,
0
)
/result.length

);

console.log({
requests:result.length,
ok,
fail,
avgMs:avg
});

}

run();

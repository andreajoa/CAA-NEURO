const sharp=require("sharp");
const fs=require("fs");
const path=require("path");

const dir="public/cards";

async function walk(folder){
const files=fs.readdirSync(folder);

for(const f of files){

const full=path.join(folder,f);

if(fs.statSync(full).isDirectory()){
await walk(full);
continue;
}

if(!/\.(png|jpg|jpeg)$/i.test(f)) continue;

try{

const out=full.replace(/\.(png|jpg|jpeg)$/i,".webp");

await sharp(full)
.resize({
width:512,
height:512,
fit:"inside",
withoutEnlargement:true
})
.webp({
quality:72
})
.toFile(out);

fs.unlinkSync(full);

console.log("✅",f);

}catch(e){
console.log("❌",f,e.message);
}

}
}

walk(dir);

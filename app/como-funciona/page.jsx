import Link from "next/link";
export default function Page() {
  return (
    <main style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#f5f7fb",fontFamily:"Arial,sans-serif"}}>
      <h1 style={{color:"#06391f",fontSize:32,marginBottom:16}}>Em breve</h1>
      <p style={{color:"#405047",marginBottom:32}}>Esta página está sendo preparada com carinho.</p>
      <Link href="/" style={{background:"#1d9e75",color:"white",padding:"12px 28px",borderRadius:8,textDecoration:"none",fontWeight:"bold"}}>← Voltar</Link>
    </main>
  );
}

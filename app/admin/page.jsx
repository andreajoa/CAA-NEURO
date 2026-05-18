async function getData(endpoint){
  const res=await fetch(process.env.NEXT_PUBLIC_BASE_URL + endpoint,{
    cache:"no-store"
  });

  return res.json();
}

export default async function AdminPage(){

  const logs=await getData("/api/logs");

  return (
    <main style={{
      padding:"40px",
      maxWidth:"1200px",
      margin:"0 auto"
    }}>

      <h1 style={{
        fontSize:"40px",
        marginBottom:"30px"
      }}>
        Painel administrativo
      </h1>

      <div style={{
        background:"#fff",
        padding:"20px",
        borderRadius:"20px"
      }}>

      <h2>Últimos logs</h2>

      {logs.logs?.map(log=>(
        <div
        key={log.id}
        style={{
          borderBottom:"1px solid #ddd",
          padding:"15px"
        }}
        >
          <b>{log.level}</b>
          <p>{log.source}</p>
          <p>{log.message}</p>
        </div>
      ))}

      </div>

    </main>
  )
}

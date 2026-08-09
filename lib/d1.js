function getD1Config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const token = process.env.CLOUDFLARE_D1_API_TOKEN;

  const missing = [
    ["CLOUDFLARE_ACCOUNT_ID", accountId],
    ["CLOUDFLARE_D1_DATABASE_ID", databaseId],
    ["CLOUDFLARE_D1_API_TOKEN", token],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length) {
    throw new Error(`Banco de dados não configurado: ${missing.join(", ")}`);
  }

  return { accountId, databaseId, token };
}

async function executeD1(sql, params = []) {
  const { accountId, databaseId, token } = getD1Config();

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    }
  );

  const data = await res.json();

  if (!res.ok || !data.success) {
    console.error("D1 error:", data);
    throw new Error("D1 query failed");
  }

  const result = data.result?.[0] || {};
  return {
    results: result.results || [],
    meta: result.meta || {},
    success: true,
  };
}

export async function d1Query(sql, params = []) {
  const result = await executeD1(sql, params);
  return result.results;
}

/**
 * Retorna o binding D1 nativo quando a aplicação roda no Cloudflare e um
 * adaptador compatível quando roda no Next.js/Vercel. Assim todas as rotas
 * usam a mesma API (`prepare().bind().all/first/run`) nos dois ambientes.
 */
export function getDatabase(request) {
  const binding = request?.env?.DB || globalThis.__D1_DB;
  if (binding?.prepare) return binding;

  return {
    prepare(sql) {
      let params = [];

      const statement = {
        bind(...values) {
          params = values;
          return statement;
        },
        async all() {
          return executeD1(sql, params);
        },
        async first(column) {
          const { results } = await executeD1(sql, params);
          const row = results[0] ?? null;
          return column && row ? row[column] ?? null : row;
        },
        async run() {
          return executeD1(sql, params);
        },
      };

      return statement;
    },
  };
}

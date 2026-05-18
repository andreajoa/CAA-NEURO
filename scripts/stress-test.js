const urls = [
  "https://www.adhdautism.online/",
  "https://www.adhdautism.online/app",
  "https://www.adhdautism.online/api/images/library",
];

const users = 100;
const requestsPerUser = 10;

async function hit(url) {
  const start = Date.now();

  try {
    const res = await fetch(url);

    return {
      url,
      status: res.status,
      ms: Date.now() - start,
      ok: true,
    };
  } catch (e) {
    return {
      url,
      ok: false,
      error: e.message,
    };
  }
}

async function run() {
  const jobs = [];

  for (let i = 0; i < users; i++) {
    for (let j = 0; j < requestsPerUser; j++) {
      const url = urls[j % urls.length];
      jobs.push(hit(url));
    }
  }

  const results = await Promise.all(jobs);

  const ok = results.filter(r => r.ok).length;
  const fail = results.filter(r => !r.ok).length;

  const times = results
    .filter(r => r.ms)
    .map(r => r.ms);

  const avg =
    times.reduce((a,b)=>a+b,0) / times.length;

  console.log({
    totalRequests: results.length,
    ok,
    fail,
    avgMs: Math.round(avg)
  });
}

run();

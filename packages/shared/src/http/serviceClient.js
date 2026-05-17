async function serviceGet(baseUrl, path, headers = {}) {
  const res = await fetch(`${baseUrl}${path}`, { headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.message || res.statusText);
    err.statusCode = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

module.exports = { serviceGet };

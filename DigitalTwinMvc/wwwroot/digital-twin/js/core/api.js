DT.api = {
  async request(method, path, body) {
    const session = DT.session.get();
    const token = session ? session.token : null;
    if (CONFIG.USE_MOCK) return MockServer.handle(method, path, body, token);

    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = "Bearer " + token;
    const res = await fetch(CONFIG.API_BASE_URL + path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined });
    return DT.api.read(res);
  },
  async read(res) {
    let data = null;
    try { data = await res.json(); } catch (e) { /* empty body */ }
    if (!res.ok) {
      const err = new Error((data && data.message) || "Request failed (" + res.status + ")");
      err.status = res.status;
      throw err;
    }
    return data;
  },

  async upload(path, file) {
    const session = DT.session.get();
    const token = session ? session.token : null;
    if (CONFIG.USE_MOCK) return MockServer.handle("POST", path, { fileName: file.name }, token);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(CONFIG.API_BASE_URL + path, { method: "POST", headers: token ? { Authorization: "Bearer " + token } : {}, body: form });
    return DT.api.read(res);
  },
  get: path => DT.api.request("GET", path),
  post: (path, body) => DT.api.request("POST", path, body || {}),
  patch: (path, body) => DT.api.request("PATCH", path, body || {}),
  del: path => DT.api.request("DELETE", path)
};

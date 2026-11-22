DT.models.Auth = {
  login: (email, password) => DT.api.post("/api/auth/login", { email: email, password: password })
};

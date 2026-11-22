DT.views.shared.login = {
  render() {
    return `<main class="login"><div class="card">
      <a class="brand" href="index.html" style="margin-bottom:18px"><i></i>Digital Twin</a>
      <h1 style="font-size:24px">Log in</h1><p class="sub">Use your university account.</p>
      <div class="alert" role="alert" id="err" hidden style="margin-top:14px"></div>
      <form id="form">
        <label class="f" for="em">University email</label><input id="em" type="email" placeholder="name@fa-hists.edu.eg" required>
        <label class="f" for="pw">Password</label><input id="pw" type="password" required>
        <button class="btn" style="width:100%;margin-top:20px" type="submit">Log in</button></form>
      <p class="sub sm" style="margin-top:16px">Demo accounts (password 1234):<br>omar@fa-hists.edu.eg · hayam@fa-hists.edu.eg · admin@fa-hists.edu.eg</p>
    </div></main>`;
  },
  bind() {
    DT.$("#form").addEventListener("submit", e => {
      e.preventDefault();
      DT.controllers.AuthController.login(DT.$("#em").value, DT.$("#pw").value);
    });
  },
  showError(message) {
    const box = DT.$("#err");
    box.textContent = message;
    box.hidden = false;
  }
};

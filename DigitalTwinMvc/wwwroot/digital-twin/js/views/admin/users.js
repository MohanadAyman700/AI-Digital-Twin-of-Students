DT.views.admin.users = {
  render() {
    return DT.head("Manage Users", "Add, disable or remove accounts") + `<div class="grid g21">
      <div class="card"><div class="tbl"><table><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody id="ut"></tbody></table></div></div>
      <div class="card"><h2>Add user</h2><form id="uf">
        <label class="f" for="un">Name</label><input id="un" required>
        <label class="f" for="ue">Email</label><input id="ue" type="email" required>
        <label class="f" for="up">Password</label><input id="up" type="password" minlength="4" required>
        <label class="f" for="ur">Role</label><select id="ur"><option>Student</option><option>Advisor</option><option>Admin</option></select>
        <button class="btn" style="margin-top:12px" type="submit">Add user</button></form></div></div>`;
  },
  bind() {
    DT.$("#uf").addEventListener("submit", e => {
      e.preventDefault();
      DT.controllers.UserController.add({ name: DT.$("#un").value.trim(), email: DT.$("#ue").value.trim(), password: DT.$("#up").value, role: DT.$("#ur").value });
    });
  },
  fill(users, myId) {
    DT.$("#ut").innerHTML = users.map(u => `<tr><td><b>${DT.esc(u.name)}</b><div class="sub sm">${DT.esc(u.email)}</div></td><td>${DT.esc(u.role)}</td>
      <td>${DT.pill(u.active ? "Active" : "Disabled", u.active ? "p-green" : "p-red")}</td><td>${u.id === myId ? '<span class="sub sm">You</span>' :
      `<button class="btn ghost sm" data-t="${DT.esc(u.id)}" data-a="${u.active}">${u.active ? "Disable" : "Enable"}</button> <button class="btn danger sm" data-d="${DT.esc(u.id)}">Delete</button>`}</td></tr>`).join("");
    DT.$$("[data-t]").forEach(b => b.onclick = () => DT.controllers.UserController.toggle(b.dataset.t, b.dataset.a !== "true"));
    DT.$$("[data-d]").forEach(b => b.onclick = () => DT.controllers.UserController.remove(b.dataset.d));
  },
  resetForm() { DT.$("#uf").reset(); }
};

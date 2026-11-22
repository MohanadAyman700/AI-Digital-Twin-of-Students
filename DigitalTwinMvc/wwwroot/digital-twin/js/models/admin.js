DT.models.Admin = {
  dashboard: () => DT.api.get("/api/admin/dashboard"),
  users: role => DT.api.get("/api/admin/users" + (role ? "?role=" + role : "")),
  addUser: user => DT.api.post("/api/admin/users", user),
  setActive: (id, active) => DT.api.patch("/api/admin/users/" + id, { active: active }),
  deleteUser: id => DT.api.del("/api/admin/users/" + id),
  grades: () => DT.api.get("/api/admin/grades"),
  saveGrade: (studentId, course, score) => DT.api.post("/api/admin/grades", { studentId: studentId, course: course, score: score })
};

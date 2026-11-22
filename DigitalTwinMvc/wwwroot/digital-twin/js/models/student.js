DT.models.Student = {
  dashboard: () => DT.api.get("/api/student/dashboard"),
  profile: () => DT.api.get("/api/student/profile"),
  progress: () => DT.api.get("/api/student/progress"),
  ask: question => DT.api.post("/api/student/ask", { question: question }),
  askVideo: question => DT.api.post("/api/student/ask/video", { question: question })
};

DT.models.Advisor = {
  dashboard: () => DT.api.get("/api/advisor/dashboard"),
  students: (q, risk, atRisk) => DT.api.get("/api/advisor/students?q=" + encodeURIComponent(q || "") + "&risk=" + (risk || "all") + "&atRisk=" + (atRisk ? "true" : "false")),
  predictions: id => DT.api.get("/api/advisor/students/" + encodeURIComponent(id) + "/predictions"),
  progress: id => DT.api.get("/api/advisor/students/" + encodeURIComponent(id) + "/progress"),
  plans: id => DT.api.get("/api/advisor/plans?studentId=" + encodeURIComponent(id)),
  createPlan: (studentId, type, details) => DT.api.post("/api/advisor/plans", { studentId: studentId, type: type, details: details }),
  guidanceSent: () => DT.api.get("/api/advisor/guidance"),
  sendGuidance: (studentId, message) => DT.api.post("/api/advisor/guidance", { studentId: studentId, message: message })
};

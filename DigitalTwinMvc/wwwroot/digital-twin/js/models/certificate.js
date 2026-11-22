DT.models.Certificate = {
  scan: file => DT.api.upload("/api/student/certificates/ocr", file),
  submit: (fileName, skill, hours) => DT.api.post("/api/student/certificates", { fileName: fileName, skill: skill, hours: hours }),
  list: () => DT.api.get("/api/admin/credentials"),
  decide: (id, decision) => DT.api.post("/api/admin/credentials/" + id + "/decision", { decision: decision })
};

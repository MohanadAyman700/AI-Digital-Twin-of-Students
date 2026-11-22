DT.controllers.CertificateController = {
  async upload() {
    DT.mount(DT.views.student.upload.render(), DT.views.student.upload.bind);
    await DT.controllers.CertificateController.loadMine();
  },
  async loadMine() {
    const profile = await DT.models.Student.profile();
    DT.views.student.upload.fillMine(profile.certificates);
  },
  scan(file) {
    return DT.guard(async () => {
      DT.views.student.upload.showScanning(file.name);
      const ocr = await DT.models.Certificate.scan(file); // Extract data using OCR
      DT.views.student.upload.showResult(file, ocr);
    });
  },
  submit(fileName, ocr) {
    return DT.guard(async () => {
      await DT.models.Certificate.submit(fileName, ocr.skill, ocr.hours);
      DT.views.student.upload.clearScan();
      await DT.controllers.CertificateController.loadMine();
      DT.toast("Certificate sent for verification.");
    });
  }
};

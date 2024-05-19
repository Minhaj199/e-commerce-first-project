(function () {
  createPdf();
})();

async function createPdf() {
  const content = document.querySelector(".table-form");

  const options = {
    filename: "invoiceGenerateDemo.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a3", orientation: "portrait" },
  };
  await html2pdf().from(content).set(options).save();
}

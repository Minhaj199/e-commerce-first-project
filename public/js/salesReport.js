function filter(variable) {
  console.log(variable);
  location.href = `/admin/salesFiltering?filter=${variable}`;
}
function customFilter() {
  const starting = document.getElementById("starting").value;
  const ending = document.getElementById("End").value;

  const startingDate = new Date(starting);
  const endingDate = new Date(ending);

  if (starting === "" || ending === "") {
    alert("blank not allowed");
  } else if (startingDate > endingDate) {
    alert("Date not accurate");
  } else {
    location.href = `/admin/salesFiltering?starting=${starting}&ending=${ending}`;
  }
}
document.getElementById("all").addEventListener("click", () => {
  location.href = "/admin/getPages?from=Sale report";
});

// modalin --- custom date----
const modalin = document.getElementById("myModal");
const btn = document.querySelector(".close");

function showModaling() {
  modalin.style.display = "block";
}
btn.onclick = () => {
  modalin.style.display = "none ";
};

async function createPdf() {
  const content = document.querySelector(".pdf");

  console.log(content);
  const options = {
    filename: "handlebars_to_pdf.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a3", orientation: "portrait" },
  };
  await html2pdf().from(content).set(options).save();
  location.reload();
}
function createExell() {
  const table = document.querySelector(".table");

  const worksheet = XLSX.utils.table_to_sheet(table);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  XLSX.writeFile(workbook, "excel-file.xlsx");
}

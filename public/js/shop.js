document.querySelector(".brand-filter").addEventListener("click", () => {
 
  const checkNod = document.querySelectorAll(".bran-checkbox");
  let minValue = parseInt(document.getElementById("minAmount").value) || 0;
  let maxValue =
    parseInt(document.getElementById("maxAmount").value) || 100000000;
  const category = document
    .querySelector(".brand-filter")
    .getAttribute("data-cat");
  const assOrDessNod = document.querySelectorAll(".assDess");

  if (minValue < 0) {

    showToast("minimum value should not be negetive value");
  } else if (maxValue <= 0) {

    showToast("maximum value should not be less than zero");
  } else if (maxValue <= minValue) {
    showToast("maximum value should be greater than minimum value");
  } else if (maxValue === isNaN || maxValue === isNaN) {
    showToast("Only number allowed");
  } else {
    let brand = [];
    let assOrDes = "";


    assOrDessNod.forEach((values) => {
      if (values.checked) {
        assOrDes = values.value;
      }
    });

    checkNod.forEach((values) => {
      if (values.checked) {
        brand.push(values.value);
      }
    });

    const stringBrand = JSON.stringify(brand);

    let sort = 0;
    if (assOrDes === "Low To High") {
      sort = 1;
    } else {
      sort = -1;
    }

    if (category) {
      console.log(category,maxValue,minValue,sort,stringBrand)
      return
      location.href = `/user/cat?cat=${category}&maxValue=${maxValue}&minValue=${minValue}&sort=${sort}&from=sorting&brand=${stringBrand}`;
    } else {
      location.href = `/user/all?maxValue=${maxValue}&minValue=${minValue}&sort=${sort}&from=sorting&brand=${stringBrand}`;
    }
  }
});



function pagenation(pageNumber) {
  const category = document
    .querySelector(".brand-filter")
    .getAttribute("data-cat");
  if (category) {
    location.href = `/user/cat?cat=${category}&page=${pageNumber}`;
  } else {
    location.href = `/user/all?page=${pageNumber}`;
  }
}

function showToast(message) {

  Toastify({
    text: message,
    duration: 4000,
    close: true,
    gravity: "top",
    position: "center",
  }).showToast();
}

function insert(){
  const currntCategory=document.getElementById('current-category')
  const category = document
    .querySelector(".brand-filter")
    .getAttribute("data-cat");
    currntCategory.value=category
  return true
}
document.querySelector(".brand-filter").addEventListener("click", () => {
  const checkNod = document.querySelectorAll(".bran-checkbox");
  let minValue = parseInt(document.getElementById("minAmount").value) || 0;
  let maxValue =
    parseInt(document.getElementById("maxAmount").value) || 100000000;
  const category = document
    .querySelector(".brand-filter")
    .getAttribute("data-cat");
  const assOrDessNod = document.querySelectorAll(".assDess");
  console.log(maxValue + " " + minValue);
  if (minValue < 0) {
    console.log(minValue);
    showToast("minimum value should not be negetive value");
  } else if (maxValue <= 0) {
    console.log(maxValue);
    showToast("maximum value should not be less than zero");
  } else if (maxValue <= minValue) {
    showToast("maximum value should be greater than minimum value");
  } else if (maxValue === NaN || maxValue === NaN) {
    showToast("Only number allowed");
  } else {
    let brand = [];
    let assOrDes = "";

    console.log(assOrDessNod);
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
    console.log(sort);
    if (category) {
      location.href = `/user/cat?cat=${category}&maxValue=${maxValue}&minValue=${minValue}&sort=${sort}&from=sorting&brand=${stringBrand}`;
    } else {
      location.href = `/user/all?maxValue=${maxValue}&minValue=${minValue}&sort=${sort}&from=sorting&brand=${stringBrand}`;
    }
  }
});

// function AssentDessent(instruction){
//     if(instruction==='lowToHigh'){
//         const catagory=document.querySelector('.brand-filter').getAttribute('data-cat')||'all'
//         console.log(catagory)
//         location.href=`/user/all?instruction=lowToHigh&cat=${catagory}`
//     }else{
//         const catagory=document.querySelector('.brand-filter').getAttribute('data-cat')||'all'
//         console.log(catagory)
//         location.href='/user/all?instruction=HighToLow'
//     }
// }

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
  console.log("inside tost");
  Toastify({
    text: message,
    duration: 4000,
    close: true,
    gravity: "top",
    position: "center",
  }).showToast();
}

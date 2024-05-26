let oldImages = [];
let counts = [0, 0, 0, 0, 0];

const fields = ["field-1", "field-2", "field-3", "field-4", "field-5"];
const clickMeIds = [
  "click-me",
  "click-me-2",
  "click-me-3",
  "click-me-4",
  "click-me-5",
];
const imgIds = [
  "field-1-img",
  "field-2-img",
  "field-3-img",
  "field-4-img",
  "field-5-img",
];
const closeContainerIds = [
  "close-container",
  "close-container-2",
  "close-container-3",
  "close-container-4",
  "close-container-5",
];

fields.forEach((fieldId, index) => {
  document
    .getElementById(fieldId)
    .addEventListener("change", (event) => handleFieldChange(event, index));
  document
    .getElementById(closeContainerIds[index])
    .addEventListener("click", () => resetField(index));
  oldImages[index] = document.getElementById(imgIds[index]).src;
});

 function handleFieldChange(event, index) {
   const file = event.target.files[0];
   let cropper;

   if (counts[index] === 0) {
     if (file) {
       const reader = new FileReader();
       reader.onload = function (e) {
         document.getElementById(imgIds[index]).src = e.target.result;

         cropper = new Cropper(document.getElementById(imgIds[index]), {
           aspectRatio: 1, // You can set the aspect ratio as needed
           viewMode: 1,
           background: false,
           crop(event) {
             // Handle cropping if needed
           },
         });

         croppers[index] = cropper;
       };
       reader.readAsDataURL(file);

       counts[index]++;
     }
   } else {
     const clickMe = document.getElementById(clickMeIds[index]);
     clickMe.innerHTML = "Close image";
     clickMe.classList.add("click-me-added");
   }
 }

 function resetField(index) {
   document.getElementById(fields[index]).value = "";
   document.getElementById(imgIds[index]).src = oldImages[index];
   document.getElementById(closeContainerIds[index]).innerHTML = "";
   counts[index] = 0;

   const clickMe = document.getElementById(clickMeIds[index]);
   clickMe.innerHTML = "Click here";
   clickMe.classList.remove("click-me-added");

   // Destroy the cropper instance
   if (croppers[index]) {
     croppers[index].destroy();
     croppers[index] = null;
   }
 }
document.querySelector(".dis-input").addEventListener("input", function () {
  const Text = this.value;

  if (Text.length > 70) {
    let sid = document.querySelector(".dis-input").value.slice(0, 70);
    console.log(sid);
    document.querySelector(".dis-input").value = sid;
    showToast("Word limit reached");
  }
});

function validate() {
  const name = document.getElementById("name").value;

  if (name.trim() === "") {
    alert("Blank space in Name is not allowed");

    return false;
  }

  return true;
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

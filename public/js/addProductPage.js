let modal = document.getElementById("myModal");
let close = document.querySelector(".close");
let cancelBtn = document.getElementById("cancel-modal");
let cropper;
let dataURL;
const fieldCounts = [0, 0, 0, 0, 0]; // To track the counts for each field

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

close.addEventListener("click", () => {
  closeModal();
});

fields.forEach((fieldId, index) => {
  document
    .getElementById(fieldId)
    .addEventListener("change", (event) => handleFieldChange(event, index));
  document
    .getElementById(closeContainerIds[index])
    .addEventListener("click", () => resetField(index));
});

function handleFieldChange(event, index) {
  let cropBtn = document.getElementById("crop");

  removeClase();
  cropBtn.classList.add(`f-${index + 1}`);

  if (cropper) {
    cropper.destroy();
    cropper = null;
  }

  // if (fieldCounts[index] === 0) {
    openModal();
    const file = event.target.files[0];
    if (file) {
      const image = document.getElementById("img-t-A");
      // fieldCounts[index]++;
      const reader = new FileReader();
      reader.onload = function (e) {
        image.src = e.target.result;
        cropper = new Cropper(image, {
          aspectRatio: 0,
          viewMode: 0,
          background: false,
          cropmove: function (event) {
          var cropBoxData = cropper.getCropBoxData();

          if (cropBoxData.width < 300) {
            cropBoxData.width = 300;
          }

          if (cropBoxData.height < 500) {
            cropBoxData.height = 500;
          }

          cropper.setCropBoxData(cropBoxData);
        },
          crop() {
            const canvas = cropper.getCroppedCanvas({
              fillColor: "transparent",
            });
            dataURL = canvas.toDataURL("image/jpeg");
          },
        });
      };
      reader.readAsDataURL(file);
    }
  
  // else {
  //   // const clickMe = document.getElementById(clickMeIds[index]);
  //   // clickMe.innerHTML = "Close image";
  //   // clickMe.classList.add("click-me-added");
  //   location.reload()
  // }

  cropBtn.removeEventListener("click", handleCrop);
  cropBtn.addEventListener("click", handleCrop);
}

function handleCrop() {
  let cropBtn = document.getElementById("crop");
  let activeFieldIndex = fields.findIndex((field, i) =>
    cropBtn.classList.contains(`f-${i + 1}`)
  );
  if (cropper && activeFieldIndex !== -1) {
    let croppedImageDisplay = document.getElementById(imgIds[activeFieldIndex]);
    const canvas = cropper.getCroppedCanvas({ fillColor: "transparent" });
    canvas.toBlob((blob) => {
      const file = new File([blob], "cropped_image.png", { type: "image/png" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      document.getElementById(fields[activeFieldIndex]).files =
        dataTransfer.files;
    }, "image/png");
    croppedImageDisplay.src = dataURL;

    const img = document.createElement("img");
    img.src = "/images/Icons/delete_14025328.png";
    img.classList.add("close-icons");
    let container = document.getElementById(
      closeContainerIds[activeFieldIndex]
    );
    
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    } 
    
    container.appendChild(img)
  }
  closeModal();
}

function resetField(index) {
  document.getElementById(fields[index]).value = "";
  document.getElementById(imgIds[index]).src =
    "../../images/Icons/cloud-upload-a30f385a928e44e199a62210d578375a.jpg";
  document.getElementById(closeContainerIds[index]).innerHTML = "";
  fieldCounts[index] = 0;
  const clickMe = document.getElementById(clickMeIds[index]);
  clickMe.innerHTML = "Click here";
  clickMe.classList.remove("click-me-added");
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

function removeClase() {
  let cropBtn = document.getElementById("crop");
  for (let i = 0; i < fields.length; i++) {
    cropBtn.classList.remove(`f-${i + 1}`);
  }
}

function openModal() {
  modal.style.display = "block";
  document.querySelector(".main-content").style.display = "none";
  document.getElementById("cropeCanvas").style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
  document.querySelector(".main-content").style.display = "block";
  document.getElementById("cropeCanvas").style.display = "none";
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

document.getElementById("cancel-modal").addEventListener('click',()=>{
  closeModal()
  modal.style.display='none'
});

function validate() {
  const name = document.getElementById("name").value;
  const photo1 = document.getElementById("field-1").value;
  const photo2 = document.getElementById("field-2").value;
  const photo3 = document.getElementById("field-3").value;
  const photo4 = document.getElementById("field-4").value;
  const photo5 = document.getElementById("field-5").value;
  if (name.trim() === "") {
    showToast("Blank space in Name is not allowed");
    return false;
  }
  if (photo1 === "") {
    showToast("Please add photo Field 1");
    return false;
  }
  if (photo2 === "") {
    showToast("Please add photo Field 2");
    return false;
  }
  if (photo3 === "") {
    showToast("Please add photo Field 3");
    return false;
  }
  if (photo4 === "") {
    showToast("Please add photo Field 4");
    return false;
  }
  if (photo5 === "") {
    showToast("Please add photo Field 5");
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

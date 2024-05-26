

let modal = document.getElementById("myModal");
let close = document.querySelector(".close");
let cropper
let dataURL;

console.log(close)
close.addEventListener('click',()=>{
  modal.style.display='none'
   document.querySelector(".main-content").style.display = "block";
   document.getElementById("cropeCanvas").style.display = "none";
  if(cropper){
    cropper.destroy()
    cropper=null
  }

})

let count_1 = 0;
let count_2 = 0;
let count_3 = 0;
let count_4 = 0;
let count_5 = 0;
const field_1 = document.getElementById("field-1");

field_1.addEventListener("change", function (event) {

  if (count_1 === 0) {
    modal.style.display = "block";
    const file = event.target.files[0];
    if (file) {
      const image = document.getElementById("img-t-A");
      count_1++;
      const reader = new FileReader();
      reader.onload = function (e) {
        image.src = e.target.result;
         cropper = new Cropper(image, {
           aspectRatio: 0,
           viewMode: 0,
           background: false, 
           crop(event) {
             const canvas = cropper.getCroppedCanvas({
               fillColor: "transparent",
             });
              dataURL = canvas.toDataURL("image/jpeg"); 
             
           
           },
         });
      };
      reader.readAsDataURL(file);

      

      document.getElementById("crop").addEventListener('click',()=>{
        if (cropper) {
          let croppedImageDisplay = document.getElementById("field-1-img");
          const canvas = cropper.getCroppedCanvas({
            fillerColor: "transparent",
          });
          canvas.toBlob((blob) => {
            const file = new File([blob], "cropped_image.png", {
              type: "image/png",
            }); 
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            field_1.files = dataTransfer.files;
          }, "image/png");
           croppedImageDisplay.src = dataURL;
           const img = document.createElement("img");
           img.src = "/images/Icons/delete_14025328.png";

           img.classList.add("close-icons");
           const container = document.getElementById("close-container");
           container.appendChild(img);
        }
        modal.style.display='none'
        if(cropper){
          cropper.destroy()
          cropper=null
        }
      });
      
      
    }
  } else {
    const click_me = document.getElementById("click-me");
    click_me.innerHTML = "Close image";
    click_me.classList.add("click-me-added");
    console.log(click_me);
  }
});
document.getElementById("close-container").addEventListener("click", () => {
  document.getElementById("field-1").value = "";
  document.getElementById("field-1-img").src =
    "../../images/Icons/cloud-upload-a30f385a928e44e199a62210d578375a.jpg";
  document.getElementById("close-container").innerHTML = "";
  count_1 = 0;
  const click_me = document.getElementById("click-me");
  click_me.innerHTML = "Click here";
  click_me.classList.remove("click-me-added");
  if(cropper){
    cropper.destroy()
    cropper=null
  }
});

document.getElementById("field-2").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (count_2 === 0) {
    count_2++;
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("field-2-img").src = e.target.result;
      };
      reader.readAsDataURL(file);
      const img = document.createElement("img");
      img.src = "/images/Icons/delete_14025328.png";
      img.classList.add("close-icons");
      const container = document.getElementById("close-container-2");
      container.appendChild(img);
    }
  } else {
    const click_me = document.getElementById("click-me-2");
    click_me.innerHTML = "Close image";
    click_me.classList.add("click-me-added");
  }
});
document.getElementById("close-container-2").addEventListener("click", () => {
  document.getElementById("field-2").value = "";
  document.getElementById("field-2-img").src =
    "../../images/Icons/cloud-upload-a30f385a928e44e199a62210d578375a.jpg";
  document.getElementById("close-container-2").innerHTML = "";
  count_2 = 0;
  const click_me = document.getElementById("click-me-2");
  click_me.innerHTML = "Click here";
  click_me.classList.remove("click-me-added");
});

document.getElementById("field-3").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (count_3 === 0) {
    if (file) {
      count_3++;
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("field-3-img").src = e.target.result;
      };
      reader.readAsDataURL(file);
      const img = document.createElement("img");
      img.src = "/images/Icons/delete_14025328.png";
      img.classList.add("close-icons");
      const container = document.getElementById("close-container-3");
      container.appendChild(img);
    }
  } else {
    const click_me = document.getElementById("click-me-3");
    click_me.innerHTML = "Close image";
    click_me.classList.add("click-me-added");
  }
});
document.getElementById("close-container-3").addEventListener("click", () => {
  document.getElementById("field-3").value = "";
  document.getElementById("field-3-img").src =
    "../../images/Icons/cloud-upload-a30f385a928e44e199a62210d578375a.jpg";
  document.getElementById("close-container-3").innerHTML = "";
  count_3 = 0;
  const click_me = document.getElementById("click-me-3");
  click_me.innerHTML = "Click here";
  click_me.classList.remove("click-me-added");
});

document.getElementById("field-4").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (count_4 === 0) {
    if (file) {
      count_4++;
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("field-4-img").src = e.target.result;
      };
      reader.readAsDataURL(file);
      const img = document.createElement("img");
      img.src = "/images/Icons/delete_14025328.png";
      img.classList.add("close-icons");
      const container = document.getElementById("close-container-4");
      container.appendChild(img);
    }
  } else {
    const click_me = document.getElementById("click-me-4");
    click_me.innerHTML = "Close image";
    click_me.classList.add("click-me-added");
  }
});
document.getElementById("close-container-4").addEventListener("click", () => {
  document.getElementById("field-4").value = "";
  document.getElementById("field-4-img").src =
    "../../images/Icons/cloud-upload-a30f385a928e44e199a62210d578375a.jpg";
  document.getElementById("close-container-4").innerHTML = "";
  count_4 = 0;
  const click_me = document.getElementById("click-me-4");
  click_me.innerHTML = "Click here";
  click_me.classList.remove("click-me-added");
});

document.getElementById("field-5").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (count_5 === 0) {
    if (file) {
      count_5++;
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("field-5-img").src = e.target.result;
      };
      reader.readAsDataURL(file);
      const img = document.createElement("img");
      img.src = "/images/Icons/delete_14025328.png";
      img.classList.add("close-icons");
      const container = document.getElementById("close-container-5");
      container.appendChild(img);
    }
  } else {
    const click_me = document.getElementById("click-me-5");
    click_me.innerHTML = "Close image";
    click_me.classList.add("click-me-added");
  }
});
document.getElementById("close-container-5").addEventListener("click", () => {
  document.getElementById("field-5").value = "";
  document.getElementById("field-5-img").src =
    "../../images/Icons/cloud-upload-a30f385a928e44e199a62210d578375a.jpg";
  document.getElementById("close-container-5").innerHTML = "";
  count_5 = 0;
  const click_me = document.getElementById("click-me-5");
  click_me.innerHTML = "Click here";
  click_me.classList.remove("click-me-added");
});

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

///modal cancel button//

document.getElementById("cancel-modal").addEventListener('click',()=>{
   count_1 = 0;
   count_2 = 0;
   count_3 = 0;
   count_4 = 0;
   count_5 = 0;
if(cropper){
    cropper.destroy()
    cropper=null
  }
  modal.style.display='none'
});


// Get the modal


// Function to open the modal


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

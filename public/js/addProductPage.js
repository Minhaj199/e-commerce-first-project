const form = document.getElementById('mainForm')

form.addEventListener('submit', (e) => {
  ////////////adding value to hidden input field and validating it//////////////
  const input = document.getElementById('varient_collection')
  const tbody = document.getElementById('productTableBody')
  const tbodyChild = tbody.childElementCount
  
  input.value = (sessionStorage.getItem('value')&&tbodyChild>1) ? sessionStorage.getItem('value') : '[]'
  
  const varient =input.value
  if (varient) {
    const varientParsed = JSON.parse(varient) || []
    if (varientParsed?.length <= 0) {
      document.getElementById('varient-warning').innerHTML = 'Please Insert Atlease One Varient'
      window.scroll({top:0,behavior:'smooth'})
      e.preventDefault()
      return false
    }
  } else {
    document.getElementById('varient-warning').innerHTML = 'Please Insert Atlease One Varient'
    window.scroll({top:0,behavior:'smooth'})
    e.preventDefault()
    return false
  }
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'flex';
  sessionStorage.removeItem('value')
})


const capitalisor = (word) => {
  //////////capitalising first letter of color////
  if (!word || typeof word !== 'string' || word.length <= 1) {
    throw new Error('varient not accepted')
  }
  let newWord = word[0].toUpperCase() + word.slice(1).toLocaleLowerCase()
  return newWord
}





document.querySelector(".dis-input").addEventListener("input", function () {

  const Text = this.value;

  if (Text.length > 70) {
    let sid = document.querySelector(".dis-input").value.slice(0, 70);
    document.querySelector(".dis-input").value = sid;
    showToast("Word limit reached");
  }
});

/////////////handle add varient insertion /////////
function handleAddVariant(e) {
  e.preventDefault()
  const sizeElement = document.getElementById('size').value
  const colorElment = document.getElementById('color').value
  const qty = document.getElementById('qty').value
  const warnning = document.getElementById('varient-warning')
  const tbody = document.getElementById('productTableBody')
  const row = document.createElement('tr')
  const tbodyChild = tbody.childElementCount
  const id = Math.floor(Math.random() * 10000)
  if (sizeElement.trim() === '') {
    warnning.innerHTML = 'Please Select Size'
    return
  }
  if (colorElment.trim() === '') {
    warnning.innerHTML = 'Please Insert Color'
    return
  }
  if (qty <= 0) {
    warnning.innerHTML = 'Please Insert Quantity'
    return
  }
  document.getElementById('varient-warning').innerHTML = ''
  ////////chicking tbody child because if page refresh session storage stay and can't add item that exist in the session
  const array = (sessionStorage.getItem('value') && tbodyChild > 1) ? JSON.parse(sessionStorage.getItem('value')) : []
  let newValue = {}
  try {

    newValue = { size: sizeElement, color: capitalisor(colorElment), stock: qty, id }
  } catch (error) {
    warnning.innerHTML = error.message
  }
  ////////////checking for duplcate entries
  let isDuplicate = false
  if (array?.length) {
    array.forEach(element => {
      if (element['size']?.toUpperCase() === newValue['size']?.toUpperCase() && element['color']?.toUpperCase() === newValue['color']?.toUpperCase()) {
        isDuplicate = true
      }
    })
  }
  if (isDuplicate) {
    warnning.innerHTML = 'Duplicate entry'
    return
  }
  warnning.innerHTML = ''

  //////////////////////////
  array.push(newValue)
  sessionStorage.setItem('value', JSON.stringify(array))


  let size = sizeElement
  let color = colorElment
  let stock = qty

  //////////////dynamically adding newly added values//////////////
  row.innerHTML =
    `
    <td>${size}</td>
                                    <td>${capitalisor(color)}</td>
                                    <td>${stock}</td>
                                    <td id=id-${id} style="display: flex;justify-content: center;align-items: center;border:none">
                                   
                                        <button type="button" class="btn btn-danger btn-sm"
                                            onclick="handleRemoveVarient(${id},this)"><img width="25px" height="25px"
                                                src="/images/Icons/delete.png" alt=""></button>
                                    </td>
                                   
    `
  tbody.appendChild(row)

}
function handleRemoveVarient(id, button) {

  //////////////remove i wanted ,added item
  let array = JSON.parse(sessionStorage.getItem('value'))
  let arrayAfterRemoved = array?.filter(el => {
    return el.id !== id
  })
  button.closest('tr').remove()
  sessionStorage.setItem('value',JSON.stringify(arrayAfterRemoved))
}



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

document.querySelector(".dis-input").addEventListener("input", function () {
  const Text = this.value;

  if (Text.length > 70) {
    let sid = document.querySelector(".dis-input").value.slice(0, 70);
    document.querySelector(".dis-input").value = sid;
    showToast("Word limit reached");
  }
});

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

document.getElementById("cancel-modal").addEventListener('click', () => {
  closeModal()
  modal.style.display = 'none'
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
  Toastify({
    text: message,
    duration: 4000,
    close: true,
    gravity: "top",
    position: "center",
  }).showToast();
}

document.getElementById('main-form').addEventListener('submit',()=>{
  const mainSubmit=document.getElementById('main-submit-button')
  mainSubmit.textContent='loading............'
  mainSubmit.disabled=true
  setTimeout(() => {
    mainSubmit.disabled=false
    mainSubmit.textContent='submit'
  }, 30000);
})


const capitalisor = (word) => {
  //////////capitalising first letter of color////
  if (!word || typeof word !== 'string' || word.length <= 1) {
    throw new Error('varient not accepted')
  }
  let newWord = word[0].toUpperCase() + word.slice(1).toLocaleLowerCase()
  return newWord
}

let oldImages = [];
let modal = document.getElementById("myModal");
let close = document.querySelector(".close");

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
for (let i = 0; i < imgIds.length; i++) {
  oldImages.push(document.getElementById(imgIds[i]).src)
}


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


  document.getElementById("cancel-modal").addEventListener("click", () => {
    closeModal();
    modal.style.display = "none";
  });

  cropBtn.removeEventListener("click", handleCrop);
  cropBtn.addEventListener("click", handleCrop);
  document.getElementById("cancel-modal").addEventListener("click", () => {
    resetField(index)
    closeModal();
    modal.style.display = "none";
  });

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
      const file = new File([blob], `${activeFieldIndex}`, { type: "image/png" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      document.getElementById(fields[activeFieldIndex]).files =
        dataTransfer.files;
    }, "image/png");
    croppedImageDisplay.src = dataURL

    const img = document.createElement("img");
    img.src = "/images/Icons/delete_14025328.png";
    img.classList.add("close-icons");
    let container = document.getElementById(
      closeContainerIds[activeFieldIndex]
    );


    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    container.appendChild(img);
  }
  closeModal();
}

function resetField(index) {
  document.getElementById(fields[index]).value = "";
  document.getElementById(imgIds[index]).src = oldImages[index]
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

document.getElementById("cancel-modal").addEventListener("click", () => {
  closeModal();
  modal.style.display = "none";
});


document.querySelector(".dis-input").addEventListener("input", function () {
  const Text = this.value;

  if (Text.length > 70) {
    let sid = document.querySelector(".dis-input").value.slice(0, 70);

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
  Toastify({
    text: message,
    duration: 4000,
    close: true,
    gravity: "top",
    position: "center",
  }).showToast();
}

async function handleEditClick(id, button, index) {
  ///////////// handle clicking eding in the table dynamically insert current value/////
  ////////////storing varient id on button data set
  try {
    document.getElementById('add-btn').hidden = true
    const row = button.closest('tr')
    const cells = row.querySelectorAll('td')
    const size = cells[0]?.textContent.trim().toUpperCase()
    const color = cells[1]?.textContent.trim()
    const stock = Number(cells[2]?.textContent.trim()||0)
    if (stock>=0 && size && color) {
      const sizeDropdown = document.getElementById('size')
      sizeDropdown.disabled = false
      document.getElementById(size).selected = true
      const colorInput = document.getElementById('color')
      colorInput.disabled = false
      colorInput.value = color
      const stockInput = document.getElementById('qty')
      stockInput.disabled = false
      stockInput.value = stock
      const button = document.getElementById('update-btn')
      const addSubmitButton = document.getElementById('add-submit-btn')
      if(addSubmitButton){
        addSubmitButton.remove()
      }
      button.hidden = false
      button.dataset._id = id
      sessionStorage.setItem('editingRow', 'id-' + index)
      document.getElementById('cancel-edit').hidden = false

    }

  } catch (error) {
    console.error(error)
    showToast(error.message || 'internal server error')
  }
}

async function handleSubmitVariantEdit(productId) {
  const prompt = await showAlertPropt('Do you want to submit change?')
  if (!prompt) return

  /////////// validating edid data ///////
  try {
    const size = document.getElementById('size').value
    const color = capitalisor(document.getElementById('color').value)
    const stock = Math.floor(document.getElementById('qty').value)
    const warning = document.getElementById('varient-warning')
    if (size?.trim() === '') {
      warning.textContent = 'Size Is Empty'
      return
    }
    if (color?.trim() === '') {
      warning.textContent = 'Color Is Empty'
      return
    }
    if (color?.trim()?.length > 15||color?.trim()?.length < 2) {
      warning.textContent = 'Reduce color text length below 3-15'
      return
    }
    if (stock > 5000 || stock < 1) {
      warning.textContent = 'insert stock between 1-5000'
      return
    }
    warning.textContent = ''
    const varientId = document.getElementById('update-btn').dataset._id
    if (!varientId) {
      showToast('id not found')
      return
    }
    const response = await submitEditedData(varientId, size, color, stock, productId)

    if (response === true) {
      const editingRow = sessionStorage.getItem('editingRow')
      const row = document.getElementById(editingRow)
      const cells = row.querySelectorAll('td')
      cells[0].textContent = size
      cells[1].textContent = color
      cells[2].textContent = stock
      sessionStorage.removeItem('editingRow')
      handleResetVariantEdit()
      showToast(`size-${size}-color-${color} updated`)
    }
  } catch (error) {
    showToast(error.message || 'internal server error')
  }
}
async function submitEditedData(varientId, size, color, stock, productId) {

  try {
    const data = { size, color, stock, varientId }
    const response = await fetch('/admin/edit-variant/' + productId, {
      method: 'PATCH', body: JSON.stringify(data), headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      const error = await response.json(); // or .text() if your server returns plain error
      throw new Error(error.message || 'Something went wrong');
    }
    const parsededReponse = await response.json()

    return parsededReponse
  } catch (error) {
    showToast(error.message || 'internal server error')
  }
}
async function showAlertPropt(message) {

  try {
    const result = await Swal.fire({
      title: "Are you sure ?",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b50c00",
      cancelButtonColor: "##bfbcbb !important",
      confirmButtonText: "confirm",
    });
    if (result.isConfirmed) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    showToast("internal server error");
    return false;
  }
}
function handleResetVariantEdit() {
  const sizeInput = document.getElementById('size')
  const colorInput = document.getElementById('color')
  const stockInput = document.getElementById('qty')
  const button = document.getElementById('update-btn')
  document.getElementById('cancel-edit').hidden = true
  sizeInput.disabled = true
  colorInput.value = ''
  color.disabled = true
  stockInput.value = 0
  stockInput.disabled = true
  button.hidden = true
  const addButton = document.getElementById('add-submit-btn')
  if(addButton){
    addButton.remove()
  }
  document.getElementById('add-btn').hidden = false
}

function handleAddVariant(id) {

  //// dynmicall creating sumbitt button specific for add feature
  const buttonDiv = document.getElementById('button-div')
  document.getElementById('add-btn').hidden = true
  const submitButton = document.getElementById('update-btn');
  document.getElementById('cancel-edit').hidden = false
  // buttonDiv.removeChild(submitButton)
  submitButton.hidden=true
  const newSubmitButton = document.createElement('button');
  newSubmitButton.type = 'button';
  newSubmitButton.id = 'add-submit-btn'; // start as disabled
  newSubmitButton.className = 'btn btn-primary btn-sm';
  newSubmitButton.style.cssText = `
  width: 20%;
  height: 100%;
  background: #4592ff;
  border: none;
  border-radius: 10px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left:10px
`;

  // Create image element for inside the button
  const img = document.createElement('img');
  img.src = '/images/Icons/application.png';
  img.alt = '';
  img.width = 25;
  img.height = 25;

  // Add the image to the button
  newSubmitButton.appendChild(img);
  buttonDiv.appendChild(newSubmitButton)
  ////////////// end of adding button

  ////// submitting data////
  newSubmitButton.onclick = function () {
    submitAddElement(id);
  };


  const sizeElement = document.getElementById('size')
  sizeElement.disabled = false

  const colorElment = document.getElementById('color')
  colorElment.disabled = false

  document.getElementById('cancel-edit').disabled = false
  const qtyElement = document.getElementById('qty')
  qtyElement.disabled = false
}

async function submitAddElement(productID) {

  const prompt = await showAlertPropt('Do you want to submit variant?')
  if (!prompt) return

  const sizeValue = document.getElementById('size').value
  const colorValue = document.getElementById('color').value
  const qtyValue = Math.floor(document.getElementById('qty').value)
  const warnning = document.getElementById('varient-warning')
  const tbody = document.getElementById('productTableBody')
  const row = document.createElement('tr')
  if (sizeValue.trim() === '') {
    warnning.innerHTML = 'Please Select Size'
    return
  }
  if (colorValue.trim() === '') {
    warnning.innerHTML = 'Please Insert Color'
    return
  }
  if (colorValue.trim().length > 10 || colorValue.trim().length < 2) {
    warnning.innerHTML = 'Reduce color length to 2-10'
    return
  }
  if (qtyValue <= 0 || qtyValue > 5000) {
    warnning.innerHTML = 'Please Insert Between 1-5000'
    return
  }
  warnning.innerHTML = ''
  // const array = (sessionStorage.getItem('value') && tbodyChild > 1) ? JSON.parse(sessionStorage.getItem('value')) : []
  let newVariant = {}
  try {

    newVariant = { size: sizeValue, color: capitalisor(colorValue), stock: qtyValue }
  } catch (error) {
    warnning.innerHTML = error.message
  }

  warnning.innerHTML = ''


  try {
    const response = await fetch('/admin/add-new-variant', {
      method: 'post',
      body: JSON.stringify({ newVariant, productID }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'internal server error')
    }
    // //////////////dynamically adding newly added values//////////////
    showToast('varient inserted')
    setTimeout(() => {
      location.reload()
    }, 1000);
    tbody.appendChild(row)
  } catch (error) {
    showToast(error.message || 'internal server error')
  }




}
async function deleteVarient(id, button) {
  try {
    const prompt = await showAlertPropt('Do you want to delete variant?')
    if (!prompt) return
    const row = button.closest('tr')
    const response = await fetch('/admin/delete-variant/' + id, {
      method: 'Delete'
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'internal server error')
    }
    row.remove()
    showToast('Variant Deleted')
  } catch (error) {
    showToast(error.message || 'internal server error')
  }
}
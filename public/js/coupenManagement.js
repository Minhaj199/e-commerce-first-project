const modal = document.getElementById("myModal");
const btn = document.querySelector(".addBtn");
const close = document.querySelector(".close");
const modalEdit = document.getElementById("myEditModal");
const closeEdit = document.getElementById("edit-close");

closeEdit.onclick = function () {
  modalEdit.style.display = "none";
};

btn.onclick = function () {
  modal.style.display = "block";
};
close.onclick = function () {
  modal.style.display = "none";
  location.reload();
};
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};


//////////////////add coupen
document
  .querySelector("#add-submit")
  .addEventListener("click", async function () {
    this.disable = true
    const name = document.getElementById('name').value?.trim()
    const code = document.getElementById("code").value?.trim();
    const startingDate = document.getElementById("start-date").value;
    const endingDate = document.getElementById("expirey-date").value;
    const amount = document.getElementById("amount").value;

    const validateAddData = validateAdd(name, code, startingDate, endingDate, amount)
    if (!validateAddData) {
      return
    }
    let isUser;
    const encodeCode = encodeURIComponent(code);
    if (code) {
      try {
        const isUserPromise = await fetch(
          `/admin/fetchData?from=coupen&code=${encodeCode}&name=${name}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!isUserPromise.ok) {
          const error = await response.json()
          throw new Error(error.message || 'internal server error')
        }
        isUser = await isUserPromise.json();
        if (isUser === 'name used') {
          const namewarning = document.getElementById('name-warning')
          namewarning.textContent = 'Name already used.'
          namewarning.classList.remove('d-none')
          return false
        }
        if (isUser === "name code") {
          const codewarning = document.getElementById('code-warning')
          codewarning.textContent = 'Code Already used'
          codewarning.classList.remove('d-none')
          return false
        } else {
          if (code && amount && startingDate && name && endingDate) {
            if (amount > 0) {
              try {
                const response = await fetch("/admin/addCoupen", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, startingDate, endingDate, code, amount }),
                })
                if (!response.ok) {
                  const error = await response.json()
                  throw new Error(error.message || 'internal server error')
                }
                const resposeData = await response.json()
                showToast(resposeData);
                setTimeout(() => {
                  location.reload();
                }, 3000);
              } catch (error) {
                showToast(error.message)
                return
              }

            } else {
              showToast("please enter a valid number");
            }

          } else {
            showToast("You are not fully filled");
          }
        }
      } catch (error) {
        showToast(error.message || 'internal server error')
      }

    }

  });
////////////////////////////////////






async function editData(id) {
  modalEdit.style.display = "block";
  try {
    const datasTobeEdited = await fetch(
      `/admin/fetchData?from=editCoupen&id=${id}`,
      {
        method: "Get",
        headers: { "Content-Type": "application/json" },
      }
    );


    const datasTobeEditedParsed = await datasTobeEdited.json();
    document.getElementById("name-edit").value = datasTobeEditedParsed.name;
    document.getElementById("code-edit").value = datasTobeEditedParsed.code;
    document.getElementById("start-date-edit").value = dateFormater(datasTobeEditedParsed.startingDate)
    document.getElementById("date-edit").value = dateFormater(datasTobeEditedParsed.expiry)
    document.getElementById("edit-amount").value = datasTobeEditedParsed.amount;
    document.getElementById("edit-submit-button").dataset.id = datasTobeEditedParsed._id;
    document.getElementById("Date").textContent = datasTobeEditedParsed.expiry;


  } catch (error) {

  }

}

document.querySelector(".edit-submit").addEventListener("click", async () => {
  const name = document.getElementById("name-edit").value?.trim()
  const code = document.getElementById("code-edit").value?.trim()
  const encodeCode = encodeURIComponent(code);
  const id = document.getElementById("edit-submit-button").dataset.id
  const starting = document.getElementById("start-date-edit").value 
  const ending=document.getElementById("date-edit").value 
  const amount=document.getElementById("edit-amount").value
  if(!(validateEdit (name, code, starting, ending, amount))){
    return
  }
  try {
    let isUser;
    if (code) {
      const isUserPromise = await fetch(
        `/admin/fetchData?from=coupenEdit&code=${encodeCode}&ID=${id}&name=${name}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if(!isUserPromise.ok){
        const error=await isUserPromise.json()
        throw new Error(error.message||'internal server error')
      }
      isUser = await isUserPromise.json();
    } else if (code.length < 3) {
      showToast("Code Name should be Three letters");
    } else {
      showToast("not fully filled");
    }
    if (isUser === "used") {
      showToast("This code already used");
    } else {

    
        const response=await  fetch("/admin/editCoupen", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, code, amount, id,starting,ending }),
            })
        
              if (!response.ok) {
                const error = await response.json()
                console.log(error)
                throw new Error(error.message || 'internal server error')
              }
              if(response){
                showToast("Coupen Changed");
                setTimeout(() => {
                  location.reload();
                }, 3000);

              }
    }
  } catch (error) {
    showToast(error.message||'internal server error')
  }

});

// const dataToBeEdit=await

async function deleteCoupen(id, name) {
  try {
    const propt = await showAlertPropt(`Are you want to delete ${name} ?`);
    if (propt) {
      const response = await fetch("/admin/deleteCoupen", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const info = await response.json();

      if (info === "deleted") {
        showToast(`${name} Deleted`);
        setTimeout(() => {
          location.reload();
        }, 3000);

      }
    }
  } catch (error) {
    showToast('internal server error')
  }

}

function showToast(message) {

  Toastify({
    text: message,
    duration: 7000,
    close: true,
    gravity: "top",
    position: "center",
  }).showToast();
}
async function showAlertPropt(message) {
  try {
    const result = await Swal.fire({
      title: "Are you sure ?",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b50c00",
      cancelButtonColor: "##bfbcbb",
      confirmButtonText: "confirm",
    });
    if (result.isConfirmed) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    alert("internal server error");
    return false;
  }
}

/////////validating adding data///
const validateAdd = (name, code, startingDate, endingDate, amount) => {


  if (name === '') {
    const namewarning = document.getElementById('name-warning')
    namewarning.textContent = 'Please enter a valid name.'
    namewarning.classList.remove('d-none')
    return false
  } else {
    const namewarning = document.getElementById('name-warning')
    namewarning.classList.add('d-none')
  }
  if (name.length <= 2 || name.length > 10) {
    const namewarning = document.getElementById('name-warning')
    namewarning.textContent = 'Please enter between 3-9.'
    namewarning.classList.remove('d-none')
    return false
  } else {
    const namewarning = document.getElementById('name-warning')
    namewarning.classList.add('d-none')
  }
  if (!isNaN(name)) {
    const namewarning = document.getElementById('name-warning')
    namewarning.textContent = 'Please insert Letter name.'
    namewarning.classList.remove('d-none')
    return false
  } else {
    const namewarning = document.getElementById('name-warning')
    namewarning.classList.add('d-none')
  }
  if (code.trim() === '') {

    const codewarning = document.getElementById('code-warning')
    codewarning.textContent = 'Please enter a valid code.'
    codewarning.classList.remove('d-none')
    return false
  } else {
    const codewarning = document.getElementById('code-warning')
    codewarning.classList.add('d-none')
  }
  if (code.trim().length <= 2 || code.trim().length >= 16) {

    const codewarning = document.getElementById('code-warning')
    codewarning.textContent = 'Please enter between 3-15.'
    codewarning.classList.remove('d-none')
    return false
  } else {
    const codewarning = document.getElementById('code-warning')
    codewarning.classList.add('d-none')
  }
  if (startingDate === '') {
    const startingDatewarning = document.getElementById('start-warning')
    startingDatewarning.textContent = 'Please enter a valid starting date.'
    startingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const startingDatewarning = document.getElementById('start-warning')
    startingDatewarning.classList.add('d-none')
  }
  if (endingDate === '') {
    const endingDatewarning = document.getElementById('expiry-warning')
    endingDatewarning.textContent = 'Please enter a valid expiry date.'
    endingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const endingDatewarning = document.getElementById('expiry-warning')
    endingDatewarning.classList.add('d-none')
  }
  const nowDate = new Date()
  nowDate.setHours(0, 0, 0, 0)
  const startDateFormated = new Date(startingDate)
  startDateFormated.setHours(0, 0, 0, 0)
  const edingDateFormated = new Date(endingDate)
  edingDateFormated.setHours(23, 59, 59, 999)
  if (startDateFormated === '') {
    const startingDatewarning = document.getElementById('start-warning')
    startingDatewarning.textContent = 'Please enter a valid starting date.'
    startingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const startingDatewarning = document.getElementById('start-warning')
    startingDatewarning.classList.add('d-none')
  }
  if (startDateFormated < nowDate) {
    const startingDatewarning = document.getElementById('start-warning')
    startingDatewarning.textContent = 'Enter a valid starting date.'
    startingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const startingDatewarning = document.getElementById('start-warning')
    startingDatewarning.classList.add('d-none')
  }
  if (edingDateFormated === '') {
    const endingDatewarning = document.getElementById('expiry-warning')
    endingDatewarning.textContent = 'Please enter a valid expiry date.'
    endingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const endingDatewarning = document.getElementById('expiry-warning')
    endingDatewarning.classList.add('d-none')
  }
  if (edingDateFormated < nowDate) {
    const endingDatewarning = document.getElementById('expiry-warning')
    endingDatewarning.textContent = 'Enter a valid expiry date.'
    endingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const endingDatewarning = document.getElementById('expiry-warning')
    endingDatewarning.classList.add('d-none')
  }
  if (amount > 1000 || amount < 1) {
    const amountwarning = document.getElementById('amount-warning')
    amountwarning.textContent = 'Please enter a between 1-1000.'
    amountwarning.classList.remove('d-none')
    return false
  } else {
    const amountwarning = document.getElementById('amount-warning')
    amountwarning.classList.add('d-none')
  }
  if (edingDateFormated < nowDate) {
    const endingDatewarning = document.getElementById('expiry-warning')
    endingDatewarning.textContent = 'Enter a valid expiry date.'
    endingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const endingDatewarning = document.getElementById('expiry-warning')
    endingDatewarning.classList.add('d-none')
  }
  if (edingDateFormated < startDateFormated) {
    const endingDatewarning = document.getElementById('expiry-warning')
    endingDatewarning.textContent = 'Enter a valid expiry date.'
    endingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const endingDatewarning = document.getElementById('expiry-warning')
    endingDatewarning.classList.add('d-none')
  }
  return true
}

//////////////edit validate data////

const validateEdit = (name, code, startingDate, endingDate, amount) => {


  if (name === '') {
    const namewarning = document.getElementById('name-edit-warning')
    namewarning.textContent = 'Please enter a valid name.'
    namewarning.classList.remove('d-none')
    return false
  } else {
    const namewarning = document.getElementById('name-edit-warning')
    namewarning.classList.add('d-none')
  }
  if (name.length <= 2 || name.length > 10) {
    const namewarning = document.getElementById('name-edit-warning')
    namewarning.textContent = 'Please enter between 3-9.'
    namewarning.classList.remove('d-none')
    return false
  } else {
    const namewarning = document.getElementById('name-edit-warning')
    namewarning.classList.add('d-none')
  }
  if (!isNaN(name)) {
    const namewarning = document.getElementById('name-edit-warning')
    namewarning.textContent = 'Please insert Letter name.'
    namewarning.classList.remove('d-none')
    return false
  } else {
    const namewarning = document.getElementById('name-edit-warning')
    namewarning.classList.add('d-none')
  }
  if (code.trim() === '') {

    const codewarning = document.getElementById('code-edit-warning')
    codewarning.textContent = 'Please enter a valid code.'
    codewarning.classList.remove('d-none')
    return false
  } else {
    const codewarning = document.getElementById('code-edit-warning')
    codewarning.classList.add('d-none')
  }
  if (code.trim().length <= 2 || code.trim().length >= 16) {

    const codewarning = document.getElementById('code-edit-warning')
    codewarning.textContent = 'Please enter between 3-15.'
    codewarning.classList.remove('d-none')
    return false
  } else {
    const codewarning = document.getElementById('code-edit-warning')
    codewarning.classList.add('d-none')
  }
  if (startingDate === '') {
    const startingDatewarning = document.getElementById('start-edit-warning')
    startingDatewarning.textContent = 'Please enter a valid starting date.'
    startingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const startingDatewarning = document.getElementById('start-edit-warning')
    startingDatewarning.classList.add('d-none')
  }
  if (endingDate === '') {
    const endingDatewarning = document.getElementById('expiry-edit-warning')
    endingDatewarning.textContent = 'Please enter a valid expiry date.'
    endingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const endingDatewarning = document.getElementById('expiry-edit-warning')
    endingDatewarning.classList.add('d-none')
  }
  const nowDate = new Date()
  nowDate.setHours(0, 0, 0, 0)
  const startDateFormated = new Date(startingDate)
  startDateFormated.setHours(0, 0, 0, 0)
  const edingDateFormated = new Date(endingDate)
  edingDateFormated.setHours(23, 59, 59, 999)
  if (startDateFormated === '') {
    const startingDatewarning = document.getElementById('start-edit-warning')
    startingDatewarning.textContent = 'Please enter a valid starting date.'
    startingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const startingDatewarning = document.getElementById('start-edit-warning')
    startingDatewarning.classList.add('d-none')
  }
  if (startDateFormated < nowDate) {
    const startingDatewarning = document.getElementById('start-edit-warning')
    startingDatewarning.textContent = 'Enter a valid starting date.'
    startingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const startingDatewarning = document.getElementById('start-edit-warning')
    startingDatewarning.classList.add('d-none')
  }
  if (edingDateFormated === '') {
    const endingDatewarning = document.getElementById('expiry-edit-warning')
    endingDatewarning.textContent = 'Please enter a valid expiry date.'
    endingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const endingDatewarning = document.getElementById('expiry-edit-warning')
    endingDatewarning.classList.add('d-none')
  }
  if (edingDateFormated < nowDate) {
    const endingDatewarning = document.getElementById('expiry-edit-warning')
    endingDatewarning.textContent = 'Enter a valid expiry date.'
    endingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const endingDatewarning = document.getElementById('expiry-edit-warning')
    endingDatewarning.classList.add('d-none')
  }
  if (amount > 1000 || amount < 1) {
    const amountwarning = document.getElementById('amount-edit-warning')
    amountwarning.textContent = 'Please enter a between 1-1000.'
    amountwarning.classList.remove('d-none')
    return false
  } else {
    const amountwarning = document.getElementById('amount-edit-warning')
    amountwarning.classList.add('d-none')
  }
  if (edingDateFormated < nowDate) {
    const endingDatewarning = document.getElementById('expiry-edit-warning')
    endingDatewarning.textContent = 'Enter a valid expiry date.'
    endingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const endingDatewarning = document.getElementById('expiry-edit-warning')
    endingDatewarning.classList.add('d-none')
  }
  if (edingDateFormated < startDateFormated) {
    const endingDatewarning = document.getElementById('expiry-edit-warning')
    endingDatewarning.textContent = 'Enter a valid expiry date.'
    endingDatewarning.classList.remove('d-none')
    return false
  }
  else {
    const endingDatewarning = document.getElementById('expiry-edit-warning')
    endingDatewarning.classList.add('d-none')
  }
  return true
}
//////////////////date formater ////////////////////
function dateFormater(date) {
  const dateParsed = new Date(date);

  const year = dateParsed.getFullYear();
  const month = String(dateParsed.getMonth() + 1).padStart(2, '0');
  const day = String(dateParsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
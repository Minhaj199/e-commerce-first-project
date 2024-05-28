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

document
  .querySelector("#add-submit")
  .addEventListener("click", async function () {
    this.disable=true
    const code = document.getElementById("code").value;
    const date = document.getElementById("date").value;
    const amount = document.getElementById("amount").value;
   
    let isUser;
    const encodeCode = encodeURIComponent(code);
    const nowData = new Date();
    const compareData = new Date(date);
    if (code) {
      const isUserPromise = await fetch(
        `/admin/fetchData?from=coupen&code=${encodeCode}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      isUser = await isUserPromise.json();
    }
    if (isUser === "used") {
      showToast("This code already used");
    } else {
      if (nowData > compareData) {
        showToast("You selected a past Data");
      } else if (code && amount && date) {
        if (code.trim() === "") {
          showToast("Blank in code space not allowed");
        } else if (code.length < 3) {
          showToast("Code name should be more than three letters");
        } else if (amount % 1 !== 0) {
          showToast("Amount should not be decimal value");
        } else if (amount < 1 || amount > 1000) {
          showToast("Please give amount between 1 and 1000");
        } else {
          if (amount > 0) {
            fetch("/admin/addCoupen", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ compareData, code, amount }),
            })
              .then((result) => {
                return result.json();
              })
              .then((data) => {
                showToast(data);

                setTimeout(() => {
                location.reload();  
                }, 3000);
                
                
              });
          } else {
            showToast("please enter a valid number");
          }
        }
      } else {
        showToast("You are not fully filled");
      }
    }
  });

async function editData(id) {
  modalEdit.style.display = "block";

  const datasTobeEdited = await fetch(
    `/admin/fetchData?from=editCoupen&id=${id}`,
    {
      method: "Get",
      headers: { "Content-Type": "application/json" },
    }
  );

  const datasTobeEditedParsed = await datasTobeEdited.json();

  document.getElementById("code-edit").value = datasTobeEditedParsed.code;
  const date = new Date(datasTobeEditedParsed.Expiry);
  newDate = date.toLocaleDateString();
  document.getElementById(
    "dateLabel"
  ).textContent = `Date: Previous Date ${newDate} `;
  document.getElementById("edit-amount").value = datasTobeEditedParsed.amount;
  document.getElementById("id").textContent = datasTobeEditedParsed._id;
  document.getElementById("Date").textContent = datasTobeEditedParsed.Expiry;
}

document.querySelector(".edit-submit").addEventListener("click", async () => {

  const code = document.getElementById("code-edit").value;
  const encodeCode = encodeURIComponent(code);
  const id = document.getElementById("id").textContent;
  console.log(id);
  if (code) {
    console.log("inside code");
    const isUserPromise = await fetch(
      `/admin/fetchData?from=coupenEdit&code=${encodeCode}&ID=${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    isUser = await isUserPromise.json();
    console.log(isUser);

    console.log(isUser);
  } else if (code.length < 3) {
    showToast("Code Name should be Three letters");
  } else {
    showToast("not fully filled");
  }
  if (isUser === "used") {
    showToast("This code already used");
  } else {
    const date =
      document.getElementById("date-edit").value ||
      document.getElementById("Date").textContent;
    const amount = document.getElementById("edit-amount").value;
    const id = document.getElementById("id").textContent;
    console.log(id);
    const nowData = new Date();
    const compareData = new Date(date);

    if (nowData > compareData) {
      console.log("above date");
      showToast("You selected a past Data");
    } else if (code && amount && date) {
      if (code.trim() === "") {
        showToast("Blank in code space not allowed");
      } else if (code.length < 3) {
        showToast("Code name should be minimum 3 characters");
      } else if (amount % 1 !== 0) {
        showToast("Amount should not be decimal value");
      } else if (amount < 1 || amount > 1000) {
        showToast("Please give amount between 1 and 1000");
      } else {
        if (amount > 0) {
          console.log("reached");
          fetch("/admin/editCoupen", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ compareData, code, amount, id }),
          })
            .then((result) => {
              return result.json();
            })
            .then((data) => {
              showToast("Coupen Changed");
              setTimeout(() => {
              location.reload();  
              }, 3000);
              
              
            });
        } else {
          showToast("please enter a valid number");
        }
      }
    } else {
      showToast("not fully filled");
    }
  }
});

// const dataToBeEdit=await

async function deleteCoupen(id, code) {
  try {
  const propt = await showAlertPropt(`Are you want to delete ${code} ?`); 
    if (propt) {
      const response = await fetch("/admin/deleteCoupen", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const info = await response.json();
      console.log(info);
      if (info === "deleted") {
        showToast(`${code} Deleted`);
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
  console.log("inside tost");
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


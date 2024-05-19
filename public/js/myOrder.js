async function deleteFunction(ID) {
  const propt = await showAlertPropt("Are you wanna cancel the order?");
  try {
    if (propt) {
      fetch("/user/CanecelFromPlacedOrder", {
        method: "Delete",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ID }),
      }).then((response) => {
        if (response.ok) {
          location.reload();
        }
      });
    }
  } catch (error) {
  
    alert("internal server");

  }
}

async function deleteFunction(ID) {
  const propt = await showAlertPropt("Are you wanna cancel the order?");
  if (propt) {
    if (propt) {
      fetch("/user/CanecelFromPlacedOrder", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ID }),
      }).then((response) => {
        if (response.ok) {
          location.reload();
        }
      });
    }
  }
}
async function ChangeStatus(status, ID, index) {
  try {
    const propt = await showAlertPropt("Are you Sure To cancel ?");
    if (status === "Canceled") {
      if (propt) {
        $.ajax({
          url: "/admin/ChangeStatus",
          type: "PATCH",
          contentType: "application/json",
          data: JSON.stringify({
            ID: ID,
            status: status,
            index: index,
            from: "changeStatus",
          }),
          success: function (response) {
            const dripnod = document.querySelectorAll(".drop option");
            dripnod.forEach((option) => {
              location.reload();
            });
          },
          error: function (xhr, status, error) {
            console.error(xhr.responseText);
          },
        });
      }
    } else {
      $.ajax({
        url: "/admin/ChangeStatus",
        type: "PATCH",
        contentType: "application/json",
        data: JSON.stringify({
          ID: ID,
          status: status,
          index: index,
          from: "changeStatus",
        }),
        success: function (response) {
          const dripnod = document.querySelectorAll(".drop option");
          dripnod.forEach((option) => {
            location.reload();
          });
        },
        error: function (xhr, status, error) {
          console.error(xhr.responseText);
        },
      });
    }
  } catch (error) {
   
    showAlert("internal server error");
  }
}

//////////order Product details//////

async function cancel(index) {
  const ID = document.getElementById("orderID").value;
  try {
    const propt = await showAlertPropt("Are you wanna cancel the order?");
    if (propt) {
      fetch("/user/CanecelFromPlacedOrder", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ index, ID }),
      }).then((response) => {
        if (response.ok) {
          location.reload();
        }
      });
    }
  } catch (error) {
   
    alert("internal server error");
  }
}
//  return product///////////////
const modalin = document.getElementById("my-modalin");
const close = document.querySelector(".close");
close.onclick = () => {
  modalin.style.display = "none";
};
function returnProduct(index) {
  localStorage.setItem("index", index);

  modalin.style.display = "block";
}
document.querySelector(".submit").addEventListener("click", async () => {
  const index = localStorage.getItem("index");
  localStorage.removeItem(".index");
  const reason = document.querySelector(".reason").value;
  try {
    const propt = await showAlertPropt("Are you sure to return?");
    if (reason.trim() !== "") {
      if (propt) {
        const ID = document.getElementById("orderID").value;
        fetch("/user/CanecelFromPlacedOrder", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ index, ID, reason, from: "return order" }),
        }).then((response) => {
          if (response.ok) {
            location.reload();
          }
        });
      }
    } else {
      alert("blank not allowed");
    }
  } catch (error) {
  
    alert("Internal server errror");
  }
});

async function productReturn(status, ID, index) {
  try {
    const propt = await showAlertPropt("You want to return the product?");

    if (propt) {
      $.ajax({
        url: "/admin/returnProduct",
        type: "PATCH",
        contentType: "application/json",
        data: JSON.stringify({
          ID: ID,
          status: status,
          index: index,
          from: "changeStatus",
        }),
        success: function (response) {
          if (response === "ok") {
            location.reload();
          }
        },
        error: function (xhr, status, error) {
          console.error(xhr.responseText);
        },
      });
    } else {
      location.reload();
    }
  } catch (error) {
 
    alert("internal server ");
  }
}
function showReason(reason) {
  if (reason !== "") {
    modalin.style.display = "block";
    document.getElementById("reason-matter").textContent = reason;
  } else {
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

function showToast(message) {
  Toastify({
    text: message,
    duration: 4000,
    close: true,
    gravity: "top",
    position: "center",
  }).showToast();
}




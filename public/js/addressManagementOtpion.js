////edit////

document.addEventListener("DOMContentLoaded", function () {
  const pngElements = document.querySelectorAll(".select");

  pngElements.forEach(function (pngElement) {
    pngElement.addEventListener("click", function () {
      const id = this.dataset.addressId;
      if (!id) {
        console.error("ID not found.");
        return;
      }

      fetch("/user/patchAddress", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, from: "selectBotton" }),
      })
        .then((response) => {
          if (response.ok) {
            location.reload()
            console.log("Server responded successfully");
          } else {
            console.error("Server response error");
          }
        })
        .catch((error) => {
          console.error(
            "Error occurred while communicating with the server:",
            error
          );
        });
    });
  });
});



async function deleteAddress(element) {
  const permission =await showAlertPropt("Are you want to delete the Address");
  if (permission) {
    const id = element;
    fetch("/user/deleteAddress", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, from: "selectBotton" }),
    })
      .then((response) => {
        if (response.ok) {
          location.reload();
          console.log("Server responded successfully");
        } else {
          console.error("Server response error");
        }
      })
      .then((data) => {
        console.log(data);
      })

      .catch((error) => {
        console.error(
          "Error occurred while communicating with the server:",
          error
        );
      });
  }
}
async function showAlertPropt(message, icon) {
  try {
    const result = await Swal.fire({
      title: "Are you sure ?",
      text: message,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: "#b50c00",
      cancelButtonColor: "##bfbcbb",
      confirmButtonText: "Confirm",
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
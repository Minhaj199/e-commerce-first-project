const modal = document.getElementById("myModal");
const close = document.querySelector(".close");
const submit = document.getElementById("add-submit");

let dropArray;

const addBtn = document.getElementById("addBtn");
addBtn.onclick = () => {
  modal.style.display = "block";
};

close.onclick = () => {
  modal.style.display = "none";
};
function oppenModal() {
  modal.style.display = "block";
}

async function selectCategory() {
  const category = document.getElementById("Category").value;
  
  const response = await fetch(
    `/admin/fetchData?category=${category}&from=OfferMgm`,
    {
      method: "GET",
    }
  );
  const data = await response.json();
 

  const dropdown = document.getElementById("Prodcuct");
  dropdown.innerHTML = '<option value=""></option>';
  data.forEach((element) => {
    let option = document.createElement("option");
    option.value = element._id;
    option.textContent = element.Name;
    dropdown.appendChild(option);
  });
}


async function edit(ID) {


  const response = await fetch("/admin/editOffer", {
    method: "put",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ID }),
  });
  const message = await response.json();
  if (message === "success") {
    alert("updated");
    location.reload();
  } else {
    alert("error");
  }
}

async function deleteOffer(id) {
  try {
   
    const propt = await showAlertPropt('Are want to delete?');
    if (propt) {
      const proIDNode = document.querySelectorAll(".productsData");
     
      let proID = [];
      proIDNode.forEach((element) => {
        let id = element.getAttribute("data-ids");
        proID.push(id);
      });
    
      const value = await fetch("/admin/deleteOfferField", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proID }),
      });
      const patchRes = await value.json();
    
      const response = await fetch("/admin/deleteOffer", {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const reply = await response.json();
      showToast(reply);
      if (reply) {
        setTimeout(() => {
        location.reload();  
        }, 1000);
        
      }
    }
  } catch (error) {
    console.log(error)
  }
}

function validate() {
  const name = document.getElementById("title").value;
  if (name.trim() === "") {
    showToast("Blank in name space not allowed");
    return false;
  }
  return true;
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

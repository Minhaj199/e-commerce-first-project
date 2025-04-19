





const extended = localStorage.getItem("count");


if (!extended) {
  
  let oldData = [];
  oldValue.forEach((input) => {
    oldData.push(input.value);
  });
  let _ids = [];
  _id.forEach((input) => {
    _ids.push(input.value);
  });

  if (newCount.length !== 0) {
    const obj = {};

    for (let i = 0; i < oldData.length; i++) {
      if (newCount[i] !== oldData[i]) {
        obj[_ids[i]] = newCount[i];
      }
    }

    
    fetch("/user/patchCart", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });
  }

  location.reload();
}

const inputFields = document.querySelectorAll(".cart__total");

let totalSum = 0;

inputFields.forEach((input) => {
  totalSum += parseInt(input.textContent.replace("₹", ""));
});

const discount = parseInt(
  document.getElementById("discount").textContent.replace("₹", "")||0
);
const Total = totalSum - 0;

document.getElementById("subtotal").innerHTML = `₹ ${totalSum}`;
document.getElementById("subtotal").innerHTML = `₹ ${totalSum}`;
document.getElementById("total").innerHTML = `₹ ${Total}`;

async function deleteFromCart(id) {
  try {
    const sAlert = await showAlert() 
    if (sAlert) {
     
    const response=await  fetch("/user/dltFromCart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const responded = await response.json();
      if (responded === "ok") {
        location.reload();
      } else {
        alert("interna server error");
      }
    }
    
  
  } catch (error) {
    
    alert('internal serever error')
  }
  
}
function proceedToChackOut() {
  const total = parseInt(
    document.getElementById("subtotal").textContent.replace("₹", "")
  );

  
  if (total !== 0) {
    location.href = "/user/getpages?from=cartToCheckOut";
    
  }
}


async function showAlert(){
  
  try{
    const result = await Swal.fire({
      title: "Are you sure ?",
      text: "Once you deleted ,it will go from the cart",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b50c00",
      cancelButtonColor: "##bfbcbb",
      confirmButtonText: "Remove",
    });
    if(result.isConfirmed){
      
      return true
    }else{
      return false
    }
  }catch(e){
    
    alert('internal server error')
    return false
  }
}
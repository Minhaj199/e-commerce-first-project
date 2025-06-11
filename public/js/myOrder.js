

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
async function ChangeStatus(status, ID, index,element) {
  console.log(element)
  try {
    if (status === "Canceled") {
      const propt = await showAlertPropt("Are you Sure To cancel ?");
      if(!propt){
        document.getElementById('delivery-drop-'+index).value=document.getElementById('del-col-'+index).textContent
        return
      }
      const propt2 = await showAlertPropt("If you canceled no more further updation?");
      if (propt&&propt2) {
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
            console.log(response)
             manageOrderAmount(response,index)
             document.getElementById('del-col-'+index).textContent='Canceled'
             element.hidden=true
          },
          error: function (xhr, status, error) {
            console.error(xhr.responseText);
          },
        });
      }else{
        document.getElementById('delivery-drop-'+index).value=document.getElementById('del-col-'+index).textContent
      }
    }else if(status==='Delivered'){
      const propt = await showAlertPropt("Are you Sure change to Deliverd");
      if(!propt){
         document.getElementById('delivery-drop-'+index).value=document.getElementById('del-col-'+index).textContent
        return
      }
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
         
          document.getElementById('del-col-'+index).textContent='Delivered'
          document.getElementById('delivery-drop-'+index).value='Delivered'
        },
        error: function (xhr, status, error) {
          console.error(xhr.responseText);
        },
      });
    }
    else {
      const propt = await showAlertPropt("Are you Sure change to "+status+' ?');
      if(!propt){
         document.getElementById('delivery-drop-'+index).value=document.getElementById('del-col-'+index).textContent
        return
      }
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
          document.getElementById('del-col-'+index).textContent='Pending'
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
document.querySelector(".submit")?.addEventListener("click", async () => {
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
    if(!status){
      return
    }
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
          console.log(response)
          if (response.status === "accepted") {
            document.getElementById('drop-item-'+index).hidden=true
            
              const orderStatusColum=document.getElementById('order-status-col-'+index);
             orderStatusColum.textContent='Return Accept'
            orderStatusColum.style.color='black'
            orderStatusColum.removeAttribute('click')
            manageOrderAmount({...response})
          }else if(response.status==='rejected'){
            document.getElementById('drop-item-'+index).hidden=true
            const orderStatusColum=document.getElementById('order-status-col-'+index);
            orderStatusColum.textContent='Return Reject'
            orderStatusColum.style.color='black'
            orderStatusColum.removeAttribute('click')

          }
        },
        error: function (xhr, status, error) {
          console.error(xhr.responseText);
          console.log(error)
        },
      });
    } else {
      document.getElementById('drop-item-'+index).value=''
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

function manageOrderAmount(updatedOrder){
console.log(updatedOrder)
  ///////////// updating order amounts after cancelation ///////////
  const updatedData={discount:updatedOrder.Discount||0,subTotal:updatedOrder.SubTotal||0
    ,totalValue:updatedOrder.TotalOrderPrice,shipping:updatedOrder.ShippingCharge||0
  }
  const subTotal=document.getElementById('add-sub-total')
  const subValue=Number(document.getElementById('add-sub-total').textContent)
  subTotal.textContent=updatedData.subTotal??subValue

  const discount=document.getElementById('discount')
  const discountValue=Number(document.getElementById('discount').textContent)
  discount.textContent=updatedData.discount??discountValue
  const total=document.getElementById('Total')
  const totalValue=Number(document.getElementById('Total').textContent)
  total.textContent=updatedData.totalValue??totalValue
  const shipping=document.getElementById('shipping-charge')
  const shippingAmount=Number(document.getElementById('shipping-charge').textContent)
  shipping.textContent=updatedData.shipping??shippingAmount
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




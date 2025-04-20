async function retrayPayment(id, amount, coupenID) {
  try {
    const colorNode = document.querySelectorAll(".color");

  const sizeNode = document.querySelectorAll(".size");
  const quantityNode=document.querySelectorAll('.quantity-values')

  let colors = [];
  let IDs = [];
  let sizes = [];
  let orderQuantity=[]
  colorNode.forEach((values) => {
    colors.push(values.textContent);
    IDs.push(values.getAttribute("data-id"));
  });
  sizeNode.forEach((values) => {
    sizes.push(values.textContent);
  });
  quantityNode.forEach(value=>{
    orderQuantity.push(parseInt(value.textContent||0))
  })
  
  const encodeColores = encodeURIComponent(colors);
  const encodeIDs = encodeURIComponent(IDs);
  const encodeSizes = encodeURIComponent(sizes);
  


  //////////////checking every product have stock/////////////////
  const response = await fetch(
    `/user/fetchData?color=${encodeColores}&IDs=${encodeIDs}&size=${encodeSizes}&quantiy=${JSON.stringify(orderQuantity)}&from=retryPayment`,
    {
      method: "GET",
    }
  );
  const info = await response.json();
  
  if (info === "no stock") {
    showToast(
      "You cannot countinue this order because some product in the order is out of stock"
    );
  } else {
    
      const user = await fetch("/user/payment", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const userData = await user.json();

      let retryObj = {};
      retryObj.id = id;
      retryObj.amount = amount;
      retryObj.retry = true;
      retryObj.coupenID = coupenID || "";
      

      const response = await fetch("/user/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const responseData = await response.json();
     
      order_id = responseData.id;
      const options = {
        key: responseData.pubID,
        currency: "INR",
        name: "M-fashion",
        description: "",
        order_id: responseData.id,
        handler: async function (response) {
          const resultData = await fetch("/user/retryOrderPlacement", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ retryObj }),
          });

          const result = await resultData.json();
          showAlert("payment successfull ");
          if (result === "success") {
            setTimeout(() => {
            location.reload();  
            }, 1000);
            
          } else {
            alert("error");
          }
        },
        prefill: {
          name: `${userData.first_name} ${userData.second_name}`,
          email: userData.Email,
          contact: userData.phone_Number,
        },
        theme: {
          color: "#3399cc",
        },
      };
      const rzp = new Razorpay(options);
      rzp.open();
      rzp.on("payment.failed", () => {
        showToast("You paymen failed again");
      });
    
    
  }
  } catch (error) {
   showToast(error.message||'internal server error') 
  }
  
}

function generateInvoice(index) {

  const id = document.getElementById("orderID").value;
  location.href = `/admin/getInvoice?index=${index}&id=${id}`;
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

function showAlert(message) {
  Swal.fire({
    title: "Alert!",
    text: message,
    icon: "success",
    confirmButtonText: "Ok",
  });
}
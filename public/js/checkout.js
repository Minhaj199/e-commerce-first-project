let orderDetails = {};
let info;
let count = 0;
document.getElementById("coupen-btn").addEventListener("click", async () => {
  if (count === 0) {
    const totalValue=parseInt(document.getElementById('Total').textContent||0)

    if(totalValue<1000){
      await showAlertMessage('COUPON INFO','Minimum order should be 1000')
    return 
    }
    count++;
    const code = document.getElementById("coupen-input")?.value?.trim();
    if(code.trim()===''){
      showToast('please insert code')
      return
    }
    const encoded = encodeURIComponent(code);
    const validateCoupen = await fetch(
      `/user/fetchData?coupen=${encoded}&from=validateCoupen`,
      {
        method: "GET",
      }
    );
    info = await validateCoupen.json();

    if (info.flag === true) {
      const sub_total = parseInt(
        document.getElementById("add-sub-total").textContent
      );

      if (sub_total <= info.amount) {
        showToast("Coupen amount greater than sub total.You cannot add");
      } else {

        orderDetails.CoupenID = info.coupenID;

        document.getElementById("discount").textContent = info.amount;
        document.getElementById("Total").textContent = total - info.amount;

        showToast(info.message);
      }
    } else {
      showToast(info);
      setTimeout(() => {
        location.reload();
      }, 4100);
    }
  }
});

function ToChangeAddress() {
  try {
    const address = document.querySelector(".change-address");
    const order = document.querySelector(".order");
    const btn = document.querySelector(".change-btn");
    const add = document.querySelector(".add-button-img");

    if (order.style.display !== "none") {
      order.style.display = "none";
      address.style.display = "block";
      btn.textContent = "Back";
      add.style.display = "block";
      localStorage.setItem("visible", "address");
      fetch("");
    } else {
      order.style.display = "block";
      address.style.display = "none";
      btn.textContent = "Change";
      add.style.display = "none";
      localStorage.setItem("visible", "order");
    }
  } catch (error) {}
}
window.onload = function () {
  let previousDivVisible = localStorage.getItem("visible");
  if (previousDivVisible === "address") {
    document.querySelector(".order").style.display = "none";
    document.querySelector(".change-address").style.display = "block";
    document.querySelector(".change-btn").textContent = "Back";
    document.querySelector(".add-button-img").style.display = "block";
  }
};

const allTotal = document.querySelectorAll(".All-total");

let subTotal = 0;

allTotal.forEach((input) => {
  subTotal += parseInt(input.textContent);
});

document.getElementById("add-sub-total").innerHTML = ` ${subTotal}`;
const discount = parseInt(document.getElementById("discount").textContent);
const shiping = parseInt(document.getElementById("shipping-charge").innerHTML);
const total = subTotal + shiping - discount;
document.getElementById("Total").textContent = total;

async function remove(id) {
  const propt = await showAlertPropt("Are you want to remove the Item ?",'info');
  if (propt)
    try {
     fetch("/user/removeProduct", {
       method: "PATCH",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({ id }),
     }).then((response) => {
       if (response.ok) {
         location.href = "/user/getpages?from=cartToCheckOut";
       }
     });   
    } catch (error) {
      showToast('internal server error')
    }
   
}

document.querySelector(".submit").addEventListener("click", async function () {
  document.getElementById("add-sub-total").innerHTML = ` ${subTotal}`;
  const discount = parseInt(document.getElementById("discount").textContent);
  const shiping = parseInt(
    document.getElementById("shipping-charge").innerHTML
  );
  const total = subTotal + shiping - discount;
  let addressCheck = document
    .querySelector(".change-btn")
    .getAttribute("data-address");
  if (addressCheck) {
    try {
      const sweetAlertPropt = await showAlertPropt("Are You Going to proceed ?",'info');
      if (sweetAlertPropt) {
        let radio = document.getElementsByName("payment");
        paymentOption = "";
        for (let i = 0; radio.length; i++) {
          if (radio[i].checked) {
            paymentOption = radio[i].value;
            break;
          }
        }
        if (paymentOption === "Razor Pay") {
          const amount = total;
          const user = await fetch("/user/payment", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const userData = await user.json();

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
            handler: function (response) {


              order(orderDetails, discount, shiping, total);

              fetch("/user/orderPlacement", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderDetails }),
              }).then((response) => {
                if (response.ok) {
                  location.href = "/user/getpages?from=afterPlacedOrder";
                }
              });
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
            order(orderDetails, discount, shiping, total, "payment-Failed");

            for (let i = 0; i < orderDetails.Order.length; i++) {
              orderDetails.Order[i].admin = false;
              orderDetails.Order[i].status = "payment-Failed";
            }

            fetch("/user/orderFailed", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ orderDetails }),
            }).then((response) => {
              if (response.ok) {
                location.href = "/user/getpages?from=orderFailed";
              }
            });
          });
        } else if (paymentOption === "Wallet") {
          const discount = parseInt(
            document.getElementById("discount").textContent
          );
          const shiping = parseInt(
            document.getElementById("shipping-charge").innerHTML
          );
          const total = subTotal + shiping - discount;

          const fetchData = await fetch("/user/fetchData?from=wallet", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          const walletAmount = await fetchData.json();

          const amount = total - walletAmount;

          if (walletAmount <= 0) {
            showToast("Insufficient Wallet Balence");
          } else if (amount > 0) {
            const propt = await showAlertPropt(
              `The Wallet Amount is ${walletAmount}.Do you want to take rest from online?`
            ,'info');
           
           
            if (propt) {
              
              const user = await fetch("/user/payment", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              });
              const userData = await user.json();

              const response = await fetch("/user/payment", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount }),
              });
              let payment_id = "";
              let order_id = "";
              const responseData = await response.json();

              order_id = responseData.id;
              const options = {
                key: responseData.pubID,
                currency: "INR",
                name: "M-fashion",
                description: "",
                order_id: responseData.id,
                handler: function (response) {
                  showToast("payment successfull ");
                  payment_id = response.razorpay_payment_id;

                  let orderDetails = {};
                  orderDetails.paymentID = payment_id;
                  orderDetails.paymentOrderID = order_id;
                  orderDetails.paymentOption = "Wallet+Online";
                  let Product_name = [];
                  const discount = parseInt(
                    document.getElementById("discount").textContent
                  );
                  const shiping = parseInt(
                    document.getElementById("shipping-charge").innerHTML
                  );
                  const total = subTotal + shiping - discount;
                  walletAndWalletPlusRazor(
                    orderDetails,
                    Product_name,
                    discount,
                    shiping,
                    total
                  );
                  for (let i = 0; i < orderDetails.productID.length; i++) {
                    orderDetails.Order.push({
                      ProductID: orderDetails.productID[i],
                      Product_name: Product_name[i],
                      quantity: orderDetails.eachQuantity[i],
                      color: orderDetails.colors[i],
                      size: orderDetails.sizes[i],
                      price: orderDetails.Price[i],
                      total: orderDetails.eachTotal[i],
                      status: "Pending",
                      admin: true,
                      razorPay: amount,
                      wallet: walletAmount,
                      reason: "",
                      invoiceNumber: invoiceNumber(),
                    });
                  }

                  fetch("/user/orderPlacement", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ orderDetails }),
                  }).then((response) => {
                    if (response.ok) {
                      location.href = "/user/getpages?from=afterPlacedOrder";
                    }
                  });
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
                showToast("payment-failed");
              });
            }
          } else {
            let Product_name = [];
            orderDetails.paymentOption = "Wallet";
            const discount = parseInt(
              document.getElementById("discount").textContent
            );
            const shiping = parseInt(
              document.getElementById("shipping-charge").innerHTML
            );
            const total = subTotal + shiping - discount;
            walletAndWalletPlusRazor(
              orderDetails,
              Product_name,
              discount,
              shiping,
              total
            );
            for (let i = 0; i < orderDetails.productID.length; i++) {
              orderDetails.Order.push({
                ProductID: orderDetails.productID[i],
                Product_name: Product_name[i],
                quantity: orderDetails.eachQuantity[i],
                color: orderDetails.colors[i],
                size: orderDetails.sizes[i],
                price: orderDetails.Price[i],
                total: orderDetails.eachTotal[i],
                status: "Pending",
                admin: true,
                wallet: total,
                reason: "",
                invoiceNumber: invoiceNumber(),
              });
            }

            fetch("/user/orderPlacement", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ orderDetails }),
            }).then((response) => {
              if (response.ok) {
                location.href = "/user/getpages?from=afterPlacedOrder";
              }
            });
          }
        } else {
          if (total < 1000) {
            const discount = parseInt(
              document.getElementById("discount").textContent
            );
            const shiping = parseInt(
              document.getElementById("shipping-charge").innerHTML
            );
            const total = subTotal + shiping - discount;

            order(orderDetails, discount, shiping, total);

            if (info) {
            }

            fetch("/user/orderPlacement", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ orderDetails }),
            }).then((response) => {
              if (response.ok) {
                location.href = "/user/getpages?from=afterPlacedOrder";
              }
            });
          } else {
            showAlert("Order above Rs 1000 Cash on delivery not allowed");
          }
        }
      }
    } catch (error) {
      alert("Internal server error");
    }
  } else {
    showToast("please add a address");
  }
});
document.addEventListener("DOMContentLoaded", function () {
  try {
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
              location.reload();
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
  } catch (error) {}
});
async function deleteAddress(element) {
  try {
  const permission =await showAlertPropt(
    "Are you want to delete the Address?",
    "info"
  );
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
        } else {
        }
      })
      .then((data) => {})

      .catch((error) => {
        console.error(
          "Error occurred while communicating with the server:",
          error
        );
      });
  }  
  } catch (error) {
    showToast('internal server error')
  }
  
}
// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("openModalBtn");

// Get the <span> element that closes the modal
var span = document.getElementById("close");

// When the user clicks the button, open the modal
async function modaling(id) {
  try {
    const response = await fetch(
      `/user/getManageAddress?id=${id}&from=adressEditModalin`,
      {
        method: "GET",
      }
    );

    const address = await response.json();

    document.getElementById("name").value = address.Name;
    document.getElementById("mobile").value = address.Mobile;
    document.getElementById("Locality").value = address.Locality;
    document.getElementById("Alternative Mobile").value =
      address.Aleternative_mobile;
    document.getElementById("Pin").value = address.Pin;
    document.getElementById("Town").value = address.Town;
    document.getElementById("Email").value = address.Email;
    document.getElementById("landMark").value = address.Land_mark;
    document.getElementById("address").value = address.Address;
    document.getElementById("id").value = address._id;

    modal.style.display = "block";
  } catch (error) {}
}

// span.onclick = function () {
//   modal.style.display = "none";
// };
async function sumbitModalin(event) {
  event.preventDefault();
  let editedData = {};

  editedData.Name = document.getElementById("name").value;
  editedData.Mobile = document.getElementById("mobile").value;
  editedData.Locality = document.getElementById("Locality").value;
  editedData.Aleternative_mobile =
    document.getElementById("Alternative Mobile").value;
  editedData.Pin = document.getElementById("Pin").value;
  editedData.Town = document.getElementById("Town").value;
  editedData.Email = document.getElementById("Email").value;
  editedData.Land_mark = document.getElementById("landMark").value;
  editedData.Address = document.getElementById("address").value;
  const id = document.getElementById("id").value;

  if (
    editedData.Name.trim() === "" ||
    editedData.Email.trim() === "" ||
    editedData.Mobile.trim() === "" ||
    editedData.Locality.trim() === "" ||
    editedData.Aleternative_mobile.trim() === "" ||
    editedData.Pin.trim() === "" ||
    editedData.Town.trim() === "" ||
    editedData.Land_mark.trim() === ""
  ) {
    showToast("blank not allowed");
  } else {
    const validation = editCheckAddAddress(editedData);

    if (validation === true) {
      const response = await fetch("/user/putAddress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...editedData, id, from: "checkOutModalin" }),
      });
      const responded = await response.json();
      if (responded === "ok") {
        location.reload();
      } else {
        showToast("Internal server error");
      }
      location.reload();
    }
    return;
  }
}
const addCloseBtn = document
  .getElementById("add-close")
  .addEventListener("click", () => {
    document.getElementById("myAddModal").style.display = "none";
  });
document.querySelector(".add-button-img").addEventListener("click", () => {
  document.getElementById("myAddModal").style.display = "block";
});

let OneTime = true;
const addBtn = document.getElementById("add-btn");
addBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    const addressDataCheckout = {};
    addressDataCheckout.name = document.getElementById("add-name").value;
    addressDataCheckout.email = document.getElementById("add-Email").value;
    addressDataCheckout.mobile = document.getElementById("add-mobile").value;
    addressDataCheckout.lacality =
      document.getElementById("add-Locality").value;
    addressDataCheckout.Aleternative_mobile = document.getElementById(
      "add-Alternative Mobile"
    ).value;
    addressDataCheckout.pin = document.getElementById("add-Pin").value;
    addressDataCheckout.town = document.getElementById("add-Town").value;
    addressDataCheckout.landMark =
      document.getElementById("add-landMark").value;
    addressDataCheckout.address = document.getElementById("add-address").value;
    addressDataCheckout.from = "addFromCheckOut";
    if (
      addressDataCheckout.name.trim() === "" ||
      addressDataCheckout.email.trim() === "" ||
      addressDataCheckout.mobile.trim() === "" ||
      addressDataCheckout.lacality.trim() === "" ||
      addressDataCheckout.Aleternative_mobile.trim() === "" ||
      addressDataCheckout.pin.trim() === "" ||
      addressDataCheckout.town.trim() === "" ||
      addressDataCheckout.landMark.trim() === ""
    ) {
      showToast("blank not allowed");
    } else {
      const validation = checkAddAddress(addressDataCheckout);
      if (validation) {
        addBtn.disabled = true;
        const jsonData = await fetch("/user/postAddress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addressDataCheckout }),
        });
        const response = await jsonData.json();
        if (response === "recieved") {
          showToast("Address Added");
          setTimeout(() => {
            location.reload();
          }, 3000);
        }
      }
    }
  } catch (error) {
    alert("Internal server error");
  }
});

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

/////coupen code apply//////

function order(orderDetails, discount, shiping, total, failed) {
  orderDetails.paymentOption = failed || paymentOption;
  orderDetails.subTotal = subTotal;
  orderDetails.discount = discount;
  orderDetails.deleveryCharge = shiping;
  orderDetails.total = total;
  orderDetails.productID = [];
  const idNode = document.querySelectorAll(".IDs");
  idNode.forEach((values) => {
    orderDetails.productID.push(values.value);
  });
  orderDetails.sizes = [];
  const sizesNode = document.querySelectorAll(".IDs");
  sizesNode.forEach((inputs) => {
    orderDetails.sizes.push(inputs.getAttribute("data-Size"));
  });
  orderDetails.colors = [];
  const colorsNode = document.querySelectorAll(".IDs");
  colorsNode.forEach((inputs) => {
    orderDetails.colors.push(inputs.getAttribute("data-Color"));
  });
  orderDetails.CartIDs = [];
  const CartIdNode = document.querySelectorAll(".IDs");
  CartIdNode.forEach((inputs) => {
    orderDetails.CartIDs.push(inputs.getAttribute("data-CartID"));
  });
  orderDetails.Price = [];
  const priceIdNode = document.querySelectorAll(".price");
  priceIdNode.forEach((inputs) => {
    orderDetails.Price.push(parseInt(inputs.textContent));
  });
  orderDetails.eachTotal = [];
  const eachTotalNode = document.querySelectorAll(".All-total");
  eachTotalNode.forEach((inputs) => {
    orderDetails.eachTotal.push(parseInt(inputs.textContent));
  });
  orderDetails.eachQuantity = [];
  const eachQutantityNode = document.querySelectorAll(".quatity");
  eachQutantityNode.forEach((inputs) => {
    orderDetails.eachQuantity.push(parseInt(inputs.textContent));
  });
  let productNames = document.querySelectorAll(".name");
  let Product_name = [];
  productNames.forEach((inputs) => {
    Product_name.push(inputs.textContent);
  });
  orderDetails.Order = [];
  orderDetails.addressID = document
    .querySelector(".change-btn")
    .getAttribute("data-address");
  for (let i = 0; i < orderDetails.productID.length; i++) {
    orderDetails.Order.push({
      ProductID: orderDetails.productID[i],
      Product_name: Product_name[i],
      quantity: orderDetails.eachQuantity[i],
      color: orderDetails.colors[i],
      size: orderDetails.sizes[i],
      price: orderDetails.Price[i],
      total: orderDetails.eachTotal[i],
      status: "Pending",
      admin: true,
      reason: "",
      invoiceNumber: invoiceNumber(),
    });
  }
}

function walletAndWalletPlusRazor(
  orderDetails,
  Product_name,
  discount,
  shiping,
  total
) {
  orderDetails.subTotal = subTotal;
  orderDetails.discount = discount;
  orderDetails.deleveryCharge = shiping;
  orderDetails.total = total;
  orderDetails.productID = [];
  const idNode = document.querySelectorAll(".IDs");
  idNode.forEach((values) => {
    orderDetails.productID.push(values.value);
  });
  orderDetails.sizes = [];
  const sizesNode = document.querySelectorAll(".IDs");
  sizesNode.forEach((inputs) => {
    orderDetails.sizes.push(inputs.getAttribute("data-Size"));
  });
  orderDetails.colors = [];
  const colorsNode = document.querySelectorAll(".IDs");
  colorsNode.forEach((inputs) => {
    orderDetails.colors.push(inputs.getAttribute("data-Color"));
  });
  orderDetails.CartIDs = [];
  const CartIdNode = document.querySelectorAll(".IDs");
  CartIdNode.forEach((inputs) => {
    orderDetails.CartIDs.push(inputs.getAttribute("data-CartID"));
  });
  orderDetails.Price = [];
  const priceIdNode = document.querySelectorAll(".price");
  priceIdNode.forEach((inputs) => {
    orderDetails.Price.push(parseInt(inputs.textContent));
  });
  orderDetails.eachTotal = [];
  const eachTotalNode = document.querySelectorAll(".All-total");
  eachTotalNode.forEach((inputs) => {
    orderDetails.eachTotal.push(parseInt(inputs.textContent));
  });
  orderDetails.eachQuantity = [];
  const eachQutantityNode = document.querySelectorAll(".quatity");
  eachQutantityNode.forEach((inputs) => {
    orderDetails.eachQuantity.push(parseInt(inputs.textContent));
  });
  let productNames = document.querySelectorAll(".name");

  productNames.forEach((inputs) => {
    Product_name.push(inputs.textContent);
  });
  orderDetails.Order = [];
  orderDetails.addressID = document
    .querySelector(".change-btn")
    .getAttribute("data-address");
}
///generate invoice/////
function invoiceNumber() {
  let date = new Date();
  let day = ("0" + date.getDate()).slice(-2);
  let month = ("0" + (date.getDate() + 1)).slice(-2);
  let year = date.getFullYear();
  let random = Math.floor(Math.random() * 10000000);
  let invoice = `INV-MFASHION-${year}${month}${day}-${random}`;
  return invoice;
}

function checkAddAddress(addressDataCheckout) {
  if (addressDataCheckout.name.length < 4) {
    showToast("Name should be atleast four characters");
    return false;
  } else if (addressDataCheckout.name.length > 10) {
    showToast("Name should be below Ten characters");
    return false;
  } else if (addressDataCheckout.name.trim() === "") {
    showToast("Please insert Name");
    return false;
  }
  if (addressDataCheckout.mobile) {
    let phonePattern = /^[0-9 ()+-]+$/;
    const phone = addressDataCheckout.mobile;
    if (!phone.match(phonePattern)) {
      showToast("Please Enter a valid Mobile");
      return false;
    }
  }
  if (addressDataCheckout.mobile.length < 8) {
    showToast("Mobile number Should be atleas eight");

    return false;
  }
  if (addressDataCheckout.mobile.length > 15) {
    showToast("Mobile number Should not be more than fifteen");
    return false;
  }
  if (addressDataCheckout.pin.length < 6) {
    showToast("PIN must be 6 charaters");
    return false;
  } else if (addressDataCheckout.pin.length > 6) {
    showToast("PIN must not be more than 6 character");
    return false;
  } else if (addressDataCheckout.pin) {
    let pattern = /^[0-9]+$/;
    if (!addressDataCheckout.pin.match(pattern)) {
      showToast("Please enter a valid PIN");
      return false;
    }
  }
  if (addressDataCheckout.town.length < 3) {
    showToast("Town characters should be more than three");
    return false;
  }
  if (addressDataCheckout.town.length > 15) {
    showToast("Town characters should not be more than fifteen");
    return false;
  }
  if (addressDataCheckout.town) {
    const pattern = /^[a-zA-Z\s]*$/;
    if (!addressDataCheckout.town.match(pattern)) {
      showToast("Town name can only contain alphabetic characters");
      return false;
    }
  }
  if (addressDataCheckout.email) {
    let pattern = /^[^\s@]+@gmail\.com$/;

    if (!addressDataCheckout.email.match(pattern)) {
      showToast("Please Insert A valid Email");
      return false;
    }
  }
  if (addressDataCheckout.Aleternative_mobile) {
    let phonePattern = /^[0-9 ()+-]+$/;
    const phone = addressDataCheckout.Aleternative_mobile;
    if (!phone.match(phonePattern)) {
      showToast("Please Enter a valid Alternative Mobile");
      return false;
    }
  }
  if (addressDataCheckout.Aleternative_mobile.length < 8) {
    showToast("Alternative Number Should be atleas eight");

    return false;
  }
  if (addressDataCheckout.Aleternative_mobile.length > 15) {
    showToast("Alternative Number Should not be more than 15");
    return false;
  }
  if (addressDataCheckout.lacality.length < 3) {
    showToast("Locality characters should be more than three");
    return false;
  }
  if (addressDataCheckout.lacality.length > 15) {
    showToast("Locality characters should not be more than fifteen");
    return false;
  }
  if (addressDataCheckout.lacality) {
    const pattern = /^[a-zA-Z\s]*$/;
    if (!addressDataCheckout.lacality.match(pattern)) {
      showToast("Locality can only contain alphabetic characters");
      return false;
    }
  }
  if (addressDataCheckout.landMark.length < 3) {
    showToast("Land Mark characters should be more than three");
    return false;
  }
  if (addressDataCheckout.landMark.length > 15) {
    showToast("Land Mark characters should not be more than fifteen");
    return false;
  }
  if (addressDataCheckout.landMark) {
    const pattern = /^[a-zA-Z\s]*$/;
    if (!addressDataCheckout.landMark.match(pattern)) {
      showToast("Land Mark can only contain alphabetic characters");
      return false;
    }
  }

  return true;
}
function editCheckAddAddress(editedData) {
  if (editedData.Name.length < 4) {
    showToast("Name should be atleast four characters");
    return false;
  } else if (editedData.Name.length > 10) {
    showToast("Name should be below Ten characters");
    return false;
  }
  if (editedData.Mobile) {
    let phonePattern = /^[0-9 ()+-]+$/;
    const phone = editedData.Mobile;
    if (!phone.match(phonePattern)) {
      showToast("Please Enter a valid Mobile");
      return false;
    }
  }
  if (editedData.Mobile.length < 8) {
    showToast("Mobile number Should be atleas eight");

    return false;
  }
  if (editedData.Mobile.length > 15) {
    showToast("Mobile number Should not be more than fifteen");
    return false;
  }
  if (editedData.Pin.length < 6) {
    showToast("PIN must be 6 charaters");
    return false;
  } else if (editedData.Pin.length > 6) {
    showToast("PIN must not be more than 6 character");
    return false;
  } else if (editedData.Pin) {
    let pattern = /^[0-9]+$/;
    if (!editedData.Pin.match(pattern)) {
      showToast("Please enter a valid PIN");
      return false;
    }
  }
  if (editedData.Town.length < 3) {
    showToast("Town characters should be more than three");
    return false;
  }
  if (editedData.Town > 15) {
    showToast("Town characters should not be more than fifteen");
    return false;
  }
  if (editedData.Town) {
    const pattern = /^[a-zA-Z\s]*$/;
    if (!editedData.Town.match(pattern)) {
      showToast("Town name can only contain alphabetic characters");
      return false;
    }
  }
  if (editedData.Email) {
    let pattern = /^[^\s@]+@gmail\.com$/;

    if (!editedData.Email.match(pattern)) {
      showToast("Please Insert A valid Email");
      return false;
    }
  }
  if (editedData.Aleternative_mobile) {
    let phonePattern = /^[0-9 ()+-]+$/;
    const phone = editedData.Aleternative_mobile;
    if (!phone.match(phonePattern)) {
      showToast("Please Enter a valid Alternative Mobile");
      return false;
    }
  }
  if (editedData.Aleternative_mobile.length < 8) {
    showToast("Alternative Number Should be atleas eight");

    return false;
  }
  if (editedData.Aleternative_mobile.length > 15) {
    showToast("Alternative Number Should not be more than 15");
    return false;
  }
  if (editedData.Locality.length < 3) {
    showToast("Locality characters should be more than three");
    return false;
  }
  if (editedData.Locality.length > 15) {
    showToast("Locality characters should not be more than fifteen");
    return false;
  }
  if (editedData.Locality) {
    const pattern = /^[a-zA-Z\s]*$/;
    if (!editedData.Locality.match(pattern)) {
      showToast("Locality can only contain alphabetic characters");
      return false;
    }
  }
  if (editedData.Land_mark.length < 3) {
    showToast("Land Mark characters should be more than three");
    return false;
  }
  if (editedData.Land_mark.length > 15) {
    showToast("Land Mark characters should not be more than fifteen");
    return false;
  }
  if (editedData.Land_mark) {
    const pattern = /^[a-zA-Z\s]*$/;
    if (!editedData.Land_mark.match(pattern)) {
      showToast("Land Mark can only contain alphabetic characters");
      return false;
    }
  }

  return true;
}

///////sweet alert//////

function showAlert(message) {
  Swal.fire({
    title: "Alert!",
    text: message,
    icon: 'warning',
    confirmButtonText: "Ok",
  });
}

////toast////

function showToast(message) {
  Toastify({
    text: message,
    duration: 4000,
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
async function showAlertMessage(title,message) {
  try {
    const result = await Swal.fire({
      title: title,
      text: message,
      icon: "warning",
      showCancelButton: false,
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
async function openTandC(){
  try {
    await showAlertMessage('COUPON INFO','Coupon only applied order above 1000')
  } catch (error) {
    
  }
} 
function ToChangeAddress() {
  location.href = "/user/getManageAddress?from=getManage";
}

const allTotal = document.querySelectorAll(".All-total");
console.log(allTotal);
let subTotal = 0;

allTotal.forEach((input) => {
  subTotal += parseInt(input.textContent);
});

console.log(subTotal);

document.getElementById("add-sub-total").innerHTML = ` ${subTotal}`;
const discount = parseInt(document.getElementById("discount").textContent);
const shiping = parseInt(document.getElementById("shipping-charge").innerHTML);
const total = subTotal + shiping - discount;
document.getElementById("Total").textContent = total;

function remove(id) {
  if (confirm("Are you want to remove the Item"))
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
}

document.querySelector(".submit").addEventListener("click", function () {
  let radio = document.getElementsByName("payment");
  paymentOption = "";
  for (let i = 0; radio.length; i++) {
    if (radio[i].checked) {
      paymentOption = radio[i].value;
      break;
    }
  }
  let orderDetails = {};
  orderDetails.paymentOption = paymentOption;
  orderDetails.subTotal = subTotal;
  orderDetails.discount = discount;
  orderDetails.deleveryCharge = 60;
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
  console.log(orderDetails);
  orderDetails.Order = [];

  for (let i = 0; i < orderDetails.productID.length; i++) {
    orderDetails.Order.push({
      ProductID: orderDetails.productID[i],
      quantity: orderDetails.eachQuantity[i],
      color: orderDetails.colors[i],
      size: orderDetails.sizes[i],
      price: orderDetails.Price[i],
      total: orderDetails.eachTotal[i],
    });
  }

  fetch("/user/orderPlacement", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderDetails }),
  });
});

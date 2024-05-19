document.getElementById("home").addEventListener("click", () => {
  location.href = "/user";
});

document.getElementById("order-history").addEventListener("click", () => {
  const id = document.getElementById("order-id").getAttribute("data-id");
  if (id) {
    location.href = `/user/getpages?proID=${id}&from=orderProductDetails`;
  } else {
    location.href = "/user";
  }
});

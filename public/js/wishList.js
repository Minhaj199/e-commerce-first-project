async function removeFromWishList(id) {
  try {
  const sweetPrompt =await showAlert();
  if (sweetPrompt) {
    const response = await fetch("/user/removeFromWishList", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const message = await response.json();
    if (message) {
      location.reload();
    }
  }  
  } catch (error) {
   showToast('internal server error') 
  }
  
}
document.querySelector(".cart__btn").addEventListener("click", async () => {
  const response = await fetch("/user/wishToCart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const message = await response.json();
  if (message === "success") {
    location.href = "/user/getpages?from=cart";
  }else{
    showToast('no items')
  }
});
function showToast(message) {
  
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "center",
  }).showToast();
}
async function showAlert() {
  
  try {
    const result = await Swal.fire({
      title: "Are you sure ?",
      text: "Once you deleted ,it will go from the wishlist",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b50c00",
      cancelButtonColor: "##bfbcbb",
      confirmButtonText: "Remove",
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
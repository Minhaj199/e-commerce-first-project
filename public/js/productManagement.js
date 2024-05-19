async function fun(event) {
    console.log(event);
    event.preventDefault();
    
  try {
    const prompt = await showAlertPropt(
      "Are you sure you want to delete the item?"
    );
    console.log(prompt)
    if (prompt) {
        
      event.target.submit()
    } else {
      return false;
    }
  } catch (e) {
    alert("internal server error");
  }
  return false
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

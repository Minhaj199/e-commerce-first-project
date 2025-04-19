function validateForm() {
  let firstName = document.getElementById("form3Example1m").value;
  let lastName = document.getElementById("form3Example1n").value;
  let email = document.getElementById("emailId").value;
  let phone = document.getElementById("form3Example9").value;

 
  if (firstName.trim() === "") {
    let fn = document.getElementById("message");
    fn.textContent = "Please insert first name";

    return false;
  }
  if (lastName.trim() === "") {
    let fn = document.getElementById("message");
    fn.textContent = " Please Insert name";

    return false;
  }
  if (email.trim() === "") {
    let fn = document.getElementById("message");
    fn.textContent = "Please insert a email";
    return false;
  } else {
    let pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    if (!email.match(pattern)) {
      let fn = document.getElementById("Email");
      fn.textContent = "Please insert a valid email";
      return false;
    }
  }
  if (phone.trim() === "") {
    let fn = document.getElementById("message");
    fn.textContent = "Please insert Phone number";
    return false;
  } else {
    let phonePattern = /^\d{10}$/;
    let isNumber = /^\d+$/;
    if (!phone.match(phonePattern)) {
      let fn = document.getElementById("message");
      fn.textContent = "Please insert valid Phone number";
      return false;
    }
  }
}
function validatePassword() {
  let oldPassword = document.getElementById("form3Example21").value;
  let password = document.getElementById("form3Example10").value;
  let confirmPassword = document.getElementById("form3Example11").value;

  if (oldPassword.trim() === "") {
    let fn = document.getElementById("messageToPassword");
    fn.textContent = " Insert  Old assword";
    return false;
  }
  if (password.trim() === "") {
    let fn = document.getElementById("messageToPassword");
    fn.textContent = "Insert password";
    return false;
  }

  if (password.length < 6) {
    let fn = document.getElementById("messageToPassword");
    fn.textContent = "please inseart more than 6 charector ";
    return false;
  }
  if (confirmPassword.trim() === "") {
    let fn = document.getElementById("messageToPassword");
    fn.textContent = "Insert confirm password";

    return false;
  }
  if (password !== confirmPassword) {
    let fn = document.getElementById("messageToPassword");
    fn.textContent = "Password not matching";
    return false;
  }
  return true;
}

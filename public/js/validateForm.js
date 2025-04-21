function validateForm() {
  let firstName = document.getElementById("form3Example1m").value;
  let lastName = document.getElementById("form3Example1n").value;
  let email = document.getElementById('form3Example8').value
 
  let phone = document.getElementById("form3Example9").value;
  let password = document.getElementById("form3Example10").value;
  let confirmPassword = document.getElementById("form3Example11").value;

  if (firstName.trim() === "") {
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    let fn = document.getElementById("first-name");
    fn.textContent = "Insert First Name ";
    return false;
  }
  if (firstName.length < 3) {
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    let fn = document.getElementById("first-name");
    fn.textContent = "Should be more than three characters";
    return false;
  }
  if (firstName.length > 10) {
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    let fn = document.getElementById("first-name");
    fn.textContent = "Should be less than 10 characters";
    return false;
  }
  if (!isNaN(firstName) ) {
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    let fn = document.getElementById("first-name");
    fn.textContent = "Plase insert text name";
    return false;
  }
  if (lastName.trim() === "") {
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    const fn = document.getElementById("second-name");
    fn.textContent = "Insert LastName Name ";
    return false;
  }
  if (lastName.length > 10) {
  
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    const fn = document.getElementById("second-name");
    fn.textContent = "Should be less than 10 characters";
    return false;
  }
  if (email.trim() === "") {
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    let fn = document.getElementById("Email");
    fn.textContent = "Please insert email";
    return false;
  } else {
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    let pattern = /^[^\s@]+@gmail\.com$/;
    if (!email.match(pattern)) {
      let fn = document.getElementById("Email");
      fn.textContent = "Please insert a valid email";
      return false;
    }
  }
  if (phone.trim() === "") {
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    let fn = document.getElementById("Phone");
    fn.textContent = "Please insert  Phone number";
    return false;
  } else {
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    let phonePattern = /^[0-9 ()+-]+$/;
    const whiteSpacePattern = /\s/;
    if (!phone.match(phonePattern)) {
      let fn = document.getElementById("Phone");
      fn.textContent = "Please insert valid Phone number";
      return false;
    } else if (phone.match(whiteSpacePattern)) {
      let fn = document.getElementById("Phone");
      fn.textContent = "White space is not allowed";
      return false;
    }
  }
  if (phone.length > 13) {
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    let fn = document.getElementById("Phone");
    fn.textContent = "Number Should be less than 13 ";
    return false;
  }
  if (phone.length < 10) {
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    let fn = document.getElementById("Phone");
    fn.textContent = "Number Should be atleast Ten";
    return false;
  }

  if (password) {
    const pattern = /\s/;
    if (password.match(pattern)) {
      findingAllBlankField(
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        phone
      );
      let fn = document.getElementById("Password");
      fn.textContent = "Spacing is not allowed ";
      return false;
    }
  }
  if (password.trim() === "") {
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    let fn = document.getElementById("Password");
    fn.textContent = "please insert Password ";
    return false;
  }

  if (password.length < 6) {
    let fn = document.getElementById("Password");
    fn.textContent = "please insert more than 6 character ";
    return false;
  }
  if (confirmPassword.trim() === "") {
    findingAllBlankField(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone
    );
    let fn = document.getElementById("Conform-password");
    fn.textContent = "Insert Conform password ";
    return false;
  }
  if (password !== confirmPassword) {
    let fn = document.getElementById("Conform-password");
    fn.textContent = "Password not matching";
    return false;
  }
  return true;
}
function loginVal() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (email.trim() == "") {
  
    alert("please insert email");
    return false;
  }
  if (password.trim() == "") {
    alert("please inset password");
    return false;
  }
  return true;
}

function emailVal() {
  const email = document.getElementById("email").value;

  if (email.trim() == "") {
 
    alert("please insert email");
    return false;
  }
  let pattern = /^[^\s@]+@gmail\.com$/;
  if (!email.match(pattern)) {
    alert("please insert a valid email");
    return false;
  }

  return true;
}
function validatePassword() {
  const password = document.getElementById("form3Example10").value;
  const Cpassword = document.getElementById("form3Example11").value;

  if (password.trim() === "") {
    alert("Blank not allowed");
    return false;
  } else if (password.length < 6) {
    alert("password should be more than 6 charaters");
    return false;
  } else if (password !== Cpassword) {
    alert("password not match");
    return false;
  } else if (password) {
    const whiteSpacePattern = /\s/;
    if (password.match(whiteSpacePattern)) {
      alert("White space not allowed in password");
      return false;
    }
  }
  return true;
}

function makingWaringDisspear() {
  document.getElementById("first-name").textContent = "";
  document.getElementById("second-name").textContent = "";
  document.getElementById("Email").textContent = "";
  document.getElementById("Phone").textContent = "";
  document.getElementById("Password").textContent = "";
  document.getElementById("Conform-password").textContent = "";
  const warning = document.getElementById("warning") || 0;
  if (warning !== 0) {
    warning.textContent = "";
  }
}
function findingAllBlankField(
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  phone
) {
  makingWaringDisspear();
  if (firstName === "") {
    let fn = document.getElementById("first-name");
    fn.textContent = "Please insert first name";
  }
  if (lastName === "") {
    let fn = document.getElementById("second-name");
    fn.textContent = " Insert last name";
  }
  if (email === "") {
    let fn = document.getElementById("Email");
    fn.textContent = "Please insert a email";
  }
  if (phone === "") {
    let fn = document.getElementById("Phone");
    fn.textContent = "Please insert Phone number";
  }
  if (password === "") {
    let fn = document.getElementById("Password");
    fn.textContent = "Insert password";
  }
  if (confirmPassword === "") {
    let fn = document.getElementById("Conform-password");
    fn.textContent = "Insert confirm password";
  }
}

function personalInformation() {
  let fn = document.getElementById("message");
  fn.textContent = "";
  let firstName = document.querySelector(".f-name-inp").value;
  let lastName = document.getElementById("form3Example1n").value;
  let email = document.querySelector(".email-inp").value;
  let phone = document.getElementById("form3Example9").value;
  
  if (firstName.trim() === "") {
    let fn = document.getElementById("message");
    fn.textContent = "Insert First Name";
    return false;
  }
  if (firstName.length < 4) {
    let fn = document.getElementById("message");
    fn.textContent = "Should be more than four characters";
    return false;
  }
  if (firstName.length > 10) {
    let fn = document.getElementById("message");
    fn.textContent = "Should be less than 10 characters";
    return false;
  }
  if (lastName.trim() === "") {
    let fn = document.getElementById("message");
    fn.textContent = "Please Insert Last Name";

    return false;
  }
  if (lastName.length > 10) {
    let fn = document.getElementById("message");
    fn.textContent = "Should be less than 10 characters";
    return false;
  }
  if (email.trim() === "") {
    let fn = document.getElementById("message");
    fn.textContent = "Please Insert Email";
    return false;
  } else {
    let pattern = /^[^\s@]+@gmail\.com$/;

    if (!email.match(pattern)) {
      let fn = document.getElementById("message");
      fn.textContent = "Please insert a valid email";
      return false;
    }
  }
  if (phone.trim() === "") {
    let fn = document.getElementById("message");
    fn.textContent = "Please Insert Phone";

    return false;
  } else {
    let phonePattern = /^[0-9 ()+-]+$/;
    if (!phone.match(phonePattern)) {
      let fn = document.getElementById("message");
      fn.textContent = "Please insert valid Phone number";
      return false;
    }
  }

  return true;
}
function checkAddAddress() {
  const Name = document.getElementsByName("Name");
  const Mobile = document.getElementsByName("Mobile");
  const PIN = document.getElementsByName("pin");
  const Town = document.getElementById("town").value;
  const email = document.getElementById("email").value;
  const altNumber = document.getElementById("altNumber").value;
  const Locality = document.getElementById("locality").value;
  const landMark = document.getElementById("land-mark").value;
  if (Name[0].value.trim() === "") {
    showToast("Please insert Name");
    return false;
  }
  if (Name[0].value.length < 4) {
    showToast("Name should be atleast four characters");
    return false;
  } else if (Name[0].value.length > 10) {
    showToast("Name should be below Ten characters");
    return false;
  }
  if (Mobile[0].value.trim() === "") {
    showToast("Please insert Mobile Number");
    return false;
  }
  if (Mobile[0].value) {
    let phonePattern = /^[0-9 ()+-]+$/;
    const phone = Mobile[0].value;
    if (!phone.match(phonePattern)) {
      showToast("Please Enter a valid Mobile");
      return false;
    }
    whiteSpacePattern = /\s/;
    if (phone.match(whiteSpacePattern)) {
      showToast("white space not  allowed in phone");
      return false;
    }
  }
  if (Mobile[0].value.length < 8) {
    showToast("Mobile number Should be atleas eight");

    return false;
  }
  if (Mobile[0].value.length > 13) {
    showToast("Mobile number Should not be more than fifteen");
    return false;
  }
  if (PIN[0].value.trim() === "") {
    showToast("Please insert PIN Number");
    return false;
  }
  if (PIN[0].value.length < 6) {
    showToast("PIN must be 6 charaters");
    return false;
  } else if (PIN[0].value.length > 6) {
    showToast("PIN must not be more than 6 character");
    return false;
  } else if (PIN[0].value) {
    let pattern = /^[0-9]+$/;
    if (!PIN[0].value.match(pattern)) {
      showToast("Please enter a valid PIN");
      return false;
    }
  }
  if (Town.trim() === "") {
    showToast("Please insert Town ");
    return false;
  }
  if (Town.length < 3) {
    showToast("Town characters should be more than three");
    return false;
  }
  if (Town.length > 15) {
    showToast("Town characters should not be more than fifteen");
    return false;
  }
  if (Town) {
    const pattern = /^[a-zA-Z\s]*$/;
    if (!Town.match(pattern)) {
      showToast("Town name can only contain alphabetic characters");
      return false;
    }
  }
  if (email) {
    let pattern = /^[^\s@]+@gmail\.com$/;

    if (!email.match(pattern)) {
      showToast("Please Insert A valid Email");
      return false;
    }
  }
  if (altNumber.trim() === "") {
    showToast("Please insert alt.Number");
    return false;
  }
  if (altNumber) {
    let phonePattern = /^[0-9 ()+-]+$/;
    const phone = altNumber;
    if (!phone.match(phonePattern)) {
      showToast("Please Enter a valid Alternative Mobile");
      return false;
    }

    whiteSpacePattern = /\s/;
    if (phone.match(whiteSpacePattern)) {
      showToast("white space not Alt.Phone allowed");
      return false;
    }
  }
  if (altNumber.length < 8) {
    showToast("Alternative Number Should be atleas eight");

    return false;
  }
  if (altNumber.length > 15) {
    showToast("Alternative Number Should not be more than 15");
    return false;
  }
  if (Locality.length < 3) {
    showToast("Locality characters should be more than three");
    return false;
  }
  if (Locality.trim() === "") {
    showToast("Please insert locality");
    return false;
  }
  if (Locality.length > 15) {
    showToast("Locality characters should not be more than fifteen");
    return false;
  }
  if (Locality) {
    const pattern = /^[a-zA-Z\s]*$/;
    if (!Locality.match(pattern)) {
      showToast("Locality can only contain alphabetic characters");
      return false;
    }
  }
  if (landMark.trim() === "") {
    showToast("Please insert Land Mark");
    return false;
  }
  if (landMark.length < 3) {
    showToast("Land Mark characters should be more than three");
    return false;
  }
  if (landMark.length > 15) {
    showToast("Land Mark characters should not be more than fifteen");
    return false;
  }
  if (landMark) {
    const pattern = /^[a-zA-Z\s]*$/;
    if (!landMark.match(pattern)) {
      showToast("Land Mark can only contain alphabetic characters");
      return false;
    }
  }

  return true;
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

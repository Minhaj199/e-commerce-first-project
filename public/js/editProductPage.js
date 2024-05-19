let count_1 = 0;
let count_2 = 0;
let count_3 = 0;
let count_4 = 0;
let count_5 = 0;

document.getElementById("field-1").addEventListener("change", function (event) {
  if (count_1 === 0) {
    oldImage = document.getElementById("field-1-img").src;
    const file = event.target.files[0];
    if (file) {
      count_1++;
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("field-1-img").src = e.target.result;
      };
      reader.readAsDataURL(file);
      const img = document.createElement("img");
      img.src = "/images/Icons/delete_14025328.png";
      img.classList.add("close-icons");
      const container = document.getElementById("close-container");
      container.appendChild(img);
    }
  } else {
    const click_me = document.getElementById("click-me");
    click_me.innerHTML = "Close image";
    click_me.classList.add("click-me-added");
  }
});
document.getElementById("close-container").addEventListener("click", () => {
  document.getElementById("field-1").value = "";
  document.getElementById("field-1-img").src = oldImage;
  document.getElementById("close-container").innerHTML = "";
  count_1 = 0;
  const click_me = document.getElementById("click-me");
  click_me.innerHTML = "Click here";
  click_me.classList.remove("click-me-added");
});

document.getElementById("field-2").addEventListener("change", function (event) {
  if (count_2 === 0) {
    oldImage = document.getElementById("field-2-img").src;
    const file = event.target.files[0];
    if (file) {
      count_2++;
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("field-2-img").src = e.target.result;
      };
      reader.readAsDataURL(file);
      const img = document.createElement("img");
      img.src = "/images/Icons/delete_14025328.png";
      img.classList.add("close-icons");
      const container = document.getElementById("close-container-2");
      container.appendChild(img);
    }
  } else {
    const click_me = document.getElementById("click-me-2");
    click_me.innerHTML = "Close image";
    click_me.classList.add("click-me-added");
  }
});
document.getElementById("close-container-2").addEventListener("click", () => {
  document.getElementById("field-2").value = "";
  document.getElementById("field-2-img").src = oldImage;
  document.getElementById("close-container-2").innerHTML = "";
  count_2 = 0;
  const click_me = document.getElementById("click-me-2");
  click_me.innerHTML = "Click here";
  click_me.classList.remove("click-me-added");
});

document.getElementById("field-3").addEventListener("change", function (event) {
  const file = event.target.files[0];
  oldImage = document.getElementById("field-1-img").src;
  if (count_3 === 0) {
    if (file) {
      count_3++;
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("field-3-img").src = e.target.result;
      };
      reader.readAsDataURL(file);
      const img = document.createElement("img");
      img.src = "/images/Icons/delete_14025328.png";
      img.classList.add("close-icons");
      const container = document.getElementById("close-container-3");
      container.appendChild(img);
    }
  } else {
    const click_me = document.getElementById("click-me-3");
    click_me.innerHTML = "Close image";
    click_me.classList.add("click-me-added");
  }
});
document.getElementById("close-container-3").addEventListener("click", () => {
  document.getElementById("field-3").value = "";
  document.getElementById("field-3-img").src = oldImage;
  document.getElementById("close-container-3").innerHTML = "";
  count_3 = 0;
  const click_me = document.getElementById("click-me-3");
  click_me.innerHTML = "Click here";
  click_me.classList.remove("click-me-added");
});

document.getElementById("field-4").addEventListener("change", function (event) {
  const file = event.target.files[0];
  oldImage = document.getElementById("field-1-img").src;
  if (count_4 === 0) {
    if (file) {
      count_4++;
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("field-4-img").src = e.target.result;
      };
      reader.readAsDataURL(file);
      const img = document.createElement("img");
      img.src = "/images/Icons/delete_14025328.png";
      img.classList.add("close-icons");
      const container = document.getElementById("close-container-4");
      container.appendChild(img);
    }
  } else {
    const click_me = document.getElementById("click-me-4");
    click_me.innerHTML = "Close image";
    click_me.classList.add("click-me-added");
  }
});
document.getElementById("close-container-4").addEventListener("click", () => {
  document.getElementById("field-4").value = "";
  document.getElementById("field-4-img").src = oldImage;
  document.getElementById("close-container-4").innerHTML = "";
  count_4 = 0;
  const click_me = document.getElementById("click-me-4");
  click_me.innerHTML = "Click here";
  click_me.classList.remove("click-me-added");
});

document.getElementById("field-5").addEventListener("change", function (event) {
  const file = event.target.files[0];
  oldImage = document.getElementById("field-1-img").src;
  if (count_5 === 0) {
    if (file) {
      count_5++;
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("field-5-img").src = e.target.result;
      };
      reader.readAsDataURL(file);
      const img = document.createElement("img");
      img.src = "/images/Icons/delete_14025328.png";
      img.classList.add("close-icons");
      const container = document.getElementById("close-container-5");
      container.appendChild(img);
    }
  } else {
    const click_me = document.getElementById("click-me-5");
    click_me.innerHTML = "Close image";
    click_me.classList.add("click-me-added");
  }
});
document.getElementById("close-container-5").addEventListener("click", () => {
  document.getElementById("field-5").value = "";
  document.getElementById("field-5-img").src = oldImage;
  document.getElementById("close-container-5").innerHTML = "";
  count_5 = 0;
  const click_me = document.getElementById("click-me-5");
  click_me.innerHTML = "Click here";
  click_me.classList.remove("click-me-added");
});
document.querySelector(".dis-input").addEventListener("input", function () {
  const Text = this.value;

  if (Text.length > 70) {
    let sid = document.querySelector(".dis-input").value.slice(0, 70);
    console.log(sid);
    document.querySelector(".dis-input").value = sid;
    showToast("Word limit reached");
  }
});

function validate() {
  const name = document.getElementById("name").value;

  if (name.trim() === "") {
    alert("Blank space in Name is not allowed");

    return false;
  }

  return true;
}

function showToast(message) {
  console.log("inside tost");
  Toastify({
    text: message,
    duration: 4000,
    close: true,
    gravity: "top",
    position: "center",
  }).showToast();
}

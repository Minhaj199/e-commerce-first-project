

function Size(size, id) {
  sessionStorage.setItem("size", size.target.value);
  sessionStorage.setItem("id", id);

  checkOperations();
}


function colorFunction(color, id) {

  document.querySelector('.cart-btn').innerHTML = 'ADD TO CART'
  document.querySelector('.cart-btn').classList.remove('not-selected-color')
  sessionStorage.setItem("id", id);
  sessionStorage.setItem("color", color.target.value);
  checkOperations();
}
function checkOperations() {
  if (sessionStorage.getItem("size") && sessionStorage.getItem("color")) {
    const id = sessionStorage.getItem("id");
    const colors = sessionStorage.getItem("color");
    const sizes = sessionStorage.getItem("size");
    sessionStorage.removeItem("id");




    axios.get(`/user/getQuantity?color=${colors}&size=${sizes}&id=${id}`)
      .then(response => {
        sessionStorage.setItem('count', response.data.stock)
        const size_color = document.getElementById('size-color')
        const stock = document.getElementById('stock')
        if (response.data.stock === 0) {
          stock.innerHTML = `${sizes}-${colors} Out Of Stock`
          stock.classList.add('warning')
          document.querySelector('.cart-btn').hidden = true


        } else {
          stock.classList.remove('warning')
          document.querySelector('.cart-btn').hidden = false
          size_color.innerHTML = `${sizes}-${colors}`
          stock.innerHTML = ` 
              ${response.data.stock} stock Available`
        }



      })
      .catch(error => {

        console.error('Error occurred while communicating with the server:', error);
      });
  }
}

async function submitToCart(id) {
  const count = parseInt(document.getElementById("quatity").value);
  const size = sessionStorage.getItem("size");
  const color = sessionStorage.getItem("color");
  const price = parseInt(document.querySelector('.product__details__price').textContent.replace('₹', ''))
  const name = document.getElementById('name-field').dataset.name

  if (count <= 0) {
    showToast('Quantity zero not allowed')
  } else if (count % 1 !== 0) {
    showToast('Decimal value not allowed')
  }
  else {
    if (size && color) {
      const total = count * price;

      const stock = document.getElementById("stock");
      const currentStock = parseInt(sessionStorage.getItem("count"));
      if (currentStock - count < 0) {
        stock.innerHTML = `Only ${currentStock} stock left `;
        stock.classList.add("warning");
      } else {
        sessionStorage.removeItem("size");
        sessionStorage.removeItem("color");
        stock.classList.remove("warning");
        try {
          const response = await fetch("/user/cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id,
              count,
              size,
              price,
              color,
              from: "add to cart",
              name,
              total,
            }),
          });
          
          if (!response.ok) {
            const error =await response.json()
            
            throw new Error(error.message || 'internal server error')
          }else{
            sessionStorage.removeItem("size");
            sessionStorage.removeItem("color");
            sessionStorage.removeItem("count");
            location.href = "/user/getpages?from=afterAddedToCart";
          }
        } catch (error) {
         
          showToast(error.message || 'internal server error')
        }

      }
    } else {
      document.querySelector(".cart-btn").innerHTML = "Select Something";
      document.querySelector(".cart-btn").classList.add("not-selected-color");
    }
  }




}

////////////////wishList////////////////
const modalin = document.getElementById('myModal')
const button = document.querySelector('.close')
document.querySelector('.wishlist').addEventListener('click', () => {
  modalin.style.display = 'block'
})
button.onclick = () => {
  modalin.style.display = 'none'
}



document.querySelector('.mod-btn').addEventListener('click', async () => {
  const sizeOption = document.querySelector('.size-drop')
  const colorOption = document.querySelector('.color-drop')
  const name = document.getElementById('name-field').dataset.name
  const color = colorOption.value
  const size = sizeOption.value
  const price = document.querySelector('.product__details__price').textContent.replace('₹', '')

  const id = document.querySelector(".mod-btn").getAttribute('data-id')

  modalin.style.display = 'none'
  try {
    const response = await fetch('/user/createWishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, color, size, price, name })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'internal server errror')
    }
    const res = await response.json().catch((error) => {
      if (error) {
        location.href = '/user/log-in'
      }
    })
    if (res) {
      showToast('Added to wish List')
    }
  } catch (error) {
    showToast(error.message || 'Wishlist not updated')
  }

})

function isDecimal(count) {
  return count % 1 !== 0
}
function showToast(message) {

  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: 'center',

  }).showToast()
}




function Size(size,id) {
  localStorage.setItem("size", size);
  const checkmark = document.querySelectorAll(".checkmark");
  localStorage.setItem("id", id);

  checkOperations();
}

function color(color, id) {
    document.querySelector('.cart-btn').innerHTML='ADD TO CART'
    document.querySelector('.cart-btn').classList.remove('not-selected-color')
  localStorage.setItem("id", id);
  localStorage.setItem("color", color);
  checkOperations();
}
function checkOperations() {
  if (localStorage.getItem("size") && localStorage.getItem("color")) {
    const id = localStorage.getItem("id");
    const colors = localStorage.getItem("color");
    const sizes = localStorage.getItem("size");
    localStorage.removeItem("id");

   

   
     axios.get(`/user/getQuantity?color=${colors}&size=${sizes}&id=${id}`)
        .then(response => {
            
          
          
          localStorage.setItem('count',response.data)
          const size_color=document.getElementById('size-color')
          const stock=document.getElementById('stock')
          if(response.data==0){
          stock.innerHTML=`${sizes}-${colors} Out Of Stock` 
           stock.classList.add('warning') 
           document.querySelector('.cart-btn').hidden=true
           

          }else{
            stock.classList.remove('warning')
            document.querySelector('.cart-btn').hidden=false
            size_color.innerHTML=`${sizes}-${colors}`
             stock.innerHTML=` 
              ${response.data} stock Available`
          }
         

        
        })
        .catch(error => {
          
          console.error('Error occurred while communicating with the server:', error);
        });
  }
}

function result(id) {
  const count = parseInt(document.getElementById("quatity").value);
  const size = localStorage.getItem("size");
  const color = localStorage.getItem("color");
  const price= parseInt (document.querySelector('.product__details__price').textContent.replace('₹',''))
  
  if(count<=0){
    showToast('Quantity zero not allowed')
  }else if(count%1 !==0){
    showToast('Decimal value not allowed')
  }
  else{
     if (size && color) {
       const total = count * price;

       const stock = document.getElementById("stock");
       const currentStock = parseInt(localStorage.getItem("count"));
       if (currentStock - count < 0) {
         stock.innerHTML = `Only ${currentStock} stock left `;
         stock.classList.add("warning");
       } else {
         localStorage.removeItem("size");
         localStorage.removeItem("color");
         stock.classList.remove("warning");
         fetch("/user/cart", {
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
             total,
           }),
         })
           .then((response) => {
             if (response.ok) {
              
               localStorage.removeItem("size");
               localStorage.removeItem("color");
               location.href = "/user/getpages?from=afterAddedToCart";
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
       }
     } else {
       document.querySelector(".cart-btn").innerHTML = "Select Something";
       document.querySelector(".cart-btn").classList.add("not-selected-color");
     }
  }
 
  

  
}

////////////////wishList////////////////
const modalin=document.getElementById('myModal')
const button=document.querySelector('.close')
document.querySelector('.wishlist').addEventListener('click',()=>{
  modalin.style.display='block'
})
button.onclick=()=>{
  modalin.style.display='none'
}



document.querySelector('.mod-btn').addEventListener('click',async()=>{
  const sizeOption=document.querySelector('.size-drop')
  const colorOption=document.querySelector('.color-drop')
  const color=colorOption.value
  const size=sizeOption.value
  const price=document.querySelector('.product__details__price').textContent.replace('₹','')
  
  const id=document.querySelector(".mod-btn").getAttribute('data-id')
 
  modalin.style.display='none'
  const response=await fetch('/user/createWishlist',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id,color,size,price})
  })
  const res=await response.json().catch((error)=>{
    if(error){
     
      location.href='/user/log-in'
    }
  })
  if(res){
   
    showToast('Added to wish List')
  }
})

function isDecimal(count){
  return count %1!==0
}
function showToast(message){
 
    Toastify({
      text:message,
      duration:3000,
      close:true,
      gravity:"top",
      position:'center',

    }).showToast()
}

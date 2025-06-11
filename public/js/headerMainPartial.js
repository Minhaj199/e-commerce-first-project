document.addEventListener('DOMContentLoaded',async()=>{
    try {
        const isUserLogged=await fetch('/user/user-logged')
        if(!isUserLogged.ok){
            const err=await isUserLogged.json()
            console.log(err)
            throw  new Error(err.message||'internal server error')
        }
        const isAuthenticated=await isUserLogged.json()
        const logout=document.getElementById('logout')
        const login=document.getElementById('login')
        if(isAuthenticated){
            login.hidden=true
            logout.hidden=false
        }else{
            login.hidden=false
            logout.hidden=true
        }
    } catch (error) {
        showToast(error.message||'internal server error')
    }
})
function showToast(message) {
    Toastify({
      text: message,
      duration: 4000,
      close: true,
      gravity: "top",
      position: "center",
    }).showToast();
  }

  document.getElementById('search-switch-main').hidden=true


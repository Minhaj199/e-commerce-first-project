async function fun(name,event) {
    try {
    event.preventDefault();
    const propt = await showAlertPropt(
      `Are you sure you want to delete the ${name} ?`
    );
    if (propt) {
      event.target.submit();
    }     
    } catch (error) {
      console.log('internal server error')  
    }
    
    
}
async function status(stat, email,event) {
    try {
    event.preventDefault()   
     if (stat == "true") {
        const propt=await showAlertPropt(`Are you want to Block ${email} ?`)
        
       if (propt) {
         event.target.submit()
       } 
     } else {
        const propt = await showAlertPropt(
          `Are you want to Unblock ${email}  ?`
        );
       if (propt) {
         event.target.submit()
       } 
     }   
    } catch (error) {
        
    }
 
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

async function deleteUser(id,name,index) {
  try {
    const propt = await showAlertPropt(
      `Are you sure you want to delete the ${name} ?`
    );
    if (propt) {
      const responseDraft=await fetch("/admin/getDelete/"+id,{method:'delete',
        headers: {
        "Content-Type": "application/json",
      }
      })
      const response=await responseDraft.json()
      if(response==='success'){

        document.getElementById('btn-tr-'+index).hidden=true
        showToast(name +' user deleted')
        setTimeout(()=>{
          location.reload()

        },1000)
      }
    }
  } catch (error) {
    console.log('internal server error')
  }


}
async function status(stat, email, event) {
  try {
    event.preventDefault()
    if (stat == "true") {
      const propt = await showAlertPropt(`Are you want to Block ${email} ?`)

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


function access(userID,index){

  const btn= document.getElementById('block-btn-'+index)
  if(btn){
    btn.addEventListener('click',block(userID,index))
  }else{
    document.getElementById('unblock-btn-'+index).addEventListener('click',unBlock(userID,index))
  }

}
async function block(userId,index) {

  // func that  unblock request send to server
  try {
    const blockBtn = document.getElementById('block-btn-'+index)
      const responseDraft=await fetch('/admin/blockandunblock/' + userId, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: 'block' }),
      credentials: 'include'
    })
   
    const response =await responseDraft.json()
    if (response === 'success') {
    
      blockBtn.id= 'unblock-btn-'+index
      blockBtn.classList.remove('btn-danger')
      blockBtn.classList.add ("btn-success")
      blockBtn.textContent = "Unblock";
    }

  } catch (error) {
    console.log(error)
  }

}
async function unBlock(userId,index) {
  // func that block request send to server
  try {
     const unblockBtn = document.getElementById('unblock-btn-'+index)
  const responseDraft=await fetch('/admin/blockandunblock/' + userId, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: 'unblock' }),
      credentials: 'include'
    })
    const response=await responseDraft.json()

    if (response === 'success') {
      unblockBtn.setAttribute('id', 'block-btn-'+index)
      unblockBtn.classList.remove('btn-success')
      unblockBtn.classList.add( "btn-danger")
      unblockBtn.style.width = "90px";
      unblockBtn.textContent = "Block";
      
    }

  } catch (error) {
    
  }
 


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


const  isUserBlocked=async(req,res,next)=>{
    
    if(req.session.user==='User Blocked'){
         
        res.redirect('/user')
        
    }else{
        next()
    }
}

module.exports=isUserBlocked

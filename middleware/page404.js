
const error404=(req,res,next)=>{
     const error=new Error('oops..invalid route')
    error.statusCode=404
    next(error)
}

module.exports=error404
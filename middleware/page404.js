
const error404=(req,res,next)=>{
    res.render("error", { message: 'page not found' });
}

module.exports=error404
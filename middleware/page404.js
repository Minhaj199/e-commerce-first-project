
const error404=(req,res)=>{
    res.status(404).render("error", { message: 'Page not found' });
}

module.exports=error404

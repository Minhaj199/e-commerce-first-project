
const error404=(req,res)=>{
    res.render("error", { message: 'page not found' });
}

module.exports=error404
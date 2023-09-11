module.exports.isLogedIn= (req,res,next)=>{
    if(!req.isAuthenticated()){
        res.redirect('/login')
    }
    else{
        next();
    }
}

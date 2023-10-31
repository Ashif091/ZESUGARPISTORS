module.exports = {
 
    authenticateUser : (req,res,next)=>{
        if(req.session.username){
            next();
        }
        else{
            res.render('login.ejs',{errmsg:""})
        }
    } ,
    signupAuthenticateUser : (req,res,next)=>{
        if(req.session.username){
            next();
        }
        else{
           return res.render("signup.ejs",{ errmsg: "" })
        }
    } 
    ,
    adminAuthenticate:(req,res,next)=>{
        if(req.session.admin){
            next();
        }
        else{
            res.render('admin.ejs',{errmsg:""})
        }
    }


}


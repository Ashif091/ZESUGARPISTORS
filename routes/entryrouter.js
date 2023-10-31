const express = require("express");
const { authenticateUser,signupAuthenticateUser,adminAuthenticate} = require("../middleware/athouction")
const router = express.Router();
const {login,
    check,
    home,
    logout,
    signup,
    registerpage,
    forgotpassword,
    otpsender,
    confirmotp,
    confimpassword,
    checkpassword}=require("../controllers/entryController")


router.route('/login').get(authenticateUser,login).post(check)
router.route("/").get(authenticateUser,home)
router.route("/logout").get(logout)
router.route("/signup").get(signupAuthenticateUser,registerpage).post(signup)
router.route("/forgotpassword").get(forgotpassword).post(otpsender)
router.route("/confirmotp").get(confirmotp)
router.route("/checkpassword").post(checkpassword)


  
module.exports=router;
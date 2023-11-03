const express = require("express");
const {adminAuthenticate} = require("../middleware/athouction")
const router = express.Router();
const multer = require('multer');


// multer

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });
  

const {logout,
    adlogin,
    usercls,
    updateuser,
    createuser,
    search,
    admincheck,
    usermanagementall,
    userstatus,
    blockedusers,
    usermanagementblock,
    createProduct,
    createProductDisplay,
    productmangement,
    check,
}=require("../controllers/adminController")
router.route("/logout").get(logout)
router.route("/").get( adminAuthenticate,adlogin).post(admincheck)



// ___________________User Management_______________________-    

router.route('/usermanagement').get(adminAuthenticate,usermanagementall);
router.route("/usermanagement/search").get(search)
router.route("/usermanagementblock/:userId").get(usermanagementblock).post(blockedusers)
router.route("/usermanagementcreate").post(createuser)
router.route("/usermanagement/:userId").post(userstatus).put(updateuser).delete(usercls)

//_____________________product Management__________________

router.route('/productmangement').get(productmangement).post(upload.array('image', 4),createProduct )

// ______________check__________________
router.route("/check").get(check)


 
module.exports=router;
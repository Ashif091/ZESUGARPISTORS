const users = require("../models/userModel")
const product = require("../models/productSchema")
const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")

module.exports = {
   
 
    admincheck:asyncHandler(async (req, res) => {

        const { email, password } = req.body
        if (!email || !password) {
            res.status(400).render("admin.ejs", { errmsg: "email and password are needed" })
        }
        const admindata = {email:"admin@gmail.com" , password:"$2b$10$SssWwngf/45KrjTokeXvMOEKQ7WtI1xld218JX22eIVz7CUE09Xnm"}
        if (email===admindata.email) {
            const verify = await bcrypt.compare(password, admindata.password)
            if (!verify) {
                res.status(404).render("admin.ejs", { errmsg: "password is wrong." })
            }
        }
        else {
            return res.status(404).render("admin.ejs", { errmsg: "this admin-Email does not exist" })
        }
        console.log(`${admindata.name} entered`);
        req.session.admin = admindata
        return res.redirect("/admin")



    }),
    adlogin: asyncHandler(async (req, res) => {
        const block =0;
        const userslist = await users.find({user:1})
        res.render("admin-user-all.ejs", { userslist,block }) 
       

    }),
    usermanagementall:asyncHandler(async (req, res) => {
        const block =0;
        const userslist = await users.find({user:1})
        res.render("admin-user-all.ejs", { userslist,block }) 
       

    }), 
        usermanagementblock:asyncHandler(async (req, res) => {
        const block =0;
        const userslist = await users.find({user:0})
        res.render("admin-user-block.ejs", { userslist,block }) 
       

    }),
    blockedusers: asyncHandler(async (req, res) => {
        console.log("USERSTATUSblock");
        const userId = req.params.userId;
        console.log(userId);
    
        try {
            // Find the user by ID
            const existingUser = await users.findById(userId);
    
            if (!existingUser) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Update the user's status
           
                existingUser.user = 1;
           

            
            const updatedUser = await existingUser.save();
    
            console.log(updatedUser);
    
            res.json(updatedUser);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })

    ,
    // =======================productmangement=======================
    productmangement:(async (req, res) => {
        console.log("productmangement requst got as the get");
        try {

          const productlist = await product.find()
        console.log(productlist);
     
          res.render("productmangement.ejs",{productlist})  
        } catch (error) {
            res.send("error with data ") 
        }
       
      

    }),
   

    createProduct : async (req, res) => {
     console.log("enter prodecut creation ");
     const {
       productname,
       description,
       productprice,
       quantity,
       category,
     } = req.body;
      console.log("/createproduct ", req.body);
     try {
       if (!req.files || req.files.length === 0) {
         return res.status(400).send('No files uploaded.');
       }
   
       const imagePaths = req.files.map(file => {
         let imagePath = file.path;
   
         if (imagePath.includes('public\\')) {
           imagePath = imagePath.replace('public\\', '');
         } else if (imagePath.includes('public/')) {
           imagePath = imagePath.replace('public/', '');
         }
         return imagePath;
       });
   
     
 
       const productdata = await product.create({
         product_name: productname,
         product_description: description,
         product_price: productprice,
         product_category: category,
         product_qty: quantity,
         product_image_url:imagePaths,
         
     })
        if(productdata){
         console.log("data will be saved in db",productdata);
        }
       res.redirect('/admin/productmangement');
     } catch (error) {
       console.error('Error creating user:', error);
       res.status(500).send('Internal Server Error');
     }
   }
   ,
    // =========================================================
    usercls: asyncHandler(async (req, res) => {
        const user = await users.findById(req.params.userId)
        if (!user) {
            res.status(404)
            throw new Error("contact not fout ")
        }
        const datacls = await users.findByIdAndRemove(req.params.userId)
        if (datacls) {
            res.status(200).send('user deleted')
        } else {
            res.status(404)
        }
    })
    ,
    userstatus: asyncHandler(async (req, res) => {
        console.log("USERSTATUS");
        const userId = req.params.userId;
        console.log(userId);
    
        try {
            // Find the user by ID
            const existingUser = await users.findById(userId);
    
            if (!existingUser) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Update the user's status
           
                existingUser.user = 0;
           

            
            const updatedUser = await existingUser.save();
    
            console.log(updatedUser);
    
            res.json(updatedUser);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
    
    , 
   
    updateuser: asyncHandler(async (req, res) => {

        const userId = req.params.userId;
        console.log(req.body);
        const updatedData = req.body;
        console.log(userId);
        const updatedUser = await users.findByIdAndUpdate(
            userId,
            updatedData,
            { new: true });

        if (updatedUser) {
            return res.json(updatedUser);
        } else {
            console.log("error")
            res.status(404)
        }

    })
    ,
    createuser: asyncHandler(async (req, res) => {
        console.log("CREATION START");

        const { name, email, password } = req.body;

        const userAvailability = await users.findOne({ email });
        if (userAvailability) {

            res.status(208).redirect("/admin")
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await users.create({
            name,
            email,
            password: hashedPassword,
            user:1
            
        })
        if (newUser) {
            console.log("new user created")
        }
        res.status(208).redirect("/admin")

    }),
    search: asyncHandler(async (req, res) => {
        const block =0;
        console.log("inner search");
        const searchTerm = req.query.key; 
        console.log(searchTerm);

        if (!searchTerm) {
            return res.redirect('admin')
        }
        const userslist = await users.find({ name: { $regex: searchTerm, $options: 'i' },user:1 }, { _id: 1, name: 1, email: 1 });
        console.log(`yes${userslist}`);
        res.render("admin-user-all.ejs", { userslist,block }) 
        
        

    })

    ,
    logout: ((req, res) => {
        req.session.destroy();
        res.redirect('/');

    })
   //    next 


,
  createProductDisplay:asyncHandler(async (req, res) => {

    const userId = req.params.userId;
    console.log(req.body);
    const updatedData = req.body;
    console.log(userId);
    const updatedUser = await users.findByIdAndUpdate(
        userId,
        updatedData,
        { new: true });

    if (updatedUser) {
        return res.json(updatedUser);
    } else {
        console.log("error")
        res.status(404)
    }

})

,

check:(req, res) => {
    let data = {
        "data": "Your name is kannada",
        "color":"rgb(98, 77, 77)"
      };
    res.json(data);
  }

    
}




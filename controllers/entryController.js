const users = require("../models/userModel")
const OTP = require("../models/otpModel")
const asyncHandler = require("express-async-handler")
const nodemailer = require('nodemailer')
const bcrypt = require("bcrypt")

module.exports = {
    login: ((req, res) => {
        res.status(208).redirect('/');
    }),
    home: ((req, res) => {
        res.status(201).render("home.ejs", { name: req.session.username.name })
    })
    ,
    registerpage: ((req, res) => {
        res.status(208).redirect("/")
    })
    ,
    signup: asyncHandler(async (req, res) => {
        console.log("hello this is singup");
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).render("signup.ejs", { errmsg: "please fill all data" })
        }
        const userAvailability = await users.findOne({ email });
        if (userAvailability) {
            res.status(400).render("signup.ejs", { errmsg: "user already exist" })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await users.create({
            name,
            email,
            password: hashedPassword,
            user: 1,
        })
        if (newUser) {
            console.log("new user created")
        }
        req.session.username = newUser;
        res.status(208).redirect("/signup")



    })
    ,
    check: asyncHandler(async (req, res) => {

        const { email, password } = req.body
        if (!email || !password) {
            res.status(400).render("login.ejs", { errmsg: "emal and password are needed" })
        }
        const userCheck = await users.findOne({ email, user: 1 })
        if (userCheck) {
            const verify = await bcrypt.compare(password, userCheck.password)
            if (!verify) {
                res.status(404).render("login.ejs", { errmsg: "password is wrong" })
            }
        }
        else {
            return res.status(404).render("login.ejs", { errmsg: "this user-Email does not exist " })
        }
        console.log(`${userCheck.name} entered`);
        req.session.username = userCheck
        return res.redirect("/")



    }),
    forgotpassword: (async (req, res) => {
        let email = req.query.email;

        res.render("otppage.ejs", { email, errmsg: "", msg: "" })

    })
    ,
    otpsender: (async (req, res) => {
        console.log("processing");
        let email = req.body.email;


        const userCheck = await users.findOne({ email })
        if (!userCheck) {
            return res.status(400).render("otppage.ejs", { email, errmsg: "the email is wrong", msg: "" })
        }


        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fhyvhh091@gmail.com',
                pass: 'epwa vxkm rscl dnki'
            }
        });

        //   =================send=======================
        let otp = Math.random();
        otp = otp * 1000000;
        otp = parseInt(otp);

        let mailOptions = {
            from: 'fhyvhh091@gmail.com',
            to: email,
            subject: 'OTP for password reset',
            text: `Your OTP is: ${otp}`
        };
        console.log("connection otp ");

        try {
            const newOTP = new OTP({
                email,
                otp,
                createdAt: Date.now(),
            });

            await newOTP.save()

            console.log("saving... ", otp);


        } catch (err) {
            const otptime = await OTP.findOne({ email })
            const time = parseInt(60 - ((Date.now() - otptime.createdAt) / 1000))
            if (time >= 0) {
                res.render("otpsendpage.ejs", { email, errmsg: "you have already a OTP", msg: ``, time })

            }

        }

        //  await userCheck.createIndex({ createdAt: 1 }, { expireAfterSeconds: 10 });

        console.log("otp saved in db")
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                let time = 60;
                res.render("otpsendpage.ejs", { email, errmsg: "", msg: `OTP succsesfully sented to ${email}`, time })
            }
        });

    })
    ,
    confirmotp: (async (req, res) => {
        console.log("got requst");
        let { email, otp } = req.query

        try {
            const otp_db = await OTP.findOne({ email })

            if (!otp_db) {
                res.render("otpsendpage.ejs", { email, errmsg: "now your otp is invalid send again", msg: ``, time })
            }
            console.log("data from data base", otp_db)

            otp = parseInt(otp)
            console.log(otp, typeof (otp))
            // if(!otp_db.otp && otp_db.otp==""){
            //     res.redirect("/forgotpassword")

            // }

            if ((otp == otp_db.otp)) {
                console.log("password is  match");
                res.status(200).render("password.ejs", { errmsg: "", email })



            } else {
                console.log("password is not match")
                const otptime = await OTP.findOne({ email })
                const time = parseInt(60 - ((Date.now() - otptime.createdAt) / 1000))
                if (time >= 0) {
                    res.render("otpsendpage.ejs", { email, errmsg: "OTP is Wrong", msg: ``, time })

                }

            }
        } catch (err) {
            res.send("somthing hapende in etrycontoller/confirmotp")

        }




    })

    ,
    confimpassword: ((req, res) => {
        res.status(200).render("password.ejs", { errmsg: "", email: "" })

    }),
    checkpassword: (async (req, res) => {
        console.log("password checking ");

        let { password, cpassword, email } = req.body;

          
            try {
                password = await bcrypt.hash(password, 10);
                const userCheck = await users.findOne({ email })
                userCheck.password = password
                await userCheck.save()
                console.log(userCheck.name,"password changed");


            } catch (err) {
                console.log("err in  data base ")
                res.status(200).render("password.ejs", { errmsg: "error with data", email })
                

            }

            res.status(208).redirect("/login")


        

        



    })
    ,


    logout: ((req, res) => {
        req.session.destroy();
        res.redirect('/');

    })


}


const user = require("../../model/user");
const bcrypt = require("bcrypt");
const forgotEmail = require('../../model/otp/forgoEmail')
const capitalisation = require("../../utils/makeCapitalLetter");
const otpGenerator = require("otp-generator");
const otpSchema = require("../../model/otp/otp");
const OTP = require("../../model/otp/otp");
const walletModel = require('../../model/wallets')

let data = {};
let email;
let globalEmail;
let otp = null;
module.exports = {
    renderLoginPage: (req, res) => {
        let message;
        if (req.session.successOfReset) {
            message = req.session.successOfReset
            delete req.session.successOfReset
        }

        res.render("./user/login", { message });
    },
    handleLoginSubmission: async (req, res, next) => {
        /////password validation and session assigning////
        try {
            const userData = await user.findOne({ Email: req.body.email });
            globalEmail = userData;
            if (userData) {
                if (userData.status) {
                    const dashashed = await bcrypt.compare(
                        req.body.password,
                        userData.password
                    );
                    if (dashashed) {
                        req.session.user = `Happy Shopping ${userData.first_name} ${userData.second_name}`;
                        req.session.customerId = userData._id;
                        req.session.isUserAuthenticated = true;
                        res.redirect("/user");
                    } else {
                        res.render("user/login", { error: "password is not match" });
                    }
                } else {
                    req.session.user = "User Blocked";
                    res.redirect("/user");
                }
            } else {
                res.render("user/login", { error: "user not found" });
            }
        } catch (err) {
            next(err)
        }
    },
    renderForgot: (req, res) => {
        ///// get from forgot page////


        delete req.session.user,
            delete req.session.customerId,
            delete req.session.isUserAuthenticated;
        res.render("user/forgot/forgotEmail")
    },
    resetPassword: async (req, res, next) => {

        try {
            const emailObj = await forgotEmail.findOne({ email: req.session.emailID });
            const email = emailObj.email

            const newPassword = req.body.password;

            const saltRounds = 10;
            const hashedpassword = await bcrypt.hash(newPassword, saltRounds);

            await user.updateOne(
                { Email: email },
                { $set: { password: hashedpassword } }
            );
            req.session.successOfReset = 'Password resetted successfully'
            res.redirect("/user/log-in");
        } catch (error) {
            console.log(error.message)
            await forgotEmail.deleteMany({ _id: req.session.emailID })
            delete req.session.emailID

            console.log("error in the password updation");
            next(error)
        }
    },
    renderSignUpPage: (req, res) => {
        //// get sign up page////
        res.render("./user/registration");
    },
    handleSignupPost: async (req, res, next) => {
        ////////////// handle submitt data and ridirect to naviagation page////////
        try {
            data = {
                first_name: capitalisation(req.body.First_name),
                second_name: capitalisation(req.body.Last_name),
                Email: req.body.Email,
                phone_Number: req.body.phone,
                password: req.body.password,
            };
            email = req.body.Email;
            const check = await user.findOne({ Email: req.body.Email });

            if (check) {
                res.render("user/registration", { error: "Email already exists" });
            } else {
                otp = otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    specialChars: false,
                });
                console.log(email, otp);
                const userData = { email, otp };

                await otpSchema.create(userData);
                res.render("user/otpEnterForReg");
            }
        } catch (error) {
            next(error)
        }
    },
    validateEmail: async (req, res, next) => {
        /////validate email and redirect to OTP page////
        try {
            const email = await user.findOne({ Email: req.body.email });
            globalEmail = email;
            if (!email) {
                res.render("user/forgot/forgotEmail", { error: "user not found" });
            } else {
                res.redirect("/log-in/OTP")
            }
        } catch (err) {
            const error = new Error("internal server error");
            error.statusCode = 500;
            next(error);
        }
    },
    handleOtpSharing: async (req, res, next) => {
        //// handle otp sharing throught email////
        try {
            const email = req.body.email;
            globalEmail = email;
            const ifUser = await forgotEmail.findOne({ email: email })
            let EmailOfUser;
            if (ifUser) {
                EmailOfUser = ifUser.email
                req.session.emailID = ifUser.email
            } else {
                EmailOfUser = await forgotEmail.create({ email }
                )
                req.session.emailID = EmailOfUser.email;
            }
            const isUser = await user.findOne({ Email: email });
            if (isUser) {
                const otp = otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    specialChars: false,
                });
                const userData = { email, otp };
                await OTP.create(userData);
                res.render("user/forgot/otpEnter");
            } else {
                res.render("user/forgot/forgotEmail", { error: "Email not found" });
            }
        } catch (error1) {
            const error = new Error(error1);
            error.statusCode = 500;
            next(error);
        }
    },
    handleResendOtp: async (req, res, next) => {

        ////////////handle resend otp///////////
        if (req.query.from === "register") {
            try {
                const otp = otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    specialChars: false,
                });

                const userData = { email, otp };
                await otpSchema.create(userData);
                res.render("user/otpEnterForReg");
            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                const otp = otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    specialChars: false,
                });
                const email = req.session.emailID
                const userData = { email, otp };
                await otpSchema.create(userData);
                res.render("user/forgot/otpEnter");
            } catch (error) {
                next(error)
            }
        }
    },
    validateOTP: async (req, res, next) => {
        ////////////validate otp and redirect to password reset page///////////
        if (req.query.from === "Register") {
            try {
                const last_otp = await OTP.aggregate([
                    { $sort: { _id: -1 } },
                    { $limit: 1 },
                ]);
                if (last_otp[0]?.otp) {
                    if (last_otp[0].otp === req.body.userOTP) {
                        const hashedpassword = await bcrypt.hash(data.password, 10);
                        data.password = hashedpassword;
                        const userData = await user.insertMany([data]);

                        const walletData = {
                            UserID: userData[0]._id,
                            Amount: 0,
                        };
                        await walletModel.create(walletData);

                        res.render("user/login", { error: "Account created successfull" });
                    } else {
                        res.render("user/otpEnterForReg", { error: "Invalid OTP" });
                    }
                } else {
                    res.render("user/otpEnterForReg", { error: "Invalid Expired" });
                }

            } catch (error) {
                next(error)
            }
        } else {
            try {

                const last_otp = await OTP.findOne({ otp: req.body.userOTP, email: req.session.emailID })
                    .sort({ _id: -1 })
                    .limit(1);
                console.log(last_otp)
                if (last_otp) {
                    res.render("user/forgot/resetPassword");
                } else {
                    res.render("user/forgot/otpEnter", { message: "invalid otp or OTP Expired" });
                }
            } catch (error) {
                next(error)
            }
        }
    },
    getSignUp: (req, res) => {
        res.render("./user/registration");
    },
    postSignup: async (req, res, next) => {
        try {
            data = {
                first_name: capitalisation(req.body.First_name),
                second_name: capitalisation(req.body.Last_name),
                Email: req.body.Email,
                phone_Number: req.body.phone,
                password: req.body.password,

            };
            email = req.body.Email;
            const check = await user.findOne({ Email: req.body.Email });

            if (check) {
                res.render("user/registration", { error: "Email already exists" });
            } else {
                otp = otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    specialChars: false,
                });
                console.log(email, otp);
                const userData = { email, otp };

                await otpSchema.create(userData);
                res.render("user/otpEnterForReg");
            }
        } catch (error) {
            next(error)
        }
    },
    isUserLogged: async (req, res) => {
        try {
            const isUserAuthenticated = (req?.session?.isUserAuthenticated) ? true : false
            res.json(isUserAuthenticated)
        } catch (error) {
            res.status(400).json({ message: error.message || 'internal server error' })
        }
    }
}
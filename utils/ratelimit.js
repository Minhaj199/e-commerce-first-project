const rateLimit = require("express-rate-limit");
const window=parseInt(process.env.windowMs)
const max=parseInt(process.env.max)
const otpLimiter = rateLimit({
    windowMs:window ,
    max: 1,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many OTP requests. Please try again later.",
    handler: (req, res) => {
        res.status(429).render("user/registration", {
            error: "Too many OTP requests. Please try again later.",
        });
    },
});
module.exports=otpLimiter


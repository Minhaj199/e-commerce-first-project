const express=require('express')
const router=express.Router()


const userControl=require('../controller/userRelated.js/mainUserController')
const userAuthenticated=require('../middleware/userAuthenticated')
const isUserAuthenticated=require('../middleware/isUserAuthenticated')
const isUserBlocked=require('../middleware/userBlocked')
const auth=require('../controller/userRelated.js/authController')
const orderController=require('../controller/userRelated.js/orderController')
const addressController = require('../controller/userRelated.js/addressController')


//landing

router.get('/',userControl.getLanding)
router.all('/getpages',isUserAuthenticated,userControl.renderPages)
router.get('/fetchData',orderController.checkoutUtilityRouter)



////cart///

router.post('/cart',isUserBlocked,isUserAuthenticated,userControl.cart)
router.get('/getQuantity',userControl.getQuantity)
router.patch('/patchCart',isUserAuthenticated,userControl.patchCart)
router.delete('/dltFromCart',isUserAuthenticated,userControl.dltFromCart)

//login
router.get('/log-in',userAuthenticated,auth.renderLoginPage)
router.post('/log-in',auth.handleLoginSubmission)

//sign up
router.get('/registration',userAuthenticated,auth.renderSignUpPage)
router.post('/registration',auth.handleSignupPost)
router.post('/log-in/forgotOtpEnter',userAuthenticated,auth.validateEmail)
//forgot
router.get('/log-in/forgot',isUserBlocked,auth.renderForgot)
router.post('/log-in/forgotOtpEnter',isUserBlocked,userAuthenticated,auth.validateEmail)
router.post('/log-in/validateOTP',isUserBlocked,userAuthenticated,auth.validateOTP)
router.post('/log-in/OTP',isUserBlocked,auth.handleOtpSharing)
router.post('/log-in/otpResend',isUserBlocked,auth.handleResendOtp)
router.put('/log-in/passwordReseted',isUserBlocked,auth.resetPassword)


//catagory

router.get('/all',isUserBlocked,userControl.getAll)
router.get('/women',isUserBlocked,userControl.getWomen)
router.get('/men',isUserBlocked,userControl.getMan)
router.get('/cat',isUserBlocked,userControl.cat)

//product Data
router.get('/productData/:id',isUserBlocked,userControl.getProductDatails)

////////////////////////user Profile////////////////////////////////////

///profile info///
router.get('/getUserProfile',isUserAuthenticated,userControl.getUserProfile)
router.put('/updateUserProfile',isUserAuthenticated,userControl.updateUserProfile)

///Manage Address///

router.get('/getManageAddress',isUserAuthenticated,addressController.renderAdressMgt)
router.post('/postAddress',isUserAuthenticated,addressController.submitAddress)
router.patch('/patchAddress',isUserAuthenticated,addressController.resetingDefualtAddress)
router.put('/putAddress',isUserAuthenticated,addressController.editAddress)
router.delete('/deleteAddress',isUserAuthenticated,addressController.deleteAddress)


///check Out//////

router.patch('/removeProduct',isUserAuthenticated,orderController.removeProduct)
router.post('/orderPlacement',isUserAuthenticated,orderController.placeOrder)
router.post('/orderFailed',isUserAuthenticated,orderController.handleFailed)
router.patch('/retryOrderPlacement',isUserAuthenticated,orderController.handleRetryOrder)



///Delete from OrderPlaced/////

router.patch('/CanecelFromPlacedOrder',isUserAuthenticated,orderController.cancelOreder)

////payment gatway/////

router.post('/payment',isUserAuthenticated,orderController.paymentGateway)
router.post('/retryPayment',isUserAuthenticated,orderController.retryPayment)
router.get('/payment',isUserAuthenticated,orderController.getUserInfo)
router.patch('/payment',isUserAuthenticated,userControl.addIDs)
// router.post('/webhook',isUserAuthenticated,userControl.paymentNotification)

////////returnProduct//////



/////wishLIst//////

router.post('/createWishlist',isUserAuthenticated,userControl.addToWishlist)
router.delete('/removeFromWishList',isUserAuthenticated,userControl.removeFromWishList)
router.post('/wishToCart',isUserAuthenticated,userControl.addToCart)


router.get('/logOut',(userControl.logOut))

module.exports=router




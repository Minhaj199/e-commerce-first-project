const express=require('express')
const router=express.Router()


const userControl=require('../controller/user')
const userAuthenticated=require('../middleware/userAuthenticated')
const isUserAuthenticated=require('../middleware/isUserAuthenticated')
const isUserBlocked=require('../middleware/userBlocked')
const auth=require('../controller/userRelated.js/auth')



//landing

router.get('/',userControl.getLanding)
router.all('/getpages',isUserAuthenticated,userControl.renderPages)
router.get('/fetchData',userControl.fetchData)



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
router.use('/sighOut',isUserBlocked,userControl.sighOut)

////////////////////////user Profile////////////////////////////////////

///profile info///
router.get('/getUserProfile',isUserAuthenticated,userControl.getUserProfile)
router.put('/updateUserProfile',isUserAuthenticated,userControl.updateUserProfile)

///Manage Address///

router.get('/getManageAddress',isUserAuthenticated,userControl.getManageAddress)
router.post('/postAddress',isUserAuthenticated,userControl.postAddress)
router.patch('/patchAddress',isUserAuthenticated,userControl.patchAddress)
router.put('/putAddress',isUserAuthenticated,userControl.putAddress)
router.delete('/deleteAddress',isUserAuthenticated,userControl.deleteAddress)


///check Out//////

router.patch('/removeProduct',isUserAuthenticated,userControl.removeProduct)
router.post('/orderPlacement',isUserAuthenticated,userControl.placeOrder)
router.post('/orderFailed',isUserAuthenticated,userControl.orderFailed)
router.patch('/retryOrderPlacement',isUserAuthenticated,userControl.retryOrderPlacement)



///Delete from OrderPlaced/////

router.patch('/CanecelFromPlacedOrder',isUserAuthenticated,userControl.cancelOreder)

////payment gatway/////

router.post('/payment',isUserAuthenticated,userControl.paymentGateway)
router.post('/retryPayment',isUserAuthenticated,userControl.retryPaymentGateway)
router.get('/payment',isUserAuthenticated,userControl.getUserData)
router.patch('/payment',isUserAuthenticated,userControl.addIDs)
router.post('/webhook',isUserAuthenticated,userControl.paymentNotification)

////////returnProduct//////



/////wishLIst//////

router.post('/createWishlist',isUserAuthenticated,userControl.createWishlist)
router.delete('/removeFromWishList',isUserAuthenticated,userControl.removeFromWishList)
router.post('/wishToCart',isUserAuthenticated,userControl.addToCart)


router.get('/logOut',(userControl.logOut))

module.exports=router




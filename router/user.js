const express=require('express')
const router=express.Router()


const userControl=require('../controller/userRelated/mainUserController')
const userAuthenticated=require('../middleware/userAuthenticated')
const isUserAuthenticated=require('../middleware/isUserAuthenticated')
const isUserBlocked=require('../middleware/userBlocked')
const auth=require('../controller/userRelated/authController')
const orderController=require('../controller/userRelated/orderController')
const addressController = require('../controller/userRelated/addressController')
const searchAndSortController=require('../controller/userRelated/serachAndSortingController')
const cartController=require('../controller/userRelated/cartController')
const renderController=require('../controller/userRelated/renderingController')

//landing

router.get('/',userControl.getLanding)
router.all('/getpages',isUserAuthenticated,renderController.renderPages)
router.get('/fetchData',orderController.checkoutUtilityRouter)



////cart///

router.post('/cart',isUserBlocked,isUserAuthenticated,cartController.cart)
router.get('/getQuantity',cartController.getQuantity)
router.patch('/patchCart',isUserAuthenticated,cartController.patchCart)
router.delete('/dltFromCart',isUserAuthenticated,cartController.dltFromCart)


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

/////////// cetegory and serarching/////////////
router.get('/all',isUserBlocked,searchAndSortController.getAll)


////catagory//////
router.get('/women',isUserBlocked,searchAndSortController.getWomen)
router.get('/men',isUserBlocked,searchAndSortController.getMan)
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


////////returnProduct//////



/////wishLIst//////

router.post('/createWishlist',isUserAuthenticated,userControl.addToWishlist)
router.delete('/removeFromWishList',isUserAuthenticated,userControl.removeFromWishList)
router.post('/wishToCart',isUserAuthenticated,userControl.addToCart)

//////////////fetch coupen data for coupon listing////////////////
router.get('/coupon-data',userControl.getCouponData)

///////////get listing page of coupen/////////////
router.get('/coupon-listing',isUserAuthenticated,userControl.getCouponList)
/////////////checkin is userlogged for main user navbar to show login and logout

router.get ('/user-logged',auth.isUserLogged)


router.get('/logOut',(userControl.logOut))

module.exports=router




const express = require('express')
const router = express.Router()
const adminCon = require('../controller/adminRelated/otherController')
const upload = require('../middleware/multer')


const isAdminAuthenticated = require('../middleware/isAdminAuthenticated')
const AdminAuthenticated = require('../middleware/adminAuthenticated')
const productMgtController = require('../controller/adminRelated/addController')
const renderingController = require('../controller/adminRelated/renderingController')
const editController = require('../controller/adminRelated/editController')
const deleteController = require('../controller/adminRelated/deleteController')
const addController = require('../controller/adminRelated/addController')












///////getPages//////


router.get('/getPages', AdminAuthenticated, renderingController.getPages)

router.get('/fetchData', adminCon.fetchData)

router.get('/salesFiltering', AdminAuthenticated, renderingController.salesFiltering)

router.get("/datashBord", AdminAuthenticated, renderingController.dashBord);




router.get('/add-product-form', AdminAuthenticated, renderingController.addProduct)
router.get('/product-management', AdminAuthenticated, renderingController.productsMgt)
router.post('/product-management', AdminAuthenticated, renderingController.setProductMgtSorted)
router.post('/add-Product', AdminAuthenticated, upload.array('image'), addController.postProduct)
router.post('/editProduct/:id', AdminAuthenticated, renderingController.editProduct)
router.post('/deleteProduct/:id', AdminAuthenticated, renderingController.deleteProduct)
router.delete('/DeleteProduct/:id', AdminAuthenticated, deleteController.handleDeleteProduct)
router.put('/editProduct/:id', AdminAuthenticated, upload.array('image'), editController.updateProduct)

// 
/////////category management////////////
router.post('/addCat', AdminAuthenticated, addController.category)
router.get('/manageCategory', AdminAuthenticated, renderingController.categoryManagement)
router.get('/addCatt', AdminAuthenticated, renderingController.addcategory)
router.put('/category-edit/:id', AdminAuthenticated, editController.category)
router.get('/addCattbefore/:id', AdminAuthenticated, renderingController.editCategory)
router.get('/addDeletebefore/:id', AdminAuthenticated, renderingController.deleteCategory)
router.delete('/category-delete/:id', AdminAuthenticated, deleteController.category)



router.get('/', isAdminAuthenticated, renderingController.login)
router.post('/', adminCon.adminAuthentication)
router.get('/log-out', adminCon.sign_out)


//////////user management ///////////////////

router.get('/userManagemnent', AdminAuthenticated, renderingController.userManagement)
router.put('/getUnBlock/:id', AdminAuthenticated, editController.handleBlockAndUnblock)
router.delete('/getDelete/:id', AdminAuthenticated, deleteController.user)

//////////Brand management/////////

router.get('/getBrandPages', AdminAuthenticated, renderingController.brandPage)
router.post('/AddBrand', AdminAuthenticated, addController.brand)
router.put('/editBrand/:id', AdminAuthenticated, editController.brand)
router.delete('/deleteBrand/:id', AdminAuthenticated, deleteController.brand)


////////Change ManageOrder Status/////////

router.patch('/ChangeStatus', AdminAuthenticated, editController.orderStatus)

//////return product////
router.patch('/returnProduct', AdminAuthenticated, editController.returnProduct)


///// coupen adding///
router.post('/addCoupen', AdminAuthenticated, addController.coupen)
router.patch('/editCoupen', AdminAuthenticated, editController.coupen)
router.delete('/deleteCoupen', AdminAuthenticated, deleteController.coupen)

/////offer management/////
router.post('/createOffer', AdminAuthenticated, addController.offer)
router.delete('/deleteOffer', AdminAuthenticated, deleteController.offer)
router.patch('/deleteOfferField', AdminAuthenticated, editController.deleteField)
router.put('/editOffer', AdminAuthenticated, editController.offer)

////invoice//////

router.get('/getInvoice', renderingController.invoice)

module.exports = router
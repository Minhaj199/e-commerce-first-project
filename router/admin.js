const express=require('express')
const router=express.Router()
const productModel = require('../Model/product')
const adminCon=require('../controller/adminCon')
const upload=require('../middleware/multer')
const isAdminAuthenticated=require('../middleware/isAdminAuthenticated')
const AdminAuthenticated=require('../middleware/adminAuthenticated')
const path=require('path')


 






///////getPages//////


router.get('/getPages',AdminAuthenticated,adminCon.getPages)

router.get('/fetchData',adminCon.fetchData)

router.get('/salesFiltering',AdminAuthenticated,adminCon.salesFiltering)

router.get("/datashBord", AdminAuthenticated,adminCon.getDashBord);




router.get('/add-product-form',AdminAuthenticated,adminCon.getAddProduct)
router.get('/product-management',AdminAuthenticated,adminCon.getProductManagement)
router.post('/product-management',AdminAuthenticated,adminCon.getProductManagementSorted)
router.post('/add-Product',AdminAuthenticated,upload.array('image'),adminCon.productAdding)
router.post('/editProduct/:id',AdminAuthenticated,adminCon.getEditPage)
router.post('/deleteProduct/:id',AdminAuthenticated,adminCon.getDeletePage)
router.delete('/DeleteProduct/:id',AdminAuthenticated,adminCon.deleteProduct)
router.put('/editProduct/:id',AdminAuthenticated,upload.array('image'),adminCon.putEditPage)


/////////category management////////////
router.post('/addCat',AdminAuthenticated,adminCon.addCategory)
router.get('/manageCategory',AdminAuthenticated,adminCon.getCategoryManagement)
router.get('/addCatt',AdminAuthenticated,adminCon.getAddCategory)
router.put('/category-edit/:id',AdminAuthenticated,adminCon.editCategory)
router.get('/addCattbefore/:id',AdminAuthenticated,adminCon.editCategorybefore)
router.get('/addDeletebefore/:id',AdminAuthenticated,adminCon.deleteCategorybefore)
router.delete('/category-delete/:id',AdminAuthenticated,adminCon.deleteCategory)



router.get('/',isAdminAuthenticated, adminCon.getLogin)
router.post('/',adminCon.adminAuthentication)
router.get('/log-out',adminCon.sign_out)


//////////user management ///////////////////

router.get('/userManagemnent',AdminAuthenticated,adminCon.getUserManagement)
router.put('/getUnBlock/:id',AdminAuthenticated,adminCon.getUnblocled)
router.delete('/getDelete/:id',AdminAuthenticated,adminCon.getDelete)

//////////Brand management/////////

router.get('/getBrandPages',AdminAuthenticated,adminCon.getBrandPage)
router.post('/AddBrand',AdminAuthenticated,adminCon.addBrand)
router.put('/editBrand/:id',AdminAuthenticated,adminCon.editBrand)
router.delete('/deleteBrand/:id',AdminAuthenticated,adminCon.deleteBrand)


////////Change ManageOrder Status/////////

router.patch('/ChangeStatus',AdminAuthenticated,adminCon.ChangeStatus)

//////return product////
router.patch('/returnProduct',AdminAuthenticated,adminCon.returnProduct)


///// coupen adding///
router.post('/addCoupen',AdminAuthenticated,adminCon.addCoupen)
router.patch('/editCoupen',AdminAuthenticated,adminCon.editCoupen)
router.delete('/deleteCoupen',AdminAuthenticated,adminCon.deleteCoupen)

/////offer management/////
router.post('/createOffer',AdminAuthenticated,adminCon.createOffer)
router.delete('/deleteOffer',AdminAuthenticated,adminCon.deleteOffer)
router.patch('/deleteOfferField',AdminAuthenticated,adminCon.deleteField)
router.put('/editOffer',AdminAuthenticated,adminCon.editOffer)

////invoice//////

router.get('/getInvoice',adminCon.getInvoice)

module.exports=router
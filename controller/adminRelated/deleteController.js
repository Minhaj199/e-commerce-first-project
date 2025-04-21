
const category = require('../../model/catagory')
const coupenModel = require('../../model/coupen')
const offerModel = require('../../model/offer')
const userModel = require('../../model/user')
const walletModel = require('../../model/wallets')
const cartModel = require('../../model/cart')
const wishlistModel = require('../../model/wishList')
const productItemModel = require('../../model/prouctItems')
const { Types } = require('mongoose')

module.exports = {
    handleDeleteProduct: async (req, res) => {
        try {
            const del = req.params.id;
            await productItemModel.findByIdAndUpdate( del,{deleteStatus:true} );
            await cartModel.deleteMany({ProductId:new Types.ObjectId(del)})
            await wishlistModel.deleteMany({ProductID:new Types.ObjectId(del)})
            res.redirect(
                `/admin/product-management?dltMessage=Product Deleted Successfully`
            );
        } catch (error) {
            res.redirect(
                `/admin/product-management?dltErrMessage=Product Deleted Unsuccessfully`
            );
        }
    },
    productVariant:async(req,res)=>{
        try {
            const {id}=req.params
            if(!id||typeof id!=='string'){
                res.status(400).json({message:'id not found'})
                return
            }
            
            let product=await productItemModel.findOne({'variants._id':id,deleteStatus:false})
            
           if(!product){
            return res.status(400).json({message:'product not found'})
           }
           if(product?.variants.length===1){
            return res.status(400).json({message:'Not updated ! keep atlease one variant'})
           }
      
           const afterRemovedArray=product?.variants.filter(v=>{
         
            let docId=v._id.toString()
            return docId!==id
           })
            product.variants=afterRemovedArray
          const response=  await product.save()
            if(response){
                res.json(true)
            }else{
                res.status(400).json({message:'internal server error'})
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({message:'internal server error'})   
        }
    },
    user: async (req, res, next) => {
        try {

            await userModel.deleteOne({ _id: req.params.id });
            await walletModel.deleteOne({ UserID: req.params.id });
            await cartModel.deleteMany({ UserId: req.params.id });
            await wishlistModel({ UserID: req.params.id })
            req.session.isUserAuthenticated = false;
            req.session.user = false;
            res.redirect("/admin/userManagemnent?dltMessage=User Deleted Successfully");
        } catch (error) {
            next(error)
        }
    },
    category: async (req, res, next) => {
        try {
            const fixedCategory=['Men','Women','Kids']
            const {id:elementId} = req.params;
            const isFixedCategory=fixedCategory.find(elem=>{
                return elem.toLocaleLowerCase()===elementId.toLocaleLowerCase()
            })
            if(isFixedCategory){
                res.redirect(
                    "/admin/managecategory?dltMessage= This is a fixed category"
                );
                return
            }
             await category.updateOne(
                {},
                { $pull: { category: elementId } }
            );
            res.redirect(
                "/admin/managecategory?dltMessage=category Deleted Successfully"
            );
        } catch (error) {
            next(error)
        }
    },
    brand: async (req, res, next) => {
        try {

            const {cate:elementId} = req.body
           if(!elementId){
            res.redirect(
                "/admin/getBrandPages?To=brand&brandAddedMessage=not found"
            );
            return
           }
            if(elementId.toLocaleLowerCase()==='others'){
                res.redirect(
                    "/admin/getBrandPages?To=brand&brandAddedMessage=This category can't be deleted"
                );
                return
            }
            await category.updateOne(
                { brand: { $exists: true } },
                { $pull: { brand: elementId } }
            );
            res.redirect(
                "/admin/getBrandPages?To=brand&dltMessage=Deleted Successfully"
            );
        } catch (error) {
            next(error)
        }
    },
    coupen: async (req, res, next) => {
        try {
            await coupenModel.deleteOne({ _id: req.body.id });
            res.json("deleted");

        } catch (error) {
            next(error)
        }
    },
    offer: async (req, res, next) => {
        try {
            await offerModel.deleteOne({ _id: req.body.id });
            res.json("Offer Deleted");
        } catch (error) {
            next(error)
        }
    },
}

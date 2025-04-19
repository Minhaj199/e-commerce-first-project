
const category = require('../../Model/catagory')
const coupenModel = require('../../Model/coupen')
const offerModel = require('../../Model/offer')
const userModel = require('../../Model/user')
const walletModel = require('../../Model/wallets')
const cartModel = require('../../Model/cart')
const wishlistModel = require('../../Model/wishList')
const productItemModel = require('../../Model/prouctItems')
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
           let product=await productItemModel.findOne({'variants._id':id,deleteStatus:true},)
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
            const documentId = "65e085036e57f3e5630201fd";
            const elementId = req.params.id;

            await category.findOneAndUpdate(
                { _id: documentId },
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
            const elementId = req.body.cate;

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

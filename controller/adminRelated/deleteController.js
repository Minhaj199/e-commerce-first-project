
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
            await productItemModel.findByIdAndUpdate(del, { deleteStatus: true });
            await cartModel.deleteMany({ ProductId: new Types.ObjectId(del) })
            await wishlistModel.deleteMany({ ProductID: new Types.ObjectId(del) })
            req.flash('dltMessage', 'Product Deleted Successfully')
            res.redirect(
                `/admin/product-management`
            );
        } catch (error) {
            req.flash('dltErrMessage', 'Product Deleted Unsuccessfully')
            res.redirect(
                `/admin/product-management`
            );
        }
    },
    productVariant: async (req, res) => {
        try {
            const { id } = req.params
            if (!id || typeof id !== 'string') {
                res.status(400).json({ message: 'id not found' })
                return
            }

            let product = await productItemModel.findOne({ 'variants._id': id, deleteStatus: false })

            if (!product) {
                return res.status(400).json({ message: 'product not found' })
            }
            if (product?.variants.length === 1) {
                return res.status(400).json({ message: 'Not updated ! keep atlease one variant' })
            }

            const afterRemovedArray = product?.variants.filter(v => {

                let docId = v._id.toString()
                return docId !== id
            })
            product.variants = afterRemovedArray
            const response = await product.save()
            if (response) {
                res.json(true)
            } else {
                res.status(400).json({ message: 'internal server error' })
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: 'internal server error' })
        }
    },
    deleteUser: async (req, res, next) => {
        try {
            await userModel.deleteOne({ _id: req.params.id });
            await walletModel.deleteOne({ UserID: req.params.id });
            await cartModel.deleteMany({ UserId: req.params.id });
            await wishlistModel({ UserID: req.params.id })
            req.session.isUserAuthenticated = false;
            req.session.user = false;
            res.json('success')
        } catch (error) {
            next(error)
        }
    },
    category: async (req, res, next) => {
        try {
            const fixedCategory = ['Men', 'Women', 'Kids']
            const { id: elementId } = req.params;
            const isFixedCategory = fixedCategory.find(elem => {
                return elem.toLocaleLowerCase() === elementId.toLocaleLowerCase()
            })
            if (isFixedCategory) {
                req.flash('dltMessage', 'This is a fixed category')
                res.redirect(
                    "/admin/managecategory"
                );
                return
            }
            await category.updateOne(
                {},
                { $pull: { category: elementId } }
            );
            req.flash('dltMessage', 'category Deleted Successfully')
            res.redirect(
                "/admin/managecategory"
            );
        } catch (error) {
            next(error)
        }
    },
    brand: async (req, res, next) => {
        try {

            const { cate: elementId } = req.body
            if (!elementId) {
                req.flash('brandAddedMessage', 'not found')
                res.redirect(
                    "/admin/getBrandPages?To=brand"
                );
                return
            }
            if (elementId.toLocaleLowerCase() === 'others') {
                req.flash('brandAddedMessage', 'This category cannot be deleted')
                res.redirect(
                    "/admin/getBrandPages?To=brand"
                );
                return
            }
            await category.updateOne(
                { brand: { $exists: true } },
                { $pull: { brand: elementId } }
            );
            req.flash('dltMessage', 'Deleted Successfully')
            res.redirect(
                "/admin/getBrandPages?To=brand"
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

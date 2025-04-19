
const productModel = require('../../Model/product')
const cloudinary = require('../../utils/cludinary')
const fs = require("fs");
const category = require("../../Model/catagory");
const coupenModel = require("../../Model/coupen");
const offerModel = require("../../Model/offer");
const userModel = require("../../Model/user");
const walletModel = require("../../Model/wallets");
const orderModel = require("../../Model/orders");
const productItemModel = require('../../Model/prouctItems');
const { Types } = require('mongoose');


module.exports = {
    updateProduct: async (req, res, next) => {
        try {

            const uploader = async (path) => await cloudinary.uploads(path, "Images");

            let urls = [];
            const files = req.files;

            let newPhoto = []

            if (req.files?.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    newPhoto.push(parseInt(req.files[i].originalname));
                }
                for (const file of files) {
                    const { path } = file;


                    const newPath = await uploader(path);

                    urls.push(newPath);
                    fs.unlinkSync(path);
                }
            }

            const imagePaths = urls.map((item) => item.url);
            const finalImage = imagePaths.slice(0, 5);
            const oldData = await productItemModel.findById({ _id: req.params.id });
            let updatedPhotos = oldData.images.path


            if (finalImage.length > 0) {

                for (let i = 0; i < imagePaths.length; i++) {
                    updatedPhotos[newPhoto[i]] = finalImage[i]
                }

            }




            const productData = {
                Name: req.body.Name,
                brand: req.body.brand,
                category: req.body.category,
                price: req.body.price,
                description: req.body.description,
                images: {
                    path: finalImage.length > 0 ? updatedPhotos : oldData.images.path,
                },
            };


            await productItemModel
                .findOneAndUpdate({ _id: req.params.id }, { $set: productData })
                .then((result) => {
                    res.redirect(
                        `/admin/product-management?updMessage=Upadated Successfully`
                    );
                })
                .catch((error) => {
                    res.redirect(
                        `/admin/product-management?updtErrMessage=Updated Successfully`
                    );
                });
        } catch (error) {
            next(error)
        }
    },
    updateVariant: async (req, res) => {
        try {
            const { id } = req.params
            const {
                size,
                color,
                stock,
                varientId
            } = req.body
            if (!size || !color || !stock || !varientId) {
                throw new Error('insufficient data')
            }
            if (!id) {
                throw new Error('id not found')
            }

            const product = await productItemModel.findById(id)
            if (!product) res.json({ message: 'product not found' })
            const isDuplicate = product.variants.find(v => {
                let docId = v._id.toString()


                return docId !== varientId && v.size === size && v.color === color
            })
            if (isDuplicate) {
                throw new Error('This variant already exist')
            }

            const varientTobeEdited = product.variants.id(varientId)

            if (varientTobeEdited.size === size && varientTobeEdited.color === color && stock == varientTobeEdited.stock) {
                return res.status(400).json({ message: 'change not found' })
            }
            if (!varientTobeEdited) {
                res.status(400).json({ message: 'veriant not found' })
            }
            varientTobeEdited.size = size
            varientTobeEdited.color = color
            varientTobeEdited.stock = stock
            const result = await product.save()
            if (result) {
                res.json(true)
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: 'Duplicate variant exists (same size and color).' });
        }
    },
    handleBlockAndUnblock: async (req, res, next) => {
        //////////////user block and unclock management//////////
        try {
            const user = await userModel.findById({ _id: req.params.id });
            req.session.isUserAuthenticated = false;
            req.session.user = false;
            req.session.customerId = false;
            user.status = !user.status;
            await userModel.findOneAndUpdate({ _id: req.params.id }, { $set: user });
            if (user.status == true) {
                res.redirect("/admin/userManagemnent?unBlockMessage=User Unblocked");
            } else {
                res.redirect("/admin/userManagemnent?blockMessage=User Blocked");
            }
        } catch (error) {
            next(error)
        }

    },

    category: async (req, res, next) => {
        try {
            const documentId = "65e085036e57f3e5630201fd";
            const elementId = req.params.id;
            const newName = req.body.cate;

            await category.findOneAndUpdate(
                { _id: documentId },
                { $set: { [`category.${elementId}`]: newName } }
            );
            res.redirect(
                "/admin/managecategory?editMessage=category Updated Successfully"
            );
        } catch (error) {
            next(error)
        }

    },
    brand: async (req, res, next) => {
        try {
            const Data = req.body.brand;
            await category.findOneAndUpdate(
                { brand: { $exists: true } },
                { $addToSet: { brand: Data } },
                { upsert: true, new: true }
            );
            res.redirect(
                "/admin/getBrandPages?To=brand&brandAddedMessage=Brand Added Successfully"
            );
        } catch (error) {
            next(error)
        }
    },
    orderStatus: async (req, res, next) => {
        ///// change order status from order management page//////
        try {
            if (req.body.from === "changeStatus") {
                if (req.body.status === "Canceled") {
                    const canceledData = await orderModel.findById(req.body.ID);

                    const ID = canceledData.Order[req.body.index].ProductID;
                    let quantity = canceledData.Order[req.body.index].quantity;

                    const size = canceledData.Order[req.body.index].size;

                    const color = canceledData.Order[req.body.index].color;
                    await productItemModel.updateOne(
                        { _id: ID },
                        { $inc: { 'variants.$[elem].stock': quantity } },
                        { arrayFilters: [{ 'elem.size': size, 'elem.color': color }] }
                    );
                    const path = `Order.${req.body.index}.admin`;
                    let updateObject = {};
                    updateObject[path] = false;
                    await orderModel.findByIdAndUpdate(
                        { _id: req.body.ID },
                        { $set: updateObject }
                    );
                    let returnShipping
                    (async function () {
                        let amount = canceledData.Order[req.body.index].total;

                        if (canceledData.Discount > 0) {
                            let discount = canceledData.Discount / canceledData.Order.length;
                            if (discount <= amount) {
                                let sample = amount;
                                amount = sample - discount;
                            }
                        }
                        returnShipping = Math.floor(
                            60 / canceledData.Order.length
                        );

                        amount = Math.floor(returnShipping + amount)

                        const result = await walletModel.updateOne(

                            { UserID: req.session.customerId },
                            { $inc: { Amount: amount } }
                        );

                        const result2 = await walletModel.updateOne(
                            { UserID: req.session.customerId },
                            {
                                $push: {
                                    transaction: {
                                        id: canceledData._id,
                                        amount: amount,
                                        status: "Credited",
                                        date: new Date(),
                                    },
                                },
                            }
                        );

                    })();

                    let amount = canceledData.Order[req.body.index].total;
                    let DiscountedAmount = amount;
                    if (canceledData.Discount > 0) {
                        let discount = Math.ceil(canceledData.Discount / canceledData.Order.length);
                        if (discount <= DiscountedAmount) {
                            let sample = DiscountedAmount;
                            DiscountedAmount = sample - discount;
                        }
                    }
                    DiscountedAmount += returnShipping;
                    await orderModel.findByIdAndUpdate(
                        { _id: req.body.ID },
                        {
                            $inc: {
                                numberOfOrders: -1,
                                TotalOrderPrice: -DiscountedAmount,
                                SubTotal: -amount,
                                ShippingCharge: -returnShipping
                            },
                        }
                    );
                }
                const path = `Order.${req.body.index}.status`;
                let updateObject = {};
                updateObject[path] = req.body.status;

                await orderModel
                    .findByIdAndUpdate({ _id: req.body.ID }, { $set: updateObject })
                    .then(() => {
                        res.json("ok");
                    });
            }
        } catch (error) {
            console.log(error)
            next(error)
        }
    },
    returnProduct: async (req, res, next) => {

        if (req.body.status === "Return Reject") {
            try {
                const path = `Order.${req.body.index}.status`;
                let updateObject = {};
                updateObject[path] = req.body.status;

                await orderModel
                    .findByIdAndUpdate({ _id: req.body.ID }, { $set: updateObject })
                const paths = `Order.${req.body.index}.admin`;
                let updateObjects = {};
                updateObjects[paths] = false;
                const response = await orderModel.findByIdAndUpdate(
                    { _id: req.body.ID },
                    { $set: updateObjects }
                );
                if (response) {
                    res.json("ok");
                }
            } catch (error) {
                next(error)
            }
        } else {
            ///////////////return accepted////////////////
            try {
                const path = `Order.${req.body.index}.status`;
                let updateObject = {};
                updateObject[path] = req.body.status;

                await orderModel
                    .findByIdAndUpdate(req.body.ID, { $set: updateObject })
                const paths = `Order.${req.body.index}.admin`;
                let updateObjects = {};
                updateObjects[paths] = false;
                await orderModel.findByIdAndUpdate(
                    { _id: req.body.ID },
                    { $set: updateObjects }
                );

                const canceledData = await orderModel.findById(req.body.ID);
                const quantity = canceledData.Order[req.body.index].quantity;
                const ID = canceledData.Order[req.body.index].ProductID;
                const size = canceledData.Order[req.body.index].size;
                const color = canceledData.Order[req.body.index].color;
                const result = await productItemModel.updateOne(
                    { _id: new Types.ObjectId(ID) },
                    { $inc: { 'variants.$[elem].stock': quantity } },
                    { arrayFilters: [{ 'elem.size': size, 'elem.color': color }] }
                );
                (async function () {
                    let amount = canceledData.Order[req.body.index].total;
                    let DiscountedAmount = amount;
                    if (canceledData.Discount > 0) {
                        const discount = canceledData.Discount / canceledData.Order.length;
                        if (discount <= amount) {
                            let sample = amount;
                            DiscountedAmount = sample - discount;
                        }
                    }
                    await walletModel.updateOne(
                        { UserID: req.session.customerId },
                        { $inc: { Amount: DiscountedAmount } }
                    );
                    await orderModel.findByIdAndUpdate(canceledData._id, {
                        $inc: {
                            SubTotal: -amount,
                            TotalOrderPrice: -DiscountedAmount,
                            numberOfOrders: -1,
                        },
                    });
                    await walletModel.updateOne(
                        { UserID: req.session.customerId },
                        {
                            $push: {
                                transaction: {
                                    id: canceledData._id,
                                    amount: DiscountedAmount,
                                    status: "Credited",
                                    date: new Date(),
                                },
                            },
                        }
                    );
                })();
                res.json("ok");
            } catch (error) {
                next(error)
            }
        }
    },
    coupen: async (req, res, next) => {
        try {

            const editedData = {
                code: req.body.code,
                Expiry: req.body.compareData,
                amount: req.body.amount,
            };
            await coupenModel.updateOne(
                { _id: req.body.id },
                editedData
            );

            res.json("Coupen Updated");
        } catch (error) {
            next(error)
        }
    },
    deleteField: async (req, res, next) => {
        try {

            for (let i = 0; i < req.body.proID.length; i++) {
                await productModel.findByIdAndUpdate(req.body.proID[i], {
                    $unset: { offer_rate: "" },
                });
            }
            res.json("deletd");
        } catch (error) {
            next(error)
        }
    },
    offer: async (req, res, next) => {
        try {
            const data = await offerModel.findById(req.body.ID);
            if (data.status === true) {
                for (let i = 0; i < data.ProductIDs.length; i++) {
                    await productModel.findByIdAndUpdate(data.ProductIDs[i], {
                        $set: { offer_rate: 0 },
                    });
                }
                await offerModel.findByIdAndUpdate(req.body.ID, {
                    $set: { status: false },
                });
            } else {
                for (let i = 0; i < data.ProductIDs.length; i++) {
                    await productModel.findByIdAndUpdate(data.ProductIDs[i], {
                        $set: { offer_rate: data.rate },
                    });
                }
                await offerModel.findByIdAndUpdate(req.body.ID, {
                    $set: { status: true },
                });
            }
            res.json("success");
        } catch (error) {
            next(error)
        }
    },

}
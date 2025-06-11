const cloudinary = require('../../utils/cludinary')
const fs = require("fs");
const category = require("../../model/catagory");
const coupenModel = require("../../model/coupen");
const offerModel = require("../../model/offer");
const userModel = require("../../model/user");
const walletModel = require("../../model/wallets");
const orderModel = require("../../model/orders");
const productItemModel = require('../../model/prouctItems');
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
                .then(() => {
                    req.flash('updMessage', 'Upadated Successfully')
                    res.redirect(
                        `/admin/product-management`
                    );
                })
                .catch(() => {
                    req.flash('updtErrMessage', 'Updated unsuccessfull')
                    res.redirect(
                        `/admin/product-management`
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
                return res.status(400).json({ message: 'veriant not found' })
            }
            varientTobeEdited.size = size
            varientTobeEdited.color = color
            varientTobeEdited.stock = stock
            const result = await product.save()
            if (result) {
                return res.json(true)
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: 'Duplicate variant exists (same size and color).' });
        }
    },
    handleBlockAndUnblock: async (req, res) => {
        //////////////user block and unclock management//////////
        const { action } = req.body
        const { id } = req.params
        if (!action || !id) {
            throw new Error('data shortage')

        }

        try {
            if (action === 'block') {

                const response = await userModel.findOneAndUpdate({ _id: id }, { $set: { status: false } });
                if (response) {
                    res.json('success')
                } else {
                    throw new Error('error on blocking updation')
                }
            } else {
                ``
                const response = await userModel.findOneAndUpdate({ _id: req.params.id }, { $set: { status: true } });
                if (response) {
                    return res.json('success')
                } else {
                    throw new Error('error on blocking updation')
                }
            }
        } catch (error) {
            if (error.message === 'data shortage') {
                return res.status(400).json({ error: 'Not enough data' })

            } else {
                return res.status(500).json({ error: error.message || 'server error' })
            }
        }

    },

    category: async (req, res, next) => {
        try {


            const elementId = req.params.id;
            const newName = req.body.cate;

            const fixedCategory = [0, 1, 2]
            const isFixedCategory = fixedCategory.find(elem => elem === Number(elementId))

            if (isFixedCategory === 0 || isFixedCategory) {
                req.flash('dltMessage', 'This is a fixed category')
                res.redirect(
                    "/admin/managecategory"
                );
                return
            }
            const categoryData = await category.findOne()
            if (!categoryData) {
                return
            }
            const isDuplicate = categoryData.category.find(el => el.toLocaleLowerCase() === newName.toLocaleLowerCase())
            if (isDuplicate) {
                req.flash('dltMessage', 'Already exist')
                res.redirect(
                    "/admin/managecategory"
                );
                return
            }
            await category.updateOne(
                {},
                { $set: { [`category.${elementId}`]: newName } }
            );
            req.flash('editedMessage', 'category Updated Successfully')
            res.redirect(
                "/admin/managecategory"
            );
        } catch (error) {
            next(error)
        }

    },
    brand: async (req, res, next) => {
        const { cate, current } = req.body
        try {
            if (!current || !cate) {
                req.flash('dltMessage', 'insufficient data')
                res.redirect("/admin/getBrandPages?To=brand&")
                return
            }
            if (current.toLowerCase() === 'others') {
                req.flash('dltMessage', 'Others cannot be editted')
                res.redirect("/admin/getBrandPages?To=brand")
                return
            }



            const result = await category.findOne()

            const isExits = result.brand.find(elem => cate.toLowerCase() === elem.toLowerCase())
            if (isExits) {
                req.flash('dltMessage', 'current item already exist')
                res.redirect("/admin/getBrandPages?To=brand")
                return
            }
            const newArray = result.brand.map(el => {
                if (el.toLowerCase() === current.toLowerCase()) {
                    return cate
                } else {
                    return el
                }
            })
            result.brand = newArray
            await result.save()
            req.flash('brandAddedMessage', 'Brand Added Successfully')
            res.redirect(
                "/admin/getBrandPages?To=brand"
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
                    let returnShipping = 0
                    let DiscountedAmount = 0

                    let discount = 0;
                    (async function () {
                        let amount = canceledData.Order[req.body.index].total;
                        DiscountedAmount = amount

                        if (canceledData.Discount > 0) {
                            let persentage = ((amount / canceledData.SubTotal) * 100).toFixed()

                            discount = ((canceledData.Discount * persentage) / 100).toFixed()

                            DiscountedAmount = DiscountedAmount - discount;
                        }
                        returnShipping = Math.floor(
                            canceledData.ShippingCharge / canceledData.numberOfOrders
                        );

                        amount = Math.floor(returnShipping + DiscountedAmount)

                        await walletModel.updateOne(

                            { UserID: req.session.customerId },
                            { $inc: { Amount: amount } }
                        );

                        await walletModel.updateOne(
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
                            },
                            {
                                upsert: true
                            }
                        );

                    })();
                    let amount = canceledData.Order[req.body.index].total;
                    DiscountedAmount = amount
                    if (canceledData.Discount > 0) {
                        let persentage = ((amount / canceledData.SubTotal) * 100).toFixed();

                        discount = ((canceledData.Discount * persentage) / 100).toFixed()

                        DiscountedAmount = DiscountedAmount - discount;

                    }
                    DiscountedAmount += returnShipping;

                    await orderModel.findByIdAndUpdate(
                        { _id: req.body.ID },
                        {
                            $inc: {
                                numberOfOrders: -1,
                                TotalOrderPrice: -DiscountedAmount,
                                SubTotal: -amount,
                                Discount: -discount,
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
                    .then((result) => {

                        const data = {
                            Discount: result.Discount, SubTotal: result.SubTotal
                            , TotalOrderPrice: result.TotalOrderPrice, ShippingCharge: result.ShippingCharge
                        }

                        res.json({ ...data });
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

                    res.json({ status: "rejected" });

                }
            } catch (error) {
                next(error)
            }
        } else {
            ///////////////return accepted////////////////
            try {
                const datas = {
                    Discount: 10, SubTotal: 10
                    , TotalOrderPrice: 20, ShippingCharge: 20
                }
                const path = `Order.${req.body.index}.status`;
                let updateObject = {};
                updateObject[path] = req.body.status;
                await orderModel.findByIdAndUpdate(req.body.ID, { $set: updateObject })
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
                await productItemModel.updateOne(
                    { _id: new Types.ObjectId(ID) },
                    { $inc: { 'variants.$[elem].stock': quantity } },
                    { arrayFilters: [{ 'elem.size': size, 'elem.color': color }] }
                );

                let amount = canceledData.Order[req.body.index].total;
                let DiscountedAmount = amount;
                let discount = 0
                if (canceledData.Discount > 0) {
                    let persentage = ((amount / canceledData.SubTotal) * 100).toFixed()

                    discount = ((canceledData.Discount * persentage) / 100).toFixed()
                    DiscountedAmount = DiscountedAmount - discount;
                }
                await walletModel.updateOne(
                    { UserID: req.session.customerId },
                    { $inc: { Amount: DiscountedAmount } }
                );
                const updatedData = await orderModel.findByIdAndUpdate(canceledData._id, {
                    $inc: {
                        SubTotal: -amount,
                        TotalOrderPrice: -DiscountedAmount,
                        numberOfOrders: -1,
                        Discount: -discount
                    },
                }, { new: true });
                datas.Discount = updatedData.Discount || 0
                datas.SubTotal = updatedData.SubTotal || 0,
                    datas.TotalOrderPrice = updatedData.TotalOrderPrice | 0
                datas.ShippingCharge = updatedData.ShippingCharge
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
                res.json({ status: "accepted", ...datas });
            } catch (error) {
                console.log(error)
                next(error)
            }
        }
    },
    coupen: async (req, res) => {
        try {
            const { name, code, amount, id, starting: startingDate, ending: expiry } = req.body
            if (!name || !code || !amount || !id || !startingDate || !expiry) {
                throw new Error('in sufficient data')
            }
            const editedData = { name, code, amount: Number(amount), startingDate: new Date(startingDate), expiry: new Date(expiry) }
            const couponToBeEdited = await coupenModel.findById(id).lean()
            if (!couponToBeEdited) {
                throw new Error('coupen not found to edit')
            }
            let isUpdated = false
            for (let key in editedData) {
                if (couponToBeEdited[key] !== editedData[key]) {

                    if (key === 'startingDate' || key === 'expiry') {
                        if (couponToBeEdited[key].toLocaleDateString() === editedData[key].toLocaleDateString()) {
                            continue
                        } else {
                            isUpdated = true
                            break
                        }
                    } else {
                        isUpdated = true
                        break
                    }
                }
            }
            if (!isUpdated) {
                throw new Error('upadation not found')
            }
            const response = await coupenModel.updateOne(
                { _id: req.body.id },
                { ...editedData, name: name }
            );
            if (response)
                res.json("Coupen Updated");
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: error.message || 'internal server error' })
        }
    },
    deleteField: async (req, res, next) => {
        try {

            for (let i = 0; i < req.body.proID.length; i++) {
                await productItemModel.findByIdAndUpdate(req.body.proID[i], {
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
                    await productItemModel.findByIdAndUpdate(data.ProductIDs[i], {
                        $set: { offer_rate: 0 },
                    });
                }
                await offerModel.findByIdAndUpdate(req.body.ID, {
                    $set: { status: false },
                });
            } else {
                for (let i = 0; i < data.ProductIDs.length; i++) {
                    await productItemModel.findByIdAndUpdate(data.ProductIDs[i], {
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
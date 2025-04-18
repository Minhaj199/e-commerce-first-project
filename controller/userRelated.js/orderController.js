
const orderModel = require("../../Model/orders");
const cartModel = require("../../Model/cart");
const coupenModel = require("../../Model/coupen");
const coupenTrackingModel = require("../../Model/coupenTracking");
const walletModel = require("../../Model/wallets");
const user = require("../../Model/user");
const RazorPay = require("razorpay");
const lodash = require("lodash");
const path = require("path");
const { Types } = require("mongoose");
const productItemModel = require("../../Model/prouctItems");


module.exports = {
    checkoutUtilityRouter: async (req, res,next) => {
        try {
            if (req.query.from === "retryPayment") {
                ////////// retray payment from failed order ////////////
                const jcolor = decodeURIComponent(req.query.color);
                const jsize = decodeURIComponent(req.query.size);
                const jIDs = decodeURIComponent(req.query.IDs);

                const colors = jcolor.split(",");
                const sizes = jsize.split(",");
                const IDs = jIDs.split(",");

                const qty = [];
                for (let i = 0; i < IDs.length; i++) {
                    const temQty = await productItemModel.findById(IDs[i]);

                    qty.push(temQty);
                }
                let sizesArray = [];
               

                for (let i = 0; i < qty.length; i++) {
                    let path = `sizes.${sizes[i]}.${colors[i]}`;

                    sizesArray.push(lodash.get(qty[i], path));
                }

                let count = 0;
                for (let i = 0; i < sizesArray.length; i++) {
                    if (sizesArray[i] === 0) {
                        count++;
                    }
                }
                if (count !== 0) {
                    res.json("no stock");
                } else {
                    res.json("stock");
                }
            } else if (req.query.from === "validateCoupen") {
                console.log('hiiii')
                //////checking applied coupen for in checkout//////
                const id=req.session.customerId
                const isTotalValid=await cartModel.aggregate([{$match:{UserId:new Types.ObjectId(id)}},{$group:{_id:null,sum:{$sum:'$Total'}}}])
                const totalOrderPrice=(isTotalValid.length&&isTotalValid[0]?.sum)?isTotalValid[0]?.sum+60:0
                if(totalOrderPrice<1000){
                    return res.json("Total order less than 1000");
                }
                const validateCoupen = await coupenModel.find({
                    code: req.query.coupen,
                });

                if (validateCoupen.length !== 0) {
                    const expiry = validateCoupen[0].Expiry;
                    const currentDate = new Date();

                    if (expiry < currentDate) {
                        res.json("Code Expird");
                    } else {
                        const checkUsage = await coupenTrackingModel.findOne({
                            $and: [
                                { UserID: req.session.customerId },
                                { CoupenID: validateCoupen[0]._id },
                            ],
                        });

                        if (checkUsage) {
                            res.json("Code Already used");
                        } else {
                            res.json({
                                message: `Code amout ${validateCoupen[0].amount} applied`,
                                amount: validateCoupen[0].amount,
                                flag: true,
                                coupenID: validateCoupen[0]._id,
                            });
                        }
                    }
                } else {
                    res.json("Invalid code");
                }
            }
            else {
                /////checking wallet amount in checkout//////
                const WalletAmount = await walletModel.findOne({
                    UserID: req.session.customerId,
                });
                const amount = WalletAmount?.Amount || 0;

                res.json(amount);
            }
        } catch (error) {
            next(error)
        }
    },
    placeOrder: async (req, res,next) => {
        ///////////placing order from checkout page/////////// 
        console.log(req.body)
        const {orderDetails}=req.body
        const {customerId}=req.session
        if(!orderDetails||!customerId){
            res.status(400).json({message:'in sufficient data'})
            return
        }
        try {
            const orderCount = orderDetails.Order.length;
            const Order = {
                UserId: customerId,
                PaymentOption: orderDetails.paymentOption,
                SubTotal: orderDetails.subTotal,
                Order: orderDetails.Order,
                Discount: orderDetails.discount,
                ShippingCharge: orderDetails.deleveryCharge,
                TotalOrderPrice: orderDetails.total,
                AddressID: orderDetails.addressID,
                payment_Order_id: orderDetails.paymentOrderID,
                payment_id: orderDetails.paymentID,
                numberOfOrders: orderCount,
            };
            if (orderDetails.CoupenID != undefined) {
                const coupenData = {
                    UserID: customerId,
                    CoupenID: orderDetails.CoupenID,
                };
                await coupenTrackingModel.create(coupenData);
            }

            let resultID = "";
            await orderModel
                .create(Order)
                .then((result) => {
                    resultID = result._id;
                    req.session.OrderID = result._id;
                })
                .catch((error) => {
                    console.log(error);
                });
            if (
                orderDetails.paymentOption === "Wallet+Online" ||
                orderDetails.paymentOption === "Wallet"
            ) {
                const amount = orderDetails.Order[0].wallet;

                await walletModel.updateOne(
                    { UserID: customerId },
                    { $inc: { Amount: -amount } }
                );
                const result = await walletModel.updateOne(
                    { UserID: customerId },
                    {
                        $push: {
                            transaction: {
                                id: resultID,
                                amount: amount,
                                status: "Debited",
                                date: new Date(),
                            },
                        },
                    }
                );
            }
            for (let i = 0; i <orderDetails.CartIDs.length; i++) {
                await cartModel.deleteOne({ _id: orderDetails.CartIDs[i] });
            }
            for (let i = 0; i < orderDetails.productID.length; i++) {
                quantity = orderDetails.Order[i].quantity;
                await productItemModel
                    .findOneAndUpdate(
                        { _id: orderDetails.productID[i],'variants.size':orderDetails.sizes[i],'variants.color':orderDetails.colors[i],"variants.stock": { $gt: 0 } },
                        { $inc: { 'variants.$.stock': -quantity } }
                    )
                    .then((result) => { })
                    .catch((error) => {
                        console.log(error);
                    });
            }
            return res.json(true);
        } catch (error) {
            next(error)
        }
    },
    handleFailed: async (req, res,next) => {
        ///////////handling failed order from checkout page///////////
        try {
            const Order = {
                UserId: req.session.customerId,
                PaymentOption: req.body.orderDetails.paymentOption,
                SubTotal: req.body.orderDetails.subTotal,
                Order: req.body.orderDetails.Order,
                Discount: req.body.orderDetails.discount,
                ShippingCharge: req.body.orderDetails.deleveryCharge,
                TotalOrderPrice: req.body.orderDetails.total,
                AddressID: req.body.orderDetails.addressID,
                payment_Order_id: req.body.orderDetails.paymentOrderID,
                payment_id: req.body.orderDetails.paymentID,
                coupenID: req.body.orderDetails.CoupenID,
            };
            for (let i = 0; i < req.body.orderDetails.CartIDs.length; i++) {
                await cartModel.deleteOne({ _id: req.body.orderDetails.CartIDs[i] });
            }
            let OrderID;
            await orderModel
                .create(Order)
                .then((result) => {
                    req.session.OrderID = result._id;
                    return res.json("success");
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
           next(error)
        }
    },
    handleRetryOrder: async (req, res,next) => {
        ///////////retrying order from failed order page///////////
        try {
            const result = await orderModel.findById(req.body.retryObj.id);

            for (let i = 0; i < result.Order.length; i++) {
                result.Order[i].status = "Pending";
                result.Order[i].admin = true;
            }
            result.PaymentOption = "Razor Pay";

            const quantity = result.Order.map((item) => item.quantity);
            const color = result.Order.map((item) => item.color);
            const IDs = result.Order.map((item) => item.ProductID);
            const size = result.Order.map((item) => item.size);
            await orderModel.findByIdAndUpdate(req.body.retryObj.id, {
                $set: result,
                numberOfOrders: IDs.length,
            });

            for (let i = 0; i < IDs.length; i++) {
                path = `sizes.${size[i]}.${color[i]}`;
                const result = await productItemModel.findByIdAndUpdate(IDs[i], {
                    $inc: { [path]: -quantity[i] },
                });
            }

            if (req.body.retryObj.coupenID != "") {
                const coupenData = {
                    UserID: req.session.customerId,
                    CoupenID: req.body.retryObj.coupenID,
                };
                await coupenTrackingModel.create(coupenData);
            }
        } catch (error) {
            next(error)
        }
        res.json("success");
    },
    removeProduct: async (req, res,next) => {
        ///////////removing product from cart or checkout///////////
        try {
            await cartModel
                .findByIdAndUpdate({ _id: req.body.id }, { $set: { status: false } })
                .then(() => {
                    req.session.removeFromCheckout = "Removed Successfully";
                    res.json("ok");
                });
        } catch (error) {
            next(error)
        }
    },
    cancelOreder: async (req, res,next) => {
        /////canceling order from my order page//////
        if (req.body.from === "return order") {
            try {
                const path = `Order.${req.body.index}.status`;
                const pathToReason = `Order.${req.body.index}.reason`;
                let updateObject = {};
                updateObject[pathToReason] = req.body.reason;
                updateObject[path] = "Requested for Return";

                await orderModel
                    .findByIdAndUpdate({ _id: req.body.ID }, { $set: updateObject })
                    .then((result) => {
                        res.json("ok");
                    });
            } catch (error) { }
        } else {
            try {
                const path = `Order.${req.body.index}.status`;
                let updateObject = {};
                updateObject[path] = "Requested for Cancelation";

                await orderModel
                    .findByIdAndUpdate({ _id: req.body.ID }, { $set: updateObject })
                    .then((result) => {
                        res.json("ok");
                    });
            } catch (error) {
               next(error)
            }
        }
    },
    paymentGateway: async (req, res,next) => {
        ///////////payment gateway from checkout page///////////
        try {
            const razorpay = new RazorPay({
                key_id: process.env.key_id,
                key_secret: process.env.key_secret,
            });

            const paymentData = {
                amount: req.body.amount * 100,
                currency: "INR",
                receipt: "###",
            };
            const response = await razorpay.orders.create(paymentData);
            response.pubID = process.env.key_id;
            res.json(response);
        } catch (error) {
            next(error)
        }
    },
    retryPayment: async (req, res,next) => {
        try {
            const razorpay = new RazorPay({
                key_id: process.env.key_id,
                key_secret: process.env.key_secret,
            });

            const paymentData = {
                amount: req.body.amount * 100,
                currency: "INR",
                receipt: "###",
            };
            const response = await razorpay.orders.create(paymentData);

            res.json(response);
        } catch (error) {
            next(error)
        }
    },
    getUserInfo: async (req, res,next) => {
        /////////////get user info for payment gateway///////
        try {
            const userData = await user.findById(req.session.customerId);

            res.status(200).json(userData);
        } catch (error) {
            next(error)
        }
    },
    //   paymentNotification: async (req, res) => {
    //     try {
    //       const notification = req.body;
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   },

}
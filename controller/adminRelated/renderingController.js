const productModel = require('../../Model/product')
const userModel = require('../../Model/user')
const categoryModel = require('../../Model/catagory')
const orderModel = require('../../Model/orders')
const dateFunction = require('../../utils/DateFormating')
const offerModel = require('../../Model/offer')
const { ObjectId } = require('mongodb')
const coupenModel = require('../../Model/coupen')
const productItemModel=require("../../Model/prouctItems")
module.exports = {

    addProduct: async (req, res, next) => {
        try {
            const categoryCollection = await categoryModel.findOne({
                category: { $exists: true },
            });
            const message = req.query.message;
            const errMessage = req.query.errMessage
            res.render("admin/addProductPage", {
                categoryCollection,
                message,
                errMessage,
            });
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    productsMgt: async (req, res, next) => {
        try {
            let page = req.query.page || 1;
            let skip = 4;
            const numOfPage = await productItemModel.find({deleteStatus:false}).count()
            const dynamicPage = Math.ceil(numOfPage / 4);
            let dynamicPageArray = []

            for (let i = 1; i <= dynamicPage; i++) {
                dynamicPageArray.push(i)
            }

            const productData = await productItemModel
                .find({deleteStatus:false})
                .skip((page - 1) * skip)
                .limit(4)
                .sort({ _id: -1 });
            const categoryCollection = await categoryModel.findOne({
                category: { $exists: true },
            });
            
            const message = req.query.message;
            const errMessage = req.query.errMessage;
            const updMessage = req.query.updMessage;
            const updtErrMessage = req.query.updtErrMessage;
            const dltMessage = req.query.dltMessage;
            const dltErrMessage = req.query.dltErrMessage;
            res.render("admin/productMangement", {
                productData,
                categoryCollection,
                message,
                errMessage,
                updMessage,
                updtErrMessage,
                dltMessage,
                dltErrMessage,
                dynamicPageArray
            });
        } catch (error) {
            next(error)
        }

    },
    editProduct: async (req, res, next) => {
        try {
            const ProductData = await productItemModel.findById(req.params.id);
            const CatAndBrand = await categoryModel.findOne();
            const cat = ProductData.category;
            
            res.render("admin/editProduct", { ProductData, CatAndBrand, cat });
        } catch (error) {
            next(error)
        }

    },
    deleteProduct: async (req, res, next) => {
        try {

            const ProductData = await productModel.findById(req.params.id);
            res.render("admin/ProductDelete", { ProductData });
        } catch (error) {
            next(error)
        }

    },
    productStock: async (req, res, next) => {
        try {
            const id=req.params.id
            if(!id&&typeof id!=='string')throw new Error('id not found')
            const product=await productItemModel.findById(id)
            res.render('admin/productStock',{product})  
    
        } catch (error) {
         next(error)   
        }
       
    },
    setProductMgtSorted: async (req, res, next) => {
        try {
            if (req.body.category == "Men") {
                const productData = await productModel.find({ category: "Men" });
                res.render("admin/productMangement", { productData });
            } else if (req.body.category == "Women") {
                const productData = await productModel.find({ category: "Women" });
                res.render("admin/productMangement", { productData });
            } else if (req.body.category == "kids") {
                const productData = await productModel.find({ category: "Kids" });
                res.render("admin/productMangement", { productData });
            } else {
                const productData = await productModel.find();
                res.render("admin/productMangement", { productData });
            }
        } catch (error) {
            next(error)
        }

    },
    login: (req, res, next) => {
        try {
            // res.render("admin/adminLogIn");
            req.session.isAdminAuthenticated = true;
            res.redirect("/admin/product-management");
        } catch (error) {
            next(error)
        }
    },
    dashBord: async (req, res, next) => {
        try {
            const userCount = await userModel.find({ status: true }).count();

            const totalSaleObj = await orderModel.aggregate([
                { $unwind: "$Order" },
                { $match: { "Order.status": "Delivered" } },
                { $group: { _id: "$Order.status", total: { $sum: "$Order.total" } } },
            ]);

            const totalSale = totalSaleObj[0]?.total;
            const products = await productModel.find().count();

            const category = await orderModel.aggregate([
                { $unwind: "$Order" },
                { $match: { "Order.status": "Delivered" } },
                {
                    $lookup: {
                        from: "products",
                        let: { productID: { $toObjectId: "$Order.ProductID" } },
                        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productID"] } } }],
                        as: "ProductDetails",
                    },
                },
                { $unwind: "$ProductDetails" },
                {
                    $group: {
                        _id: "$ProductDetails.category",
                        total: { $sum: "$Order.total" },
                    },
                },
                { $sort: { total: -1 } },
            ]);

            const brand = await orderModel.aggregate([
                { $unwind: "$Order" },
                { $match: { "Order.status": "Delivered" } },
                {
                    $lookup: {
                        from: "products",
                        let: { productID: { $toObjectId: "$Order.ProductID" } },
                        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productID"] } } }],
                        as: "ProductDetails",
                    },
                },
                { $unwind: "$ProductDetails" },
                {
                    $group: {
                        _id: "$ProductDetails.brand",
                        total: { $sum: "$Order.total" },
                    },
                },
                { $sort: { total: -1 } },
            ]);
            const productNames = await orderModel.aggregate([
                { $unwind: "$Order" },
                { $match: { "Order.status": "Delivered" } },
                {
                    $lookup: {
                        from: "products",
                        let: { productID: { $toObjectId: "$Order.ProductID" } },
                        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productID"] } } }],
                        as: "ProductDetails",
                    },
                },
                { $unwind: "$ProductDetails" },
                {
                    $group: {
                        _id: "$ProductDetails.Name",
                        total: { $sum: "$Order.total" },
                    },
                },
                { $sort: { total: -1 } },
            ]);

            const catagoryArray = category.map((item) => item._id);
            const brandArry = brand.map((item) => item._id);
            const productArray = productNames.map((item) => item._id);
            res.render("admin/dashBord", {
                userCount,
                totalSale,
                products,
                catagoryArray,
                brandArry,
                productArray,
            });
        } catch (error) {
            next(error)
        }
    },
    userManagement: async (req, res, next) => {
        try {
            let page = req.query.page || 1;
            let NumberOfPage = await userModel.find().count()
            let pages = Math.ceil(NumberOfPage / 3)
            let dynamicPageArray = []
            for (let i = 1; i <= pages; i++) {
                dynamicPageArray.push(i)
            }
            let limit = 4;
            let userData = await userModel
                .find()
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ _id: -1 });
            for (let i = 0; i < userData.length; i++) {
                userData[i].formatedDate = dateFunction.Invoice(userData[i].created_at);
            }
            const unBlockMessage = req.query.unBlockMessage;
            const blockMessage = req.query.blockMessage;
            const dltMessage = req.query.dltMessage;
            res.render("admin/userManagement", {
                userData,
                unBlockMessage,
                blockMessage,
                dltMessage,
                dynamicPageArray,
            });
        } catch (error) {
            next(error)
        }

    },
    categoryManagement: async (req, res, next) => {
        try {
            let newdoc = await categoryModel({ category: { $exists: true } });
            let catMessage = req.query.catMessage;
            let editedMessage = req.query.editMessage;
            let dltMessage = req.query.dltMessage;
            res.render("admin/categoryManagement", {
                newdoc,
                catMessage,
                editedMessage,
                dltMessage,
            });
        } catch (error) {
            next(error)
        }

    },
    addcategory: (req, res) => {
        res.render("admin/addcategory");
    },
    editCategory: async (req, res, next) => {
        try {
            const categoryIndex = req.params.id;

            const doc = await categoryModel.findByIdAndUpdate({
                _id: "65e085036e57f3e5630201fd",
            });
            const element = doc.category[categoryIndex];
            res.render("admin/editcategory", { element, categoryIndex });

        } catch (error) {
            next(error)
        }
    },
    deleteCategory: async (req, res, next) => {
        try {
            const categoryIndex = req.params.id;

            const doc = await categoryModel.findByIdAndUpdate({
                _id: "65e085036e57f3e5630201fd",
            });
            const element = doc.category[categoryIndex];
            res.render("admin/deletecategory", { element, categoryIndex });
        } catch (error) {
            next(error)
        }
    },
    brandPage: async (req, res, next) => {
        try {
            if (req.query.To === "brand") {
                let newdoc = await categoryModel.findOne({ brand: { $exists: true } });
                let brandAddedMessage = req.query.brandAddedMessage;
                let brandEditedMessage = req.query.brandEditedMessage;
                let dltMessage = req.query.dltMessage;
                res.render("admin/BrandManagement", {
                    newdoc,
                    brandAddedMessage,
                    brandEditedMessage,
                    dltMessage,
                });
            } else if (req.query.from === "addButton") {
                res.render("admin/addBrand");
            } else if (req.query.from === "editButton") {
                const categoryIndex = req.query.index;

                const doc = await categoryModel.findOne({ brand: { $exists: true } });
                const element = doc.brand[categoryIndex];
                res.render("admin/editBrand", { element, categoryIndex });
            } else if ((req.query.from === "DeleteButton")) {
                const categoryIndex = req.query.index;

                const doc = await categoryModel.findOne({ brand: { $exists: true } });
                const element = doc.brand[categoryIndex];
                res.render("admin/deleteBrand", { element, categoryIndex });
            } else {
                let newdoc = await categoryModel.findOne({ brand: { $exists: true } });
                res.render("admin/BrandManagement", { newdoc });
            }
        } catch (error) {
            next(error)
        }
    },
    getPages: async (req, res, next) => {
        //////order page,individual order page, coupen page, offer page, sale report page//////////
        try {
            if (req.query.from === "orders") {
                const data = await orderModel.aggregate([
                    {
                        $lookup: {
                            from: "users",
                            localField: "UserId",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                    { $unwind: "$user" },
                    { $sort: { _id: -1 } },
                ]);

                for (let i = 0; i < data.length; i++) {
                    let format = new Date(`${data[i].OrderPlacedDate}`);
                    data[i].Date = format.toLocaleDateString();
                }

                res.render("admin/OrderMangement", { data });
            } else if (req.query.from === "orderProductDetails") {
                const OrderID = req.query.proID;
                const ProductData = await orderModel.aggregate([
                    { $match: { _id: new ObjectId(OrderID) } },
                    { $unwind: "$Order" },
                    {
                        $lookup: {
                            from: "product_items",
                            let: { productID: { $toObjectId: "$Order.ProductID" } }, // Convert string ID to ObjectId
                            pipeline: [
                                { $match: { $expr: { $eq: ["$_id", "$$productID"] } } },
                            ],
                            as: "ProductDetails",
                        },
                    },
                    { $unwind: "$ProductDetails" },
                ]);
                const orderData = await orderModel.aggregate([
                    { $match: { _id: new ObjectId(OrderID) } },
                    {
                        $lookup: {
                            from: "addresses",
                            localField: "AddressID",
                            foreignField: "_id",
                            as: "address",
                        },
                    },
                    { $unwind: "$address" },
                    { $unwind: "$Order" },
                ]);

                res.render("admin/OrderProductDetails", { ProductData, orderData });
            } else if (req.query.from === "coupen") {
                const coupenData = await coupenModel.find().sort({ _id: -1 });

                for (let i = 0; i < coupenData.length; i++) {
                    coupenData[i].FormatedExpiry =
                        coupenData[i].expiry.toLocaleDateString();
                    coupenData[i].Formatedstarting =
                        coupenData[i].startingDate.toLocaleDateString();
                }

                res.render("admin/manageCoupen", { coupenData });
            } else if (req.query.from === "Sale report") {
                const data = await orderModel
                    .aggregate([
                        {
                            $lookup: {
                                from: "users",
                                localField: "UserId",
                                foreignField: "_id",
                                as: "user",
                            },
                        },
                        { $unwind: "$user" },
                        { $match: { PaymentOption: { $ne: "payment-Failed" } } },
                    ])
                    .sort({ OrderPlacedDate: -1 });

                for (let i = 0; i < data.length; i++) {
                    let format = new Date(`${data[i].OrderPlacedDate}`);
                    data[i].Date = format.toLocaleDateString();
                }

                const newData = data.filter((element) => element.numberOfOrders > 0);

                res.render("admin/salesReport", { newData });
            } else if (req.query.from === "offer") {
                try {
                    const error = req.session.offerNotAdded;
                    const success = req.session.offerAdded;

                    delete req.session.offerNotAdded;
                    delete req.session.offerAdded;
                    const category = await categoryModel.findOne();

                    const offerData = await offerModel
                        .find()
                        .populate("ProductIDs")
                        .sort({ _id: -1 });
                    res.render("admin/OfferManagement", {
                        success,
                        error,
                        offerData,
                        category,
                    });
                } catch (error) {
                   next(error)
                }
            }
        } catch (error) {
            next(error)
        }
    },
    salesFiltering: async (req, res, next) => {
        try {
            if (req.query.filter === "daily") {
                const currentDate = new Date();

                const startingOfDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate(),
                    0,
                    0,
                    0
                );
                const endOfDay = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate(),
                    23,
                    59,
                    59
                );

                const data = await orderModel
                    .aggregate([
                        {
                            $lookup: {
                                from: "users",
                                localField: "UserId",
                                foreignField: "_id",
                                as: "user",
                            },
                        },
                        {
                            $match: {
                                OrderPlacedDate: { $gte: startingOfDate, $lte: endOfDay },
                            },
                        },
                        { $unwind: "$user" },
                        { $match: { PaymentOption: { $ne: "payment-Failed" } } },
                    ])
                    .sort({ OrderPlacedDate: -1 });

                for (let i = 0; i < data.length; i++) {
                    let format = new Date(`${data[i].OrderPlacedDate}`);
                    data[i].Date = format.toLocaleDateString();
                }

                const dateData = dateFunction.Invoice(currentDate);
                const newData = data.filter((element) => element.numberOfOrders > 0);
                const DateInfo = `Data on : ${dateData}`;
                const sortingVariable = "Daily";
                res.render("admin/salesReport", { newData, DateInfo, sortingVariable });
            } else if (req.query.filter === "Monthly") {
                const currentDate = new Date();
                const startOfMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    1
                );
                const endOfMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    0,
                    23,
                    59,
                    59
                );

                const month = currentDate.getMonth();

                const monthArray = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ];
                const tookMonth = monthArray[month];

                const data = await orderModel
                    .aggregate([
                        {
                            $lookup: {
                                from: "users",
                                localField: "UserId",
                                foreignField: "_id",
                                as: "user",
                            },
                        },
                        {
                            $match: {
                                OrderPlacedDate: { $gte: startOfMonth, $lte: endOfMonth },
                            },
                        },
                        { $unwind: "$user" },
                        { $match: { PaymentOption: { $ne: "payment-Failed" } } },
                    ])
                    .sort({ OrderPlacedDate: -1 });

                for (let i = 0; i < data.length; i++) {
                    let format = new Date(`${data[i].OrderPlacedDate}`);
                    data[i].Date = format.toLocaleDateString();
                }
                const newData = data.filter((element) => element.numberOfOrders > 0);
                const DateInfo = `Data on : ${tookMonth} month`;
                const sortingVariable = "Monthly";
                res.render("admin/salesReport", { newData, DateInfo, sortingVariable });
            } else if (req.query.filter === "yearly") {
                const currentDate = new Date();
                const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
                const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59);

                const data = await orderModel
                    .aggregate([
                        {
                            $lookup: {
                                from: "users",
                                localField: "UserId",
                                foreignField: "_id",
                                as: "user",
                            },
                        },
                        {
                            $match: { OrderPlacedDate: { $gte: startOfYear, $lte: endOfYear } },
                        },
                        { $unwind: "$user" },
                        { $match: { PaymentOption: { $ne: "payment-Failed" } } },
                    ])
                    .sort({ OrderPlacedDate: -1 });

                for (let i = 0; i < data.length; i++) {
                    let format = new Date(`${data[i].OrderPlacedDate}`);
                    data[i].Date = format.toLocaleDateString();
                }
                const newData = data.filter((element) => element.numberOfOrders > 0);
                const year = currentDate.getFullYear();
                const DateInfo = `Data on :Year ${year} `;
                const sortingVariable = "Yearly";

                res.render("admin/salesReport", { newData, DateInfo, sortingVariable });
            } else if (req.query.hasOwnProperty("starting")) {
                const starting = new Date(req.query.starting);
                const endingDate = new Date(req.query.ending);
                const data = await orderModel
                    .aggregate([
                        {
                            $lookup: {
                                from: "users",
                                localField: "UserId",
                                foreignField: "_id",
                                as: "user",
                            },
                        },
                        { $match: { OrderPlacedDate: { $gte: starting, $lte: endingDate } } },
                        { $unwind: "$user" },
                        { $match: { PaymentOption: { $ne: "payment-Failed" } } },
                    ])
                    .sort({ OrderPlacedDate: -1 });

                for (let i = 0; i < data.length; i++) {
                    let format = new Date(`${data[i].OrderPlacedDate}`);
                    data[i].Date = format.toLocaleDateString();
                }
                const newData = data.filter((element) => element.numberOfOrders > 0);
                const startingDate = dateFunction.Invoice(starting);
                const ending = dateFunction.Invoice(endingDate);
                const DateInfo = `Data Between:${startingDate} and ${ending} `;
                const sortingVariable = "Custom";

                res.render("admin/salesReport", { newData, DateInfo, sortingVariable });
            }
        } catch (error) {
            next(error)
        }

    },
    invoice: async (req, res, next) => {
        try {
            let index = req.query.index;
            let OrderID = req.query.id;

            const orderData = await orderModel.aggregate([
                { $match: { _id: new ObjectId(OrderID) } },
                {
                    $lookup: {
                        from: "addresses",
                        localField: "AddressID",
                        foreignField: "_id",
                        as: "address",
                    },
                },
                { $unwind: "$address" },
                { $unwind: "$Order" },
            ]);

            const id = orderData[index].Order.ProductID;

            const proData = await productItemModel.findById(id);

            let invoiceData = {
                soldBy: proData.brand,
                invoice: orderData[index].Order.invoiceNumber,
                orderID: orderData[index]._id,
                address: orderData[index].address,
                orderDate: dateFunction.Invoice(orderData[index].OrderPlacedDate),
                productName: proData.Name,
                orderQty: orderData[index].Order.quantity,
                grossTotal: orderData[index].Order.total,
                discount: orderData[index].Discount / orderData.length,
                taxable_value: (
                    (orderData[index].Order.total -
                        orderData[index].Discount / orderData.length) *
                    (91 / 100)
                ).toFixed(2),
                tax: (
                    (orderData[index].Order.total -
                        orderData[index].Discount / orderData.length) *
                    (9 / 100)
                ).toFixed(2),
                Total:
                    orderData[index].Order.total -
                    orderData[index].Discount / orderData.length,
            };

            res.render("user/invoice", { invoiceData });
        } catch (error) {
            next(error)
        }

    },
}

const dotenv = require("dotenv");
dotenv.config({ path: "./configaration" });
const productModel = require("../Model/product");
const userModel = require("../Model/user");
const Category = require("../Model/catagory");
const orderModel = require("../Model/Order");
const { ObjectId } = require("mongodb");
const walletModel = require("../Model/Wallet");
const coupenModel = require("../Model/coupen");
const coupenTrackingModel = require("../Model/coupenTracking");

const upload = require("../middleware/multer");
const cloudinary = require("../middleware/cludinary");
const fs = require("fs");
const Razorpay = require("razorpay");
const offerModel = require("../Model/offer");
const { includes } = require("lodash");
const dateFunction = require("../utility/DateFormating");
const cartModel = require("../Model/cart");
const wishlistModel = require("../Model/wishList");


module.exports = {
  getLogin: (req, res) => {
    res.render("admin/adminLogin");
  },
  adminAuthentication: (req, res) => {
    const { email, password } = req.body;
    const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
    if (email === ADMIN_USERNAME) {
      if (password === ADMIN_PASSWORD) {
        req.session.isAdminAuthenticated = true;
        res.redirect("/admin/datashBord");
      } else {
        res.render("admin/adminLogIn", { message: "Invalid Password" });
      }
    } else {
      res.render("admin/adminLogIn", { message: "Invalid Email Account" });
    }
  },
  sign_out: (req, res) => {
    delete req.session.isAdminAuthenticated;
    res.redirect("/admin");
  },
  getDashBord: async (req, res) => {
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
      console.log(error);
    }
  },
  getAddProduct: async (req, res) => {
    try {
      const categoryCollection = await Category.findOne({
        category: { $exists: true },
      });
      const message = req.query.message;
      const errMessage = req.query.errMessage;
      res.render("admin/addProductPage", {
        categoryCollection,
        message,
        errMessage,
      });
    } catch (error) {
      console.log(error);
    }
  },
  getProductManagement: async (req, res) => {
    let page = req.query.page || 1;
    let skip = 4;
    const numOfPage = await productModel.find().count()
    const dynamicPage = Math.ceil(numOfPage / 4);
    let dynamicPageArray=[]

    for(let i=1;i<=dynamicPage;i++){
      dynamicPageArray.push(i)
    }
   
    const productData = await productModel
      .find()
      .skip((page - 1) * skip)
      .limit(4)
      .sort({ _id: -1 });
    const categoryCollection = await Category.findOne({
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
  },
  getProductManagementSorted: async (req, res) => {
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
  },
  productAdding: async (req, res) => {
    const uploader = async (path) => await cloudinary.uploads(path, "Images");

    let urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;

      const newPath = await uploader(path);

      urls.push(newPath);
      fs.unlinkSync(path);
    }
    try {
      const imagePaths = urls.map((item) => item.url);
      const finalImage = imagePaths.slice(0, 5);

      const Newproduct = {
        Name: req.body.Name,
        brand: req.body.brand,
        category: req.body.category,
        sizes: {
          small: {
            white: req.body.small_white ? req.body.small_white : 0,
            black: req.body.small_black ? req.body.small_black : 0,
            red: req.body.small_red ? req.body.small_red : 0,
          },
          medium: {
            white: req.body.medium_white ? req.body.medium_white : 0,
            black: req.body.medium_black ? req.body.medium_black : 0,
            red: req.body.medium_red ? req.body.medium_red : 0,
          },
          large: {
            white: req.body.large_white ? req.body.large_white : 0,
            black: req.body.large_black ? req.body.large_black : 0,
            red: req.body.large_red ? req.body.large_black : 0,
          },
        },

        price: req.body.price,
        description: req.body.description,
        images: {
          path: finalImage,
        },
      };

      await productModel
        .create(Newproduct)
        .then((result) => {
          res.redirect(
            "/admin/product-management?message=Product Added Successfully"
          );
        })
        .catch((error) => {
          res.redirect(
            "/admin/product-management?errMessage=Product Added successfull"
          );
        });
    } catch (error) {}
  },
  getEditPage: async (req, res) => {
    const ProductData = await productModel.findById(req.params.id);
    const CatAndBrand = await Category.findOne();
    const cat = ProductData.category;
    
    res.render("admin/EditProduct", { ProductData, CatAndBrand, cat });
  },
  putEditPage: async (req, res) => {
    try {
      
      const uploader = async (path) => await cloudinary.uploads(path, "Images");

      let urls = [];
      const files = req.files;
      
      let newPhoto=[]
       
      if (req.files.length > 0) {
         for(let i=0;i<req.files.length;i++){
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
      const oldData = await productModel.findById({ _id: req.params.id });
      let updatedPhotos=oldData.images.path
       
      
         if (finalImage.length > 0) {
         
           for (let i = 0; i < imagePaths.length; i++) {
             updatedPhotos[newPhoto[i]] = finalImage[i]
           }
         
         }
      
     
      

      const productData = {
        Name: req.body.Name,
        brand: req.body.brand,
        category: req.body.category,
        sizes: {
          small: {
            white: req.body.small_white ? req.body.small_white : 0,
            black: req.body.small_black ? req.body.small_black : 0,
            red: req.body.small_red ? req.body.small_red : 0,
          },
          medium: {
            white: req.body.medium_white ? req.body.medium_white : 0,
            black: req.body.medium_black ? req.body.medium_black : 0,
            red: req.body.medium_red ? req.body.medium_red : 0,
          },
          large: {
            white: req.body.large_white ? req.body.large_white : 0,
            black: req.body.large_black ? req.body.large_black : 0,
            red: req.body.large_red ? req.body.large_black : 0,
          },
        },
        price: req.body.price,
        description: req.body.description,
        images: {
          path: finalImage.length > 0 ? updatedPhotos : oldData.images.path,
        },
      };
      
   
      await productModel
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
      console.log(error)
    }
  },
  getDeletePage: async (req, res) => {
    const ProductData = await productModel.findById(req.params.id);
    res.render("admin/ProductDelete", { ProductData });
  
  },
  deleteProduct: async (req, res) => {
    try {
      const del = req.params.id;
      await productModel.deleteOne({ _id: del });
      res.redirect(
        `/admin/product-management?dltMessage=Product Deleted Successfully`
      );
    } catch (error) {
      res.redirect(
        `/admin/product-management?dltErrMessage=Product Deleted Unsuccessfully`
      );
    }
  },

  //user management

  getUserManagement: async (req, res) => {
    let page = req.query.page || 1;
    let NumberOfPage=await userModel.find().count()
    let pages=Math.ceil(NumberOfPage/3)
    let dynamicPageArray=[]
    for(let i=1;i<=pages;i++){
      dynamicPageArray.push(i)
    }
    let limit = 4;
    let userData = await userModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ _id: -1 });
      for(let i=0;i<userData.length;i++){
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
  },
  getUnblocled: async (req, res) => {
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
  },
  getDelete: async (req, res) => {
    await userModel.deleteOne({ _id: req.params.id });
    await walletModel.deleteOne({ UserID: req.params.id });
    await cartModel.deleteMany({ UserId :req.params.id});
    await wishlistModel({ UserID :req.params.id})
    req.session.isUserAuthenticated = false;
    req.session.user = false;
    res.redirect("/admin/userManagemnent?dltMessage=User Deleted Successfully");
  },
  getCategoryManagement: async (req, res) => {
    let newdoc = await Category.findOne({ category: { $exists: true } });
    let catMessage = req.query.catMessage;
    let editedMessage = req.query.editMessage;
    let dltMessage = req.query.dltMessage;
    res.render("admin/CategoryManagement", {
      newdoc,
      catMessage,
      editedMessage,
      dltMessage,
    });
  },
  getAddCategory: (req, res) => {
    res.render("admin/addCategory");
  },
  addCategory: async (req, res) => {
    try {
      const Data = req.body.cate;
      await Category.findOneAndUpdate(
        { _id: "65e085036e57f3e5630201fd" },
        { $addToSet: { category: Data } },
        { upsert: true, new: true }
      );
      res.redirect(
        "/admin/manageCategory?catMessage=Category Added Successfully"
      );
    } catch (error) {
      throw new Error();
    }
  },
  editCategorybefore: async (req, res) => {
    const categoryId = "65e085036e57f3e5630201fd";
    const categoryIndex = req.params.id;

    const doc = await Category.findByIdAndUpdate({
      _id: "65e085036e57f3e5630201fd",
    });
    const element = doc.category[categoryIndex];
    res.render("admin/editCategory", { element, categoryIndex });
  },

  editCategory: async (req, res) => {
    const documentId = "65e085036e57f3e5630201fd";
    const elementId = req.params.id;
    const newName = req.body.cate;

    await Category.findOneAndUpdate(
      { _id: documentId },
      { $set: { [`category.${elementId}`]: newName } } // Update using dot notation
    );
    res.redirect(
      "/admin/manageCategory?editMessage=Category Updated Successfully"
    );
  },
  deleteCategorybefore: async (req, res) => {
    const categoryId = "65e085036e57f3e5630201fd";
    const categoryIndex = req.params.id;

    const doc = await Category.findByIdAndUpdate({
      _id: "65e085036e57f3e5630201fd",
    });
    const element = doc.category[categoryIndex];
    res.render("admin/deleteCategory", { element, categoryIndex });
  },

  deleteCategory: async (req, res) => {
    const documentId = "65e085036e57f3e5630201fd"; // Assuming this is the correct ID
    const elementId = req.params.id;

    await Category.findOneAndUpdate(
      { _id: documentId },
      { $pull: { category: elementId } }
    );
    res.redirect(
      "/admin/manageCategory?dltMessage=Category Deleted Successfully"
    );
  },
  getBrandPage: async (req, res) => {
    try {
      if (req.query.To === "brand") {
        let newdoc = await Category.findOne({ brand: { $exists: true } });
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

        const doc = await Category.findOne({ brand: { $exists: true } });
        const element = doc.brand[categoryIndex];
        res.render("admin/editBrand", { element, categoryIndex });
      } else if ((req.query.from = "DeleteButton")) {
        const categoryIndex = req.query.index;

        const doc = await Category.findOne({ brand: { $exists: true } });
        const element = doc.brand[categoryIndex];
        res.render("admin/deleteBrand", { element, categoryIndex });
      } else {
        let newdoc = await Category.findOne({ brand: { $exists: true } });
        res.render("admin/BrandManagement", { newdoc });
      }
    } catch (error) {}
  },
  addBrand: async (req, res) => {
    try {
      const Data = req.body.brand;
      await Category.findOneAndUpdate(
        { brand: { $exists: true } },
        { $addToSet: { brand: Data } },
        { upsert: true, new: true }
      );
      res.redirect(
        "/admin/getBrandPages?To=brand&brandAddedMessage=Brand Added Successfully"
      );
    } catch (error) {}
  },
  editBrand: async (req, res) => {
    try {
      const elementId = req.params.id;
      const newName = req.body.cate;
      await Category.findOneAndUpdate(
        { brand: { $exists: true } },
        { $set: { [`brand.${elementId}`]: newName } }
      );
      res.redirect(
        "/admin/getBrandPages?To=brand&brandEditedMessage=Brand Updated Successfully"
      );
    } catch (error) {}
  },
  deleteBrand: async (req, res) => {
    try {
      const elementId = req.body.cate;

      await Category.updateOne(
        { brand: { $exists: true } },
        { $pull: { brand: elementId } }
      );
      res.redirect(
        "/admin/getBrandPages?To=brand&dltMessage=Deleted Successfully"
      );
    } catch (error) {}
  },
  getPages: async (req, res) => {
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
              from: "products",
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
            coupenData[i].Expiry.toLocaleDateString();
          coupenData[i].FormatedCreatedAt =
            coupenData[i].createdAt.toLocaleDateString();
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
          const category = await Category.findOne();

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
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
  ChangeStatus: async (req, res) => {
    try {
      if (req.body.from === "changeStatus") {
        if (req.body.status === "Canceled") {
          const canceledData = await orderModel.findById(req.body.ID);

          const ID = canceledData.Order[req.body.index].ProductID;
          quantity = canceledData.Order[req.body.index].quantity;

          const size = canceledData.Order[req.body.index].size;

          const color = canceledData.Order[req.body.index].color;

          const result = await productModel.updateOne(
            { _id: ID },
            { $inc: { [`sizes.${size}.${color}`]: quantity } }
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
              discount = canceledData.Discount / canceledData.Order.length;
              if (discount <= amount) {
                let sample = amount;
                amount = sample - discount;
              }
            }
             returnShipping = Math.floor(
             60 / canceledData.Order.length
            );
           
            amount=Math.floor(returnShipping+amount )
            console.log("amount inside function afeter adding retunrsh" + amount);
            const refund = await walletModel.updateOne(
              
              { UserID: req.session.customerId },
              { $inc: { Amount: amount } }
            );

            const log = await walletModel.updateOne(
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
            discount = canceledData.Discount / canceledData.Order.length;
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
          .then((result) => {
            res.json("ok");
          });
      }
    } catch (error) {
      console.log(error);
    }
  },
  returnProduct: async (req, res) => {
    if (req.body.status === "Return Reject") {
      try {
        const path = `Order.${req.body.index}.status`;
        let updateObject = {};
        updateObject[path] = req.body.status;

        await orderModel
          .findByIdAndUpdate({ _id: req.body.ID }, { $set: updateObject })
          .then((result) => {});
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
        console.log(error);
      }
    } else {
      try {
        const path = `Order.${req.body.index}.status`;
        let updateObject = {};
        updateObject[path] = req.body.status;

        await orderModel
          .findByIdAndUpdate({ _id: req.body.ID }, { $set: updateObject })
          .then((result) => {});
        const paths = `Order.${req.body.index}.admin`;
        let updateObjects = {};
        updateObjects[paths] = false;
        await orderModel.findByIdAndUpdate(
          { _id: req.body.ID },
          { $set: updateObjects }
        );

        const canceledData = await orderModel.findById(req.body.ID);

        const ID = canceledData.Order[req.body.index].ProductID;
        quantity = canceledData.Order[req.body.index].quantity;

        const size = canceledData.Order[req.body.index].size;

        const color = canceledData.Order[req.body.index].color;

        const result = await productModel.updateOne(
          { _id: ID },
          { $inc: { [`sizes.${size}.${color}`]: quantity } }
        );
        (async function () {
          let amount = canceledData.Order[req.body.index].total;
          let DiscountedAmount = amount;
          if (canceledData.Discount > 0) {
            discount = canceledData.Discount / canceledData.Order.length;
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
          const log = await walletModel.updateOne(
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
        console.log(error);
      }
    }
  },
  addCoupen: async (req, res) => {
    const coupenData = {
      code: req.body.code,
      Expiry: req.body.compareData,
      amount: parseInt(req.body.amount),
    };
    try {
      const result = await coupenModel.create(coupenData);
      if (result) {
        res.json("Coupen created");
      }
    } catch (error) {
      console.log(error);
    }
  },
  fetchData: async (req, res) => {
    try {
      if (req.query.from === "coupen") {
        const result = await coupenModel.findOne({ code: req.query.code });

        if (result) {
          return res.json("used");
        } else {
          res.json("unUsed");
        }
      } else if (req.query.from === "editCoupen") {
        const coupenData = await coupenModel.findById(req.query.id);

        res.json(coupenData);
      } else if (req.query.from === "validateCoupen") {
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
      } else if (req.query.from === "OfferMgm") {
        const data = await productModel.find({
          $and: [
            { category: req.query.category },
            { offer_rate: { $exists: false } },
          ],
        });

        res.json(data);
      } else if (req.query.from === "editOffer") {
        const data = await offerModel
          .findById(req.query.id)
          .populate("ProductIDs");
        res.json(data);
      } else if (req.query.from === "chartData") {
        const category = await orderModel.aggregate([
          { $unwind: "$Order" },
          { $match: { "Order.status": "Delivered" } },
          {
            $lookup: {
              from: "products",
              let: { productID: { $toObjectId: "$Order.ProductID" } }, // Convert string ID to ObjectId
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$productID"] } } },
              ],
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

        const categorylist = await Category.find();

        res.json({ category, categorylist });
      } else if (req.query.from === "salesActual") {
        const data = await orderModel.aggregate([
          { $unwind: "$Order" },
          { $match: { "Order.status": "Delivered" } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m", date: "$OrderPlacedDate" },
              },
              totalSale: { $sum: "$Order.total" },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        let array = [];
        for (let i in data) {
          array.push(data[i].totalSale);
        }

        res.json(array);
      } else if (req.query.from === "coupenEdit") {
        const result = await coupenModel.findOne({ code: req.query.code });
        const id = result?._id.toString();

        if (result) {
          if (id === req.query.ID) {
            res.json("unUsed");
          } else {
            return res.json("used");
          }
        } else {
          res.json("unUsed");
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
  editCoupen: async (req, res) => {
    const editedData = {
      code: req.body.code,
      Expiry: req.body.compareData,
      amount: req.body.amount,
    };
    const response = await coupenModel.updateOne(
      { _id: req.body.id },
      editedData
    );

    res.json("Coupen Updated");
  },
  deleteCoupen: async (req, res) => {
    await coupenModel.deleteOne({ _id: req.body.id });
    res.json("deleted");
  },
  salesFiltering: async (req, res) => {
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
  },
  createOffer: async (req, res) => {
    try {
      const check = await offerModel.findOne({ Title: req.body.title });
      if (check) {
        req.session.offerNotAdded = "Not added";
        res.redirect("/admin/getPages?from=offer");
      } else {
        let productArray = [];

        if (typeof req.body.productsID === "string") {
          productArray.push(req.body.productsID);
        } else {
          productArray = req.body.productsID;
        }

        const offerObj = {
          Title: req.body.title,
          category: req.body.category,
          rate: req.body.rate,
          ProductIDs: req.body.productsID,
        };
        for (let i = 0; i < productArray.length; i++) {
          const result = await productModel.findByIdAndUpdate(productArray[i], {
            $set: { offer_rate: req.body.rate },
          });
        }

        await offerModel.create(offerObj);

        req.session.offerAdded = "Offer Added";
        res.redirect("/admin/getPages?from=offer");
      }
    } catch (error) {
      console.log(error);
    }
  },
  deleteOffer: async (req, res) => {
    try {
      await offerModel.deleteOne({ _id: req.body.id });
      res.json("Offer Deleted");
    } catch (error) {
      console.log(error);
    }
  },
  deleteField: async (req, res) => {
    for (let i = 0; i < req.body.proID.length; i++) {
      await productModel.findByIdAndUpdate(req.body.proID[i], {
        $unset: { offer_rate: "" },
      });
    }
    res.json("deletd");
  },
  editOffer: async (req, res) => {
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
      console.log(error);
    }
  },
  getInvoice: async (req, res) => {
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

    const proData = await productModel.findById(id);

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
  },
};

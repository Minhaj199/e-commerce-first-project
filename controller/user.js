const user = require("../Model/user");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const otpSchema = require("../Model/otp/otp");
const OTP = require("../Model/otp/otp");
const productModel = require("../Model/product");
const categoryModel = require("../Model/catagory");
const addressModel = require("../Model/address");
const { ObjectId } = require("mongodb");
const lodash = require("lodash");
const cartModel = require("../Model/cart");
const orderModel = require("../Model/Order");
const RazorPay = require("razorpay");
const Order = require("../Model/Order");
const wishlistModel = require("../Model/wishList");
const walletModel = require("../Model/Wallet");
const coupenTrackingModel = require("../Model/coupenTracking");
const offerModel = require("../Model/offer");
const coupenModel = require("../Model/coupen");
const capitalisation = require("../utility/makeCapitalLetter");
const forgotEmail=require('../Model/otp/forgoEmail')

const dateFunction = require("../utility/DateFormating");


let email;
let data = "";
let otp = 0;

module.exports = {
  getLanding: async (req, res) => {
    try {
      let User = req.session.user;

      let user = req.session.customerId;
      const Data = await productModel.find().limit(9).sort({ _id: -1 });
      const categoryCollecion = await categoryModel.findOne();
      res.render("index", { User, Data, categoryCollecion, user });
    } catch (error) {
      console.log("error on landing page");
    }
  },
  getPages: async (req, res) => {
    try {
      if (req.query.from === "cart") {
        const addedMessage = req.session.addedMessage;
        delete req.session.addedMessage;
        const UserId = req.session.customerId;
        const User = await user.findById({ _id: UserId });
        await cartModel.updateMany({}, { $set: { status: true } });
        const getCart = await cartModel.aggregate([
          { $match: { UserId: new ObjectId(UserId) } },
          {
            $lookup: {
              from: "products",
              localField: "ProductId",
              foreignField: "_id",
              as: "Products",
            },
          },
          { $unwind: "$Products" },
        ]);

        const codeApplied = req.session.codeApplied;
        delete req.session.codeApplied;
        const deleteInfo = req.session.deleteInfo;
        delete req.session.deleteInfo;
        let proId = getCart.map((item) => item.Products._id);
        let colors = getCart.map((item) => item.Color);
        let sizes = getCart.map((item) => item.Size);
        for (let i = 0; i < proId.length; i++) {
          const product = await productModel.findById({ _id: proId[i] });
          getCart[i].currentQuantity = product.sizes[sizes[i]][colors[i]];
        }

        res.render("user/cart", {
          addedMessage,
          getCart,
          User,
          codeApplied,
          deleteInfo,
        });
      } else if (req.query.from === "afterAddedToCart") {
        // const User=await user.findById({_id:req.session.customerId})
        req.session.addedMessage = "Product Added To Cart";
        res.redirect("/user/getPages?from=cart");
      } else if (req.query.from === "cartToCheckOut") {
        try {
          const userID = req.session.customerId;
          const checkCart = await cartModel.aggregate([
            { $match: { UserId: new ObjectId(userID) } },
          ]);

          let proId = checkCart.map((item) => item.ProductId);
          let colors = checkCart.map((item) => item.Color);
          let sizes = checkCart.map((item) => item.Size);
          let OrderQuantity = checkCart.map((item) => item.OrderQuantity);

          for (let i = 0; i < proId.length; i++) {
            const propertyName = `sizes.${sizes[i]}.${colors[i]}`;
            const product = await productModel.findById(proId[i], {
              [propertyName]: 1,
              _id: 0,
            });
            const productName = await productModel.findById(proId[i], {
              Name: 1,
              _id: 0
            });

            const qty = product.sizes[sizes[i]][colors[i]];

            if (OrderQuantity[i] > qty) {
              req.session.addedMessage =
                qty === 0
                  ? productName.Name + " is out of stock"
                  : productName.Name +
                    " is only " +
                    qty +
                    " stock.Please reduce the stock";
              return res.redirect("/user/getPages?from=cart");
            }
          }
          const UserId = userID;
          const removeFromCheckout = req.session.removeFromCheckout;
          const addressData = await addressModel.find({
            UserId: req.session.customerId,
          });
          delete req.session.removeFromCheckout;
          const discount = await user.findById(
            { _id: UserId },
            { _id: 0, Discount: 1 }
          );
          const getCart = await cartModel.aggregate([
            { $match: { status: true } },
            { $match: { UserId: new ObjectId(UserId) } },
            {
              $lookup: {
                from: "products",
                localField: "ProductId",
                foreignField: "_id",
                as: "Products",
              },
            },
            { $unwind: "$Products" },
          ]);
          const address = await addressModel.findOne({
            $and: [{ UserId: UserId }, { status: true }],
          });
          const deleteAddress = req.session.deleteAddress;
          delete req.session.deleteAddress;

          res.render("user/checkout", {
            discount,
            getCart,
            address,
            removeFromCheckout,
            addressData,
            deleteAddress,
          });
        } catch (error) {
          console.log(error);
        }
      } else if (req.query.from === "afterPlacedOrder") {
        const OrderID = req.session.OrderID;
        delete req.session.OrderID;

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
        const ProductData = await orderModel.aggregate([
          { $match: { _id: new ObjectId(OrderID) } },
          { $unwind: "$Order" },
          {
            $lookup: {
              from: "products",
              let: { productID: { $toObjectId: "$Order.ProductID" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$productID"] } } },
              ],
              as: "ProductDetails",
            },
          },
          { $unwind: "$ProductDetails" },
        ]);

        res.render("user/transactionCompletion", { orderData, ProductData });
      } else if (req.query.from === "orderFailed") {
        const OrderID = req.session.OrderID;
        delete req.session.OrderID;

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
        const ProductData = await orderModel.aggregate([
          { $match: { _id: new ObjectId(OrderID) } },
          { $unwind: "$Order" },
          {
            $lookup: {
              from: "products",
              let: { productID: { $toObjectId: "$Order.ProductID" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$productID"] } } },
              ],
              as: "ProductDetails",
            },
          },
          { $unwind: "$ProductDetails" },
        ]);

        res.render("user/transactionFailed", { orderData, ProductData });
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

        res.render("user/OrderProductDetails", { ProductData, orderData });
      } else if (req.query.from == "getMyOrder") {
        const data = await orderModel
          .find({ UserId: req.session.customerId })
          .sort({ _id: -1 });
        for (let i = 0; i < data.length; i++) {
          let format = new Date(`${data[i].OrderPlacedDate}`);
          data[i].Date = format.toLocaleDateString();
        }

        res.render("user/myOrder", { data });
      } else if (req.query.from === "wishlist") {
        const UserID = req.session.customerId;
        const data = await wishlistModel.aggregate([
          { $match: { UserID: new ObjectId(UserID) } },
          {
            $lookup: {
              from: "products",
              localField: "ProductID",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: "$product" },
        ]);

        res.render("user/wishLIst", { data });
      } else if (req.query.from === "wallet") {
        const walletData = await walletModel.findOne({
          UserID: req.session.customerId,
        });

        for (let i = 0; i < walletData.transaction.length; i++) {
          walletData.transaction[i].formatedDate = dateFunction.Invoice(
            walletData.transaction[i].date
          );
        }

        res.render("user/Wallet", { walletData });
      }
    } catch (error) {
      console.log(error);
    }
  },
  getLogin: (req, res) => {
    let message;
    if(req.session.successOfReset){
      message=req.session.successOfReset
      delete req.session.successOfReset
    }
    res.render("./user/login",{message});
  },
  postLogin: async (req, res, next) => {
    try {
      const userData = await user.findOne({ Email: req.body.email });
      globalEmail = userData;
      if (userData) {
        if (userData.status) {
          const dashashed = await bcrypt.compare(
            req.body.password,
            userData.password
          );
          if (dashashed) {
            req.session.user = `Happy Shopping ${userData.first_name} ${userData.second_name}`;
            req.session.customerId = userData._id;
            req.session.isUserAuthenticated = true;
            res.redirect("/user");
          } else {
            res.render("user/login", { error: "password is not match" });
          }
        } else {
          req.session.user = "User Blocked";
          res.redirect("/user");
        }
      } else {
        res.render("user/login", { error: "user not found" });
      }
    } catch (err) {
      console.log(err);
      // const error=new Error('internal server error')
      // error.statusCode=500
      // next(error)
    }
  },
  getForgot: (req, res) => {
    delete req.session.user,
      delete req.session.customerId,
      delete req.session.isUserAuthenticated;

    res.render("user/forgot/forgotEmail");
  },
  postOtpEnter: async (req, res) => {
    try {
      const email = await user.findOne({ Email: req.body.email });
      globalEmail = email;
      if (!email) {
        res.render("user/forgot/forgotEmail", { error: "user not found" });
      } else {
        res.redirect("/log-in/OTP")
      }
    } catch (error1) {
      const error = new Error("internal server error");
      error.statusCode = 500;
      next(error);
    }
  },
  getOTP: async (req, res, next) => {
    try {
      const email = req.body.email;
      globalEmail = email;
      const ifUser=await forgotEmail.findOne({email:email})
      let EmailOfUser;
      if(ifUser){
          EmailOfUser=ifUser.email
          req.session.emialId=ifUser._id
      }else{
       EmailOfUser= await forgotEmail.create({email}
       )
        req.session.emialId = EmailOfUser._id;
      }
      
     
      ;
    
     
      
      const isUser = await user.findOne({ Email: email });
      if (isUser) {
        const otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        const userData = { email, otp };
        await OTP.create(userData);
        res.render("user/forgot/otpEnter");
      } else {
        res.render("user/forgot/forgotEmail", { error: "Email not found" });
      }
    } catch (error1) {
      console.log(error1)
      const error = new Error(error1);
      error.statusCode = 500;
      next(error);
    }
  },
  resetOTP: async (req, res) => {
    if (req.query.from === "register") {
      try {
        const otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        const userData = { email, otp };
        await otpSchema.create(userData);
        res.render("user/otpEnterForReg");
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        const email = req.session.emialId
        const userData = { email, otp };
        await otpSchema.create(userData);
        res.render("user/forgot/otpEnter");
      } catch (error) {
        console.log(error);
      }
    }
  },
  validateOTP: async (req, res) => {
    if (req.query.from === "Register") {
      try {
        const last_otp = await OTP.aggregate([
          { $sort: { _id: -1 } },
          { $limit: 1 },
        ]);
        if (last_otp[0]?.otp){
          if (last_otp[0].otp === req.body.userOTP) {
            const hashedpassword = await bcrypt.hash(data.password, 10);
            data.password = hashedpassword;
            const userData = await user.insertMany([data]);

            const walletData = {
              UserID: userData[0]._id,
              Amount: 0,
            };
            await walletModel.create(walletData);

            res.render("user/login", { error: "Account created successfull" });
          } else {
            res.render("user/otpEnterForReg", { error: "Invalid OTP" });
          }
        }else{
          res.render("user/otpEnterForReg", { error: "Invalid Expired" });
        }
          
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        
        const last_otp = await OTP.findOne({ otp: req.body.userOTP })
          .sort({ _id: -1 })
          .limit(1);
        if (last_otp) {
          res.render("user/forgot/resetPassword");
        } else {
          res.render("user/forgot/otpEnter", { message: "invalid otp or OTP Expired" });
        }
      } catch (error) {
        console.log(error);
      }
    }
  },
  endOfPassReset: async (req, res) => {
    try {
      
      const emailObj = await forgotEmail.findById(req.session.emialId);
      
     
      const email=emailObj.email
      
      const newPassword = req.body.password;

      const saltRounds = 10;
      const hashedpassword = await bcrypt.hash(newPassword, saltRounds);
      await user.updateOne(
        { Email: email },
        { $set: { password: hashedpassword } }
      );
      req.session.successOfReset='Password resetted successfully'
      res.redirect("/user/log-in");
    } catch (error) {
      console.log(error)
      await forgotEmail.deleteMany({_id:req.session.emialId})
      delete req.session.emialId
    
      console.log("error in the password updation");
    }
  },
  getSignUp: (req, res) => {
    res.render("./user/registration");
  },
  postSignup: async (req, res) => {
    try {
      data = {
        first_name: capitalisation(req.body.First_name),
        second_name: capitalisation(req.body.Last_name),
        Email: req.body.Email,
        phone_Number: req.body.phone,
        password: req.body.password,
      };
      email = req.body.Email;
      const check = await user.findOne({ Email: req.body.Email });

      if (check) {
        res.render("user/registration", { error: "Email already exists" });
      } else {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        console.log(email, otp);
        const userData = { email, otp };

        await otpSchema.create(userData);
        res.render("user/otpEnterForReg");
      }
    } catch (error) {
      console.log(error);
    }
  },

  //////////////category////////////
  getAll: async (req, res) => {
    try {
      if (req.query.search) {
        const searchWord = new RegExp("^" + req.query.search, "i").sort({_id:-1});

        const Data = await productModel
          .find({ Name: { $regex: searchWord } })
          .limit(6);

        const CategoryCollection = await categoryModel.findOne();

        let User = req.session.isUserAuthenticated;
        res.render("admin/shop", { Data, CategoryCollection, User });
      } else if (req.query.from === "sortBySixe") {
        const minValue = parseInt(req.query.minValue);
        const maxValue = parseInt(req.query.maxValue);
        if (minValue < maxValue) {
          const Data = await productModel.find({
            $and: [{ price: { $lt: maxValue } }, { price: { $gt: minValue } }],
          });

          const CategoryCollection = await categoryModel.findOne();
          let User = req.session.isUserAuthenticated;
          res.render("admin/shop", { Data, CategoryCollection, User });
        } else {
          res.redirect("/user/all");
        }
      } else if (req.query.instruction === "lowToHigh") {
        const Data = await productModel.find().sort({ price: 1 });

        const CategoryCollection = await categoryModel.findOne();

        let User = req.session.isUserAuthenticated;
        res.render("admin/shop", { Data, CategoryCollection, User });
      } else if (req.query.instruction === "HighToLow") {
        const Data = await productModel.find().sort({ price: -1 });

        const CategoryCollection = await categoryModel.findOne();

        let User = req.session.isUserAuthenticated;
        res.render("admin/shop", { Data, CategoryCollection, User });
      } else if (req.query.from === "sortBrand") {
        const array = JSON.parse(decodeURIComponent(req.query.brand));

        const Data = await productModel.find({ brand: { $in: array } });

        const CategoryCollection = await categoryModel.findOne();
        let User = req.session.isUserAuthenticated;
        res.render("admin/shop", { Data, CategoryCollection, User });
      } else if (req.query.from === "sorting") {
        const CategoryCollection = await categoryModel.findOne();
        const maxValue = req.query.maxValue;
        const minValue = req.query.minValue;
        const sorting = parseInt(req.query.sort);
        let brand = JSON.parse(req.query.brand);

        if (brand.length === 0) {
          brand = CategoryCollection.brand;
        }

        const Data = await productModel
          .find({
            $and: [
              { price: { $gt: minValue } },
              { price: { $lt: maxValue } },
              { brand: { $in: brand } },
            ],
          })
          .sort({ price: sorting });

        let User = req.session.isUserAuthenticated;

        res.render("admin/shop", { Data, CategoryCollection, User });
      } else {
        const pageNumber = req.query.page;
        const pagesOf=await productModel.find().count()
        const pages=Math.ceil(pagesOf/6)
        const pagesArray=[]
        for(let i=1;i<=pages;i++){
          pagesArray.push(i)
        }
        const Data = await productModel
          .find()
          .skip((pageNumber - 1) * 6)
          .limit(6);
        const CategoryCollection = await categoryModel.findOne();

        let User = req.session.isUserAuthenticated;
        res.render("admin/shop", {
          Data,
          CategoryCollection,
          User,
          pagesArray
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
  getWomen: async (req, res) => {
    try {
      const Data = await productModel.find({ category: "women" });
      let User = req.session.isUserAuthenticated;

      res.render("admin/shop", { Data, User });
    } catch (error) {}
  },

  getMan: async (req, res) => {
    try {
      const Data = await productModel.find({ category: "men" });
      let User = req.session.isUserAuthenticated;
      res.render("admin/shop", { Data, User });
    } catch (error) {}
  },
  cat: async (req, res) => {
    try {
      if (req.query.from === "sorting") {
        const CategoryCollection = await categoryModel.findOne();
        const sortVarialble = req.query.cat;
        const maxValue = req.query.maxValue;
        const minValue = req.query.minValue;
        const sorting = parseInt(req.query.sort);
        let brand = JSON.parse(req.query.brand);

        if (brand.length === 0) {
          brand = CategoryCollection.brand;
        }

        const Data = await productModel
          .find({
            $and: [
              { category: sortVarialble },
              { price: { $gt: minValue } },
              { price: { $lt: maxValue } },
              { brand: { $in: brand } },
            ],
          })
          .sort({ price: sorting });

        let User = req.session.isUserAuthenticated;

        res.render("admin/shop", {
          Data,
          CategoryCollection,
          User,
          sortVarialble,
        });
      } else {
        const CategoryCollection = await categoryModel.findOne();

        if (req.query.cat) {
          let User = req.session.isUserAuthenticated;
          const sortVarialble = req.query.cat;
          const page = req.query.page;
          const Data = await productModel
            .find({ category: sortVarialble })
            .skip((page - 1) * 3)
            .limit(3);

          res.render("admin/shop", {
            Data,
            CategoryCollection,
            User,
            sortVarialble,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
  getProductDatails: async (req, res) => {
    try {
      const d = req.params.id;

      let User = req.session.isUserAuthenticated;
      const Data = await productModel.findById({ _id: d });
      const relatedData = await productModel
        .find({ category: Data.category })
        .limit(3);

      res.render("admin/productDatails", { Data, relatedData, User });
    } catch (error) {}
  },
  sighOut: (req, res) => {
    app.use((req, res, next) => {
      const error = new Error("oops..invalid route");
      error.statusCode = 404;
      next(error);
    });
  },

  //user Profile

  getUserProfile: async (req, res) => {
    try {
      const userId = req.session.customerId;
      const userData = await user.findById({ _id: userId });
      const updatedMessage = req.session.updatedMessage;
      delete req.session.updatedMessage;
      const dltMessaged = req.session.wrongPasswordMessage;
      delete req.session.wrongPasswordMessage;
      const passwordUpdMessage = req.session.passwordUpdMessage;
      delete req.session.passwordUpdMessage;
      res.render(`user/userProfile`, {
        userData,
        updatedMessage,
        dltMessaged,
        passwordUpdMessage,
      });
    } catch (error) {
      console.log("error occured in the getUserProfile" + " " + error);
    }
  },
  logOut: (req, res) => {
    delete req.session.user,
      delete req.session.customerId,
      delete req.session.isUserAuthenticated;

    res.redirect("/user");
  },
  updateUserProfile: async (req, res) => {
    if (req.query.from === "profileInfo") {
      try {
        const userData = await user.findById({ _id: req.session.customerId });

        const profileData = {
          first_name: req.body.first_name || userData.first_name,
          second_name: req.body.second_name || userData.second_name,
          Email: req.body.email || userData.Email,
          phone_Number: req.body.phone_number || userData.phone_number,
        };
        Object.assign(userData, profileData);
        await user.findByIdAndUpdate({ _id: userData._id }, { $set: userData });
        req.session.updatedMessage = "Profile Information Updated Successfully";
        res.redirect(`/user/getUserProfile`);
      } catch (error) {
        console.log(error);
      }
    } else if (req.query.from === "passwordChange") {
      try {
        const userData = await user.findById({ _id: req.session.customerId });
        const dehashed = bcrypt.compareSync(
          req.body.oldPassword,
          userData.password
        );
        if (dehashed) {
          const password = req.body.newPassword;
          const hashedPassword = bcrypt.hashSync(password, 10);
          await user.findByIdAndUpdate(
            { _id: req.session.customerId },
            { $set: { password: hashedPassword } }
          );
          const userId = req.session.customerId;
          req.session.passwordUpdMessage = "Password Updated Successfull";
          res.redirect(`/user/getUserProfile`);
        } else {
          req.session.wrongPasswordMessage = "Old Password  Not Match";
          res.redirect(`/user/getUserProfile`);
        }
      } catch (error) {}
    }
  },
  getManageAddress: async (req, res) => {
    try {
      if (req.query.from === "getManage") {
        const userData = await user.findById({ _id: req.session.customerId });
        const idd = req.session.customerId;
        const getAddresss = await user.aggregate([
          { $match: { _id: new ObjectId(idd) } },
          {
            $lookup: {
              from: "addresses",
              localField: "_id",
              foreignField: "UserId",
              as: "address",
            },
          },
        ]);
        const getAddress = getAddresss[0];
        const addressAdded = req.session.addressAdded;
        delete req.session.addressAdded;
        const setAddress = req.session.setAddress;
        delete req.session.setAddress;
        const editedInfo = req.session.editedInfo;
        delete req.session.editedInfo;
        const deleteAddress = req.session.deleteAddress;
        delete req.session.deleteAddress;
        res.render("user/manageAddress", {
          userData,
          addressAdded,
          getAddress,
          setAddress,
          editedInfo,
          deleteAddress,
        });
      } else if (req.query.from === "addAddress") {
        const userId = req.session.customerId;
        res.render("user/addAddress", { userId });
      } else if (req.query.from === "editAddress") {
        const addressData = await addressModel.findById({
          _id: req.query.Id,
        });
        const userID = req.session.customerId;
        res.render("user/editAddress", { addressData, userID });
      } else if (req.query.from === "adressEditModalin") {
        const address = await addressModel.findById(req.query.id);

        res.json(address);
      }
    } catch (error) {
      console.log(error);
    }
  },
  postAddress: async (req, res) => {
    try {
      await addressModel.updateMany(
        { UserId: req.session.customerId },
        { $set: { status: false } }
      );

      if (req.body.hasOwnProperty("addressDataCheckout")) {
        const addressData = {
          UserId: req.session.customerId,
          Name: req.body.addressDataCheckout.name,
          Mobile: req.body.addressDataCheckout.mobile,
          Aleternative_mobile: req.body.addressDataCheckout.Aleternative_mobile,
          Pin: req.body.addressDataCheckout.pin,
          Town: req.body.addressDataCheckout.town,
          Email: req.body.addressDataCheckout.email,
          Locality: req.body.addressDataCheckout.lacality,
          Land_mark: req.body.addressDataCheckout.landMark,
          Address: req.body.addressDataCheckout.address,
        };
        await addressModel.create(addressData);
        return res.json("recieved");
      }
      const addressData = {
        UserId: req.session.customerId,
        Name: req.body.Name,
        Mobile: req.body.Mobile,
        Aleternative_mobile: req.body.Aleternative_mobile,
        Pin: req.body.pin,
        Town: req.body.Town,
        Email: req.body.Email,
        Locality: req.body.Locality,
        Land_mark: req.body.Land_mark,
        Address: req.body.Address,
      };
      await addressModel
        .create(addressData)
        .then((result) => {
          req.session.addressAdded = "Address Added Successfully";
        })
        .catch((error) => {
          console.log(error);
        });

      res.redirect(`/user/getManageAddress?from=getManage`);
    } catch (error) {
      console.log(error);
    }
  },
  patchAddress: async (req, res) => {
    try {
      if (req.body.from === "selectBotton") {
        const userId = req.session.customerId;

        await addressModel.updateMany(
          { UserId: req.session.customerId },
          { $set: { status: false } }
        );
        await addressModel
          .updateOne({ _id: req.body.id }, { status: true })

          .then((result) => {
            res.send("success");
          });
      }
    } catch (error) {}
  },
  putAddress: async (req, res) => {
    try {
      if (req.query.from === "editAddress") {
        const addressData = await addressModel.findById({ _id: req.body.id });
        const data = {
          Name: req.body.Name || addressData.Name,
          Mobile: req.body.Mobile || addressData.Mobile,
          Pin: req.body.pin || addressData.Pin,
          Aleternative_mobile:
            req.body.Aleternative_mobile || addressData.Aleternative_mobile,
          Town: req.body.Town || addressData.Town,
          Email: req.body.Email || addressData.Email,
          Locality: req.body.Locality || addressData.Locality,
          Land_mark: req.body.Land_mark || addressData.Land_mark,
          Address: req.body.Address || addressData.Address,
        };
        await addressModel.findByIdAndUpdate(
          { _id: req.body.id },
          { $set: data }
        );
        const idd = req.session.customerId;
        req.session.editedInfo = "Edited Successfully";
        res.redirect(`/user/getManageAddress?from=getManage`);
      } else if (req.body.from === "checkOutModalin") {
        const id = req.body.id;
        delete req.body.id, req.body.from;

        await addressModel
          .findByIdAndUpdate(id, req.body)
          .then((result) => {
            res.json("ok");
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } catch (error) {
      console.log(error);
    }
  },
  deleteAddress: async (req, res) => {
    try {
      await addressModel.deleteOne({ _id: req.body.id });
      req.session.deleteAddress = "Deleted Successfully";
      await addressModel
        .updateOne(
          { UserId: req.session.customerId },
          { $set: { status: true } }
        )
        .then((result) => {})
        .catch((error) => {
          console.log(error);
        });
      res.send("recieved");
    } catch (error) {}
  },

  /////cart//////
  cart: async (req, res) => {
    try {
      if ((req.body.from = "add to cart")) {
        const addToCart = {
          ProductId: req.body.id,
          UserId: req.session.customerId,
          OrderQuantity: req.body.count,
          OrderPrice: req.body.price,
          Size: req.body.size,
          Color: req.body.color,
          Total: req.body.total,
          payment_id: "paymentId",
          payment_Order_id: "orderID",
        };

        await cartModel
          .create(addToCart)
          .then((res) => {})
          .catch((error) => {
            res.json(done);
          });

        res.send("reaceived");
      }
    } catch (error) {
      console.log(error);
    }
  },
  getQuantity: async (req, res) => {
    try {
      const item = await productModel.findById({ _id: req.query.id });
      const path = `sizes.${req.query.size}.${req.query.color}`;
      const quantity = lodash.get(item, path);

      res.json(quantity);
    } catch (error) {
      console.log(error);
    }
  },
  patchCart: async (req, res) => {
    try {
      if (req.body.from === "updateDiscount") {
        if (req.body.discoutCode === "##11") {
          let discount = 200;
          await user
            .findByIdAndUpdate(
              { _id: req.session.customerId },
              { $inc: { Discount: discount } }
            )
            .then(() => {
              req.session.codeApplied = `Promo Code worth ₹${discount} Added To Discount`;
              res.redirect("/user/getpages?from=cart");
            })
            .catch((error) => {
              console.log(error);
              res.json("inter server Error");
            });
        } else {
          res.json("invalid code");
        }
      } else if ((req.body.from = "updteCartQty")) {
        req.session.dom = req.body.curID;

        await cartModel
          .findByIdAndUpdate(req.body.curID, {
            $set: { OrderQuantity: req.body.newVal, Total: req.body.newTotal },
          })
          .then(() => {
            res.status(200).json({ message: "updated Successfull" });
          });
      } else {
        const data = req.body;
        for (const id in data) {
          updateDocumentById(id, Number(data[id]));
        }
        async function updateDocumentById(id, newSize) {
          let price = await cartModel.findById(
            { _id: id },
            { _id: 0, OrderPrice: 1 }
          );
          let total = price.OrderPrice * newSize;
          await cartModel
            .findByIdAndUpdate(
              { _id: id },
              { $set: { OrderQuantity: newSize, Total: total } }
            )
            .then((result) => {})
            .catch((error) => {
              console.log(error);
            });
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
  dltFromCart: async (req, res) => {
    try {
      await cartModel.deleteOne({ _id: req.body.id });
      req.session.deleteInfo = "Removed Successfully";
      res.json('ok')
    } catch (error) {
      res.json('error')
      console.log(error);
    }
  },
  ////check out///
  removeProduct: async (req, res) => {
    try {
      await cartModel
        .findByIdAndUpdate({ _id: req.body.id }, { $set: { status: false } })
        .then(() => {
          req.session.removeFromCheckout = "Removed Successfully";
          res.json("ok");
        });
    } catch (error) {
      console.log(error);
    }
  },
  placeOrder: async (req, res) => {
    try {
      const orderCount = req.body.orderDetails.Order.length;
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
        numberOfOrders: orderCount,
      };
      if (req.body.orderDetails.CoupenID != undefined) {
        const coupenData = {
          UserID: req.session.customerId,
          CoupenID: req.body.orderDetails.CoupenID,
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
        req.body.orderDetails.paymentOption === "Wallet+Online" ||
        req.body.orderDetails.paymentOption === "Wallet"
      ) {
        const amount = req.body.orderDetails.Order[0].wallet;

        await walletModel.updateOne(
          { UserID: req.session.customerId },
          { $inc: { Amount: -amount } }
        );
        const result = await walletModel.updateOne(
          { UserID: req.session.customerId },
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
      for (let i = 0; i < req.body.orderDetails.CartIDs.length; i++) {
        await cartModel.deleteOne({ _id: req.body.orderDetails.CartIDs[i] });
      }
      for (let i = 0; i < req.body.orderDetails.productID.length; i++) {
        path = `sizes.${req.body.orderDetails.sizes[i]}.${req.body.orderDetails.colors[i]}`;
        quantity = req.body.orderDetails.Order[i].quantity;
        await productModel
          .findByIdAndUpdate(
            { _id: req.body.orderDetails.productID[i] },
            { $inc: { [path]: -quantity } }
          )
          .then((result) => {})
          .catch((error) => {
            console.log(error);
          });
      }
      return res.json("hiiiiiiiiiiiiiiiii");
    } catch (error) {
      console.log(error);
    }
  },
  orderFailed: async (req, res) => {
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
      console.log(error);
    }
  },
  retryOrderPlacement: async (req, res) => {
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
        const result = await productModel.findByIdAndUpdate(IDs[i], {
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
      console.log(error);
    }
    res.json("success");
  },
  //////order Cancelation//////
  cancelOreder: async (req, res) => {
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
      } catch (error) {}
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
        console.log(error);
      }
    }
  },

  ///payment gateway///

  paymentGateway: async (req, res) => {
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
      console.log(error);
    }
  },
  retryPaymentGateway: async (req, res) => {
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
      console.log(error);
    }
  },

  getUserData: async (req, res) => {
    try {
      const userData = await user.findById(req.session.customerId);

      res.status(200).json(userData);
    } catch (error) {
      console.log(error);
    }
  },
  addIDs: async (req, res) => {
    if (req.body.hasOwnProperty("retryPayment")) {
    }

    await cartModel.findByIdAndUpdate(req.session.customerId, {
      $set: {
        payment_Order_id: req.body.order_id,
        payment_id: req.body.payment_id,
      },
    });
    res.status(200);
  },
  createWishlist: async (req, res) => {
    try {
      const wishData = {
        UserID: req.session.customerId,
        ProductID: req.body.id,
        color: req.body.color,
        size: req.body.size,
        quantity: 1,
        price: req.body.price,
        total: req.body.price,
      };
      const response = await wishlistModel.create(wishData);
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
    }
  },
  removeFromWishList: async (req, res) => {
    try {
      const response = await wishlistModel.deleteOne({ _id: req.body.id });
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
    }
  },
  addToCart: async (req, res) => {
    const wishlistData = await wishlistModel.find({
      UserID: req.session.customerId,
    });
    
    if(wishlistData.length>0){
        for (let i = 0; i < wishlistData.length; i++) {
          cartData = {
            ProductId: wishlistData[i].ProductID,
            UserId: req.session.customerId,
            OrderQuantity: wishlistData[i].quantity,
            OrderPrice: wishlistData[i].price,
            Size: wishlistData[i].size,
            Color: wishlistData[i].color,
            Total: wishlistData[i].total,
          };
          await cartModel.create(cartData);

          await wishlistModel.deleteOne({ _id: wishlistData[i]._id });
          req.session.addedMessage = "Items added from wishlist to cart";
        }
        return res.json("success");
    }else{
      res.json('no data')
    }
    
  },
  fetchData: async (req, res) => {
    try {
      if (req.query.from === "retryPayment") {
        const jcolor = decodeURIComponent(req.query.color);
        const jsize = decodeURIComponent(req.query.size);
        const jIDs = decodeURIComponent(req.query.IDs);

        const colors = jcolor.split(",");
        const sizes = jsize.split(",");
        const IDs = jIDs.split(",");

        const qty = [];
        for (let i = 0; i < IDs.length; i++) {
          const temQty = await productModel.findById(IDs[i]);

          qty.push(temQty);
        }
        let sizesArray = [];
        const a = qty[0].sizes.small.white;

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
      } else {
        const WalletAmount = await walletModel.findOne({
          UserID: req.session.customerId,
        });
        const amount = WalletAmount.Amount;

        res.json(amount);
      }
    } catch (error) {
      console.log(error);
    }
  },
  paymentNotification: async (req, res) => {
    try {
      const notification = req.body;
    } catch (error) {
      console.log(error);
    }
  },
};

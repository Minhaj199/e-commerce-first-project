const user = require("../../Model/user");
const bcrypt = require("bcrypt");
const productModel = require("../../Model/product");
const categoryModel = require("../../Model/catagory");
const addressModel = require("../../Model/address");
const { ObjectId } = require("mongodb");
const lodash = require("lodash");
const cartModel = require("../../Model/cart");
const orderModel = require("../../Model/orders");
const wishlistModel = require("../../Model/wishList");
const walletModel = require("../../Model/wallets");
const dateFunction = require("../../utils/DateFormating");



module.exports = {
  getLanding: async (req, res, next) => {
    /////get landing page//////
    try {
      let User = req.session.user;

      let user = req.session.customerId;
      const Data = await productModel.find().limit(9).sort({ _id: -1 });
      const categoryCollecion = await categoryModel.findOne();
      res.render("index", { User, Data, categoryCollecion, user });
    } catch (error) {
      next(error);
    }
  },
  renderPages: async (req, res, next) => {
    /////////////render pages based on query//////////
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

        res.render("user/wishList", { data });
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
      next(error)
    }
  },
  //////////////category////////////

  getAll: async (req, res, next) => {
    try {
      if (req.query.search) {
        const searchWord = new RegExp("^" + req.query.search, "i")

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
        const pagesOf = await productModel.find().count()
        const pages = Math.ceil(pagesOf / 6)
        const pagesArray = []
        for (let i = 1; i <= pages; i++) {
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
      next(error)
    }
  },
  getWomen: async (req, res, next) => {
    try {
      const Data = await productModel.find({ category: "women" });
      let User = req.session.isUserAuthenticated;

      res.render("admin/shop", { Data, User });
    } catch (error) {
      next(error)
    }
  },

  getMan: async (req, res, next) => {
    try {
      const Data = await productModel.find({ category: "men" });
      let User = req.session.isUserAuthenticated;
      res.render("admin/shop", { Data, User });
    } catch (error) {
      next(error)
    }
  },
  cat: async (req, res, next) => {
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
      next(error)
    }
  },
  getProductDatails: async (req, res, next) => {
    try {
      const d = req.params.id;
      let User = req.session.isUserAuthenticated;
      const Data = await productModel.findById({ _id: d });
      const relatedData = await productModel
        .find({ category: Data.category })
        .limit(3);

      res.render("admin/productDatails", { Data, relatedData, User });
    } catch (error) {
      next(error)
    }
  },


  //user Profile

  getUserProfile: async (req, res, next) => {
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
      next(error)
    }
  },
  logOut: (req, res) => {
    delete req.session.user,
      delete req.session.customerId,
      delete req.session.isUserAuthenticated;

    res.redirect("/user");
  },
  updateUserProfile: async (req, res, next) => {
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
        next(error)
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

          req.session.passwordUpdMessage = "Password Updated Successfull";
          res.redirect(`/user/getUserProfile`);
        } else {
          req.session.wrongPasswordMessage = "Old Password  Not Match";
          res.redirect(`/user/getUserProfile`);
        }
      } catch (error) {
        next(error)
      }
    }
  },
  /////cart//////
  cart: async (req, res, next) => {
    try {
      if ((req.body.from === "add to cart")) {
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
          .then((res) => { })
          .catch((error) => {
            res.json('done');
          });

        res.send("reaceived");
      }
    } catch (error) {
      next(error)
    }
  },
  getQuantity: async (req, res, next) => {
    try {
      const item = await productModel.findById({ _id: req.query.id });
      const path = `sizes.${req.query.size}.${req.query.color}`;
      const quantity = lodash.get(item, path);

      res.json(quantity);
    } catch (error) {
      next(error)
    }
  },
  patchCart: async (req, res, next) => {
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
      } else if (req.body.from === "updteCartQty") {
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
            .then((result) => { })
            .catch((error) => {
              console.log(error);
            });
        }
      }
    } catch (error) {
      next(error)
    }
  },
  dltFromCart: async (req, res) => {
    try {
      await cartModel.deleteOne({ _id: req.body.id });
      req.session.deleteInfo = "Removed Successfully";
      res.json('ok')
    } catch (error) {
      res.json('error')

    }
  },

  addIDs: async (req, res, next) => {
    ////////////add order id to cart collection for payment//////////
    try {
      // if (req.body.hasOwnProperty("retryPayment")) {
      // }

      await cartModel.findByIdAndUpdate(req.session.customerId, {
        $set: {
          payment_Order_id: req.body.order_id,
          payment_id: req.body.payment_id,
        },
      });
      res.status(200);
    } catch (error) {
      next(error)
    }

  },
  addToWishlist: async (req, res, next) => {
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
      next(error)
    }
  },
  removeFromWishList: async (req, res, next) => {
    try {
      const response = await wishlistModel.deleteOne({ _id: req.body.id });
      res.status(200).json(response);
    } catch (error) {
      next(error)
    }
  },
  addToCart: async (req, res, next) => {
    try {
      const wishlistData = await wishlistModel.find({
        UserID: req.session.customerId,
      });

      if (wishlistData.length > 0) {
        for (let i = 0; i < wishlistData.length; i++) {
          const cartData = {
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
      } else {
        res.json('no data')
      }

    } catch (error) {
      next(error)
    }

  },

};

const user=require('../../model/user')
const cartModel=require('../../model/cart')
const productItemModel=require('../../model/prouctItems')
const coupenTracking=require('../../model/coupenTracking')
const coupen=require('../../model/coupen')
const AddressModel = require('../../model/address')
const orderModel=require('../../model/orders')
const wishlistModel=require('../../model/wishList')
const walletModel=require('../../model/wallets')
const dateFunction=require('../../utils/dateFormating')
const { Types } = require('mongoose')
module.exports = {
  renderPages: async (req, res, next) => {
    /////////////render pages based on query//////////
    try {
      if (req.query.from === "cart") {

        const addedMessage = req.session.addedMessage;
        delete req.session.addedMessage;
        const UserId = req.session.customerId;
        const User = await user.findById(UserId);
        await cartModel.updateMany({}, { $set: { status: true } });
        const getCart = await cartModel.aggregate([
          { $match: { UserId: new Types.ObjectId(UserId) } },
          {
            $lookup: {
              from: "product_items",
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
        let total = getCart.reduce((acc, curr) => {
          acc += curr.Total
          return acc
        }, 0)

        for (let i = 0; i < proId.length; i++) {
          const product = await productItemModel.findById({ _id: proId[i] });
          const variant = product.variants.find(v => v.size === sizes[i] && v.color === colors[i])
          getCart[i].currentQuantity = variant ? variant.stock : 0
        }
        res.render("user/cart", {
          addedMessage,
          getCart,
          User,
          total,
          codeApplied,
          deleteInfo,
        });
      } else if (req.query.from === "afterAddedToCart") {
        req.session.addedMessage = "Product Added To Cart";
        res.redirect("/user/getPages?from=cart");
      } else if (req.query.from === "cartToCheckOut") {
        try {
          const userID = req.session.customerId;
          const checkCart = await cartModel.aggregate([
            { $match: { UserId: new Types.ObjectId(userID) } },
          ]);
          let totalValue = checkCart?.reduce((acc, curr) => {
            acc += curr.Total
            return acc
          }, 0)
          let proId = checkCart.map((item) => item.ProductId);
          let colors = checkCart.map((item) => item.Color);
          let sizes = checkCart.map((item) => item.Size);
          let OrderQuantity = checkCart.map((item) => item.OrderQuantity);
          const usedCouponsDraft = await coupenTracking.find({ UserID: userID }, { CoupenID: 1, _id: 0 })
          const usercopuneIds = usedCouponsDraft?.map(el => el.CoupenID)
          const coupens = await coupen.aggregate([{ $match: { $and: [{ startingDate: { $lte: new Date() } }, { expiry: { $gte: new Date() } }, { orderValue: { $lte: totalValue } }, { _id: { $nin: usercopuneIds } }] } }])

          for (let i = 0; i < proId.length; i++) {

            const product = await productItemModel.findById(proId[i]);

            if (!product) {
              return res.status(400).json({ message: 'product not found' })
            }

            const currentVarinet = product.variants.find(v => v.size === sizes[i] && v.color === colors[i]);

            if (!currentVarinet) {

              return res.status(400).json({ message: 'variant not found' })
            }
            const qty = currentVarinet.stock || 0
            if (OrderQuantity[i] > qty) {
              req.session.addedMessage =
                qty === 0
                  ? product.Name + " is out of stock"
                  : product.Name +
                  " is only " +
                  qty +
                  " stock.Please reduce the stock";
              return res.redirect("/user/getPages?from=cart");
            }
          }
          const UserId = userID;
          const removeFromCheckout = req.session.removeFromCheckout;
          const addressData = await AddressModel.find({
            UserId: req.session.customerId,
          });
          delete req.session.removeFromCheckout;
          const discount = await user.findById(
            { _id: UserId },
            { _id: 0, Discount: 1 }
          );
          const getCart = await cartModel.aggregate([
            { $match: { status: true } },
            { $match: { UserId: new Types.ObjectId(UserId) } },
            {
              $lookup: {
                from: "product_items",
                localField: "ProductId",
                foreignField: "_id",
                as: "Products",
              },
            },
            { $unwind: "$Products" },
          ]);
          const address = await AddressModel.findOne({
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
            coupens
          });
        } catch (error) {
          console.log(error);
        }
      } else if (req.query.from === "afterPlacedOrder") {
        const OrderID = req.session.OrderID;
        delete req.session.OrderID;

        const orderData = await orderModel.aggregate([
          { $match: { _id: new Types.ObjectId(OrderID) } },
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
          { $match: { _id: new Types.ObjectId(OrderID) } },
          { $unwind: "$Order" },
          {
            $lookup: {
              from: "product_items",
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
          { $match: { _id: new Types.ObjectId(OrderID) } },
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
          { $match: { _id: new Types.ObjectId(OrderID) } },
          { $unwind: "$Order" },
          {
            $lookup: {
              from: "product_items",
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
          { $match: { _id: new Types.ObjectId(OrderID) } },
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
          { $match: { _id: new Types.ObjectId(OrderID) } },
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
        res.render("user/orderProductDetails", { ProductData, orderData });
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
          { $match: { UserID: new Types.ObjectId(UserID) } },
          {
            $lookup: {
              from: "product_items",
              localField: "ProductID",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: "$product" },
        ]);
        res.render("user/wishList", { data, total: data?.length || 0 });
      } else if (req.query.from === "wallet") {
        let walletData = await walletModel.findOne({
          UserID: req.session.customerId,
        });
        if (!walletData) {
          const wallet = await walletModel.create({ UserID: req.session.customerId })
          walletData = [wallet]

        }
        for (let i = 0; i < (walletData?.transaction?.length || 0); i++) {
          walletData.transaction[i].formatedDate = dateFunction.Invoice(
            walletData.transaction[i].date
          );
        }

        res.render("user/wallet", { walletData });
      }
    } catch (error) {
      next(error)
    }
  },
}
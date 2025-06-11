const productItemModel = require("../../model/prouctItems")
const cartModel=require('../../model/cart')
const user=require('../../model/user')

module.exports = {
  cart: async (req, res, next) => {

    const {
      id,
      count,
      size,
      price,
      color,
      from,
      total,
      name
    } = req.body

    const { customerId } = req.session
    if (!id || !count || !size || !price || !color || !from || !total || !customerId || !name) {
      return res.status(400).json({ message: 'in sufficient data' })
    }
    const isDuplicate = await cartModel.findOne({ name, Size: size, Color: color })
    if (isDuplicate) {
      res.status(400).json({ message: 'already exist' })
      return
    }
    try {
      if (from === "add to cart") {
        const addToCart = {
          ProductId: id,
          UserId: customerId,
          OrderQuantity: count,
          OrderPrice: price,
          Size: size,
          Color: color,
          Total: total,
          name,
          payment_id: "paymentId",
          payment_Order_id: "orderID",
        };
        const result = await cartModel.create(addToCart)
        if (result) {

          return res.json(true)
        } else {

          res.json('done');

        }

      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getQuantity: async (req, res, next) => {
    try {
      const { id, size, color } = (req.query)
      if (!id || !size || !color) {
        return
      }
      const item = await productItemModel.findById({ _id: req.query.id }, { _id: 0, variants: 1 });
      if (!item) {
        res.json({ data: 0 })
        return
      }
      const currentVarinet = item.variants.find(v => v.size === size && v.color === color)
      return res.json({ stock: currentVarinet ? currentVarinet.stock : 0 })
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
            .then(() => { })
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
      console.log(error)
      res.json('error')

    }
  },
}
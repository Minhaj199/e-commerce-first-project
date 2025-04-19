const dotenv = require("dotenv");
dotenv.config({ path: "./configaration" });
const categoryModel = require("../../Model/catagory");
const orderModel = require("../../Model/orders");
const coupenModel = require("../../Model/coupen");
const coupenTrackingModel = require("../../Model/coupenTracking");
const offerModel = require("../../Model/offer");
const productItemModel = require("../../Model/prouctItems");


module.exports = {

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
  fetchData: async (req, res, next) => {
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
        const data = await productItemModel.find({
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

        const categorylist = await categoryModel.find();
      
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
      next(error)
    }
  },
};

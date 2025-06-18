const user = require("../../model/user");
const bcrypt = require("bcrypt");
const categoryModel = require("../../model/catagory");
const cartModel = require("../../model/cart");
const wishlistModel = require("../../model/wishList");
const productItemModel = require("../../model/prouctItems");
const coupen = require("../../model/coupen");
const coupenTracking = require("../../model/coupenTracking");



module.exports = {
  getLanding: async (req, res, next) => {
    /////get landing page//////
    try {
      let User = req.session.user;

      let user = req.session.customerId;
      const Data = await productItemModel.find({ deleteStatus: false }).limit(9).sort({ _id: -1 });
      const categoryCollecion = await categoryModel.findOne();
      res.render("index", { User, Data, categoryCollecion, user });
    } catch (error) {
      next(error);
    }
  },

  //////////////category////////////

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

        const Data = await productItemModel
          .find({
            $and: [
              { category: sortVarialble },
              { price: { $gt: minValue } },
              { price: { $lt: maxValue } },
              { brand: { $in: brand } },
              { deleteStatus: false }
            ],
          })
          .sort({ price: sorting });

        let User = req.session.isUserAuthenticated;

        res.render("user/productListing", {
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
          const Data = await productItemModel
            .find({ category: sortVarialble, deleteStatus: false })
            .skip((page - 1) * 3)
            .limit(3);

          res.render("user/productListing", {
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
      const id = req.params.id;
      let User = req.session.isUserAuthenticated;
      const Data = await productItemModel.findById(id);
      if (Data) {
        const size = Data?.variants.map(el => el.size)
        const uniqueSize = Array.from(new Set(size))

        const color = Data?.variants.map(el => el.color)
        const uniqueColor = Array.from(new Set(color))

        const relatedData = await productItemModel
          .find({ category: Data.category, deleteStatus: false })
          .limit(3);
        res.render("admin/productDatails", { Data, relatedData, User, uniqueColor, uniqueSize });

      }
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





  addIDs: async (req, res, next) => {
    ////////////add order id to cart collection for payment//////////
    try {


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

    const {
      id,
      color,
      size,
      price,
      name
    } = req.body
    if (!id || !color || !size || !price || !name) {

      return
    }

    try {
      const wishData = {
        UserID: req.session.customerId,
        ProductID: id,
        color,
        size,
        quantity: 1,
        price,
        name,
        total: price,
      };
      const isDuplicate = await wishlistModel.findOne({ name, size, color })
      if (isDuplicate) {
        return res.status(400).json({ message: 'Already exist' })
      }
      const response = await wishlistModel.create(wishData);

      res.status(200).json(response);
    } catch (error) {
      console.log(error)
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
  getCouponData: async (req, res) => {
    try {

      const userID = req.session.customerId
      const usedCouponsDraft = await coupenTracking.find({ UserID: userID }, { CoupenID: 1, _id: 0 })
      const usercopuneIds = usedCouponsDraft?.map(el => el.CoupenID)
      const couponData = await coupen.aggregate([{ $match: { $and: [{ expiry: { $gte: new Date() } }, { _id: { $nin: usercopuneIds } }] } }])
      if (!couponData) {
        return res.status(400).json({ message: 'coupen data not found' })
      }
  
      res.json(couponData)
    } catch (error) {
      res.status(400).json({ message: error.message || 'coupen error' })

    }
  },
  getCouponList: async (req, res) => {
    try {

      res.render('user/coupenList')
    } catch (error) {
      res.status(400).json({ message: error.message || 'coupen error' })

    }
  }

};

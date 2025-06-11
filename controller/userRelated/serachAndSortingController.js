////////////////// search,sorting and category //////////////////////
const productItemModel=require('../../model/prouctItems')
const categoryModel=require('../../model/catagory')


module.exports = {
  getAll: async (req, res, next) => {
    console.log('here')
    try {
      if (req.query.search) {
        console.log('11')

        const category = (req?.query?.current) ? req.query.current : ''
        if (category !== '') {
          const searchWord = new RegExp(req.query.search, "i")
          console.log(req.query)
          
          const Data = await productItemModel
            .aggregate([{ $match: { category } }, { $match: { Name: { $regex: searchWord }, deleteStatus: false } }])
            .limit(6);

          const CategoryCollection = await categoryModel.findOne();

          let User = req.session.isUserAuthenticated;
          res.render("user/productListing", { Data, CategoryCollection, User });
        } else {
          const searchWord = new RegExp(req.query.search, "i")
          const Data = await productItemModel
            .aggregate([{ $match: { Name: { $regex: searchWord }, deleteStatus: false } }])
            .limit(6);

          const CategoryCollection = await categoryModel.findOne();

          let User = req.session.isUserAuthenticated;
          res.render("user/productListing", { Data, CategoryCollection, User });
        }
      } else if (req.query.from === "sortBySixe") {
        const minValue = parseInt(req.query.minValue);
        const maxValue = parseInt(req.query.maxValue);
        console.log(39)
        if (minValue < maxValue) {
          const Data = await productItemModel.find({
            $and: [{ price: { $lt: maxValue } }, { price: { $gt: minValue } }, { deleteStatus: false }]
          });
          
          const CategoryCollection = await categoryModel.findOne();
          let User = req.session.isUserAuthenticated;
          res.render("user/productListing", { Data, CategoryCollection, User });
        } else {
          res.redirect("/user/all");
        }
      } else if (req.query.instruction === "lowToHigh") {
        console.log(52)
        const Data = await productItemModel.find({ deleteStatus: false }).sort({ price: 1 });
        
        const CategoryCollection = await categoryModel.findOne();
        
        let User = req.session.isUserAuthenticated;
        res.render("user/productListing", { Data, CategoryCollection, User });
      } else if (req.query.instruction === "HighToLow") {
        console.log(52)
        const Data = await productItemModel.find({ deleteStatus: false }).sort({ price: -1 });

        const CategoryCollection = await categoryModel.findOne();

        let User = req.session.isUserAuthenticated;
        res.render("user/productListing", { Data, CategoryCollection, User });
      } else if (req.query.from === "sortBrand") {
        console.log(68)
        const array = JSON.parse(decodeURIComponent(req.query.brand));

        const Data = await productItemModel.find({ brand: { $in: array }, deleteStatus: false });

        const CategoryCollection = await categoryModel.findOne();
        let User = req.session.isUserAuthenticated;
        res.render("user/productListing", { Data, CategoryCollection, User });
      } else if (req.query.from === "sorting") {
        console.log(76)
        const CategoryCollection = await categoryModel.findOne();
        const maxValue = req.query.maxValue;
        const minValue = req.query.minValue;
        const sorting = parseInt(req.query.sort);
        let brand = JSON.parse(req.query.brand);
        console.log(req.query)
        if (brand.length === 0) {
          brand = CategoryCollection.brand;
        }

        const Data = await productItemModel
          .find({
            $and: [
              { price: { $gt: minValue } },
              { price: { $lt: maxValue } },
              { brand: { $in: brand } },
              { deleteStatus: false }
            ],
          })
          .sort({ price: sorting });
        let User = req.session.isUserAuthenticated;

        res.render("user/productListing", { Data, CategoryCollection, User });
      } else {
        console.log('103')
        const pageNumber = req.query.page;
        const pagesOf = await productItemModel.find({ deleteStatus: false }).count()
        const pages = Math.ceil(pagesOf / 6)
        const pagesArray = []
        for (let i = 1; i <= pages; i++) {
          pagesArray.push(i)
        }
        const Data = await productItemModel
          .find({ deleteStatus: false })
          .skip((pageNumber - 1) * 6)
          .limit(6);
        const CategoryCollection = await categoryModel.findOne();

        let User = req.session.isUserAuthenticated;
        res.render("user/productListing", {
          Data,
          CategoryCollection,
          User,
          pagesArray
        });
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getWomen: async (req, res, next) => {
    try {
      const Data = await productItemModel.find({ category: "women", deleteStatus: false });
      let User = req.session.isUserAuthenticated;

      res.render("user/productListing", { Data, User });
    } catch (error) {
      next(error)
    }
  },

  getMan: async (req, res, next) => {
    try {
      const Data = await productItemModel.find({ category: "men", deleteStatus: false });
      let User = req.session.isUserAuthenticated;
      res.render("user/productListing", { Data, User });
    } catch (error) {
      next(error)
    }
  },
}
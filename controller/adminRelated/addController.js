

const cloudinary = require('../../utils/cludinary')
const fs = require("fs");
const category = require("../../model/catagory");
const coupenModel = require("../../model/coupen");
const offerModel = require("../../model/offer");
const productItemModel = require("../../model/prouctItems")
const variatFormater = require('../../utils/variantFormater');
module.exports = {

    postProduct: async (req, res, next) => {

        try {
            const isDuplicate = await productItemModel.findOne({ Name: req.body.Name })
            if (isDuplicate) {
                req.flash('errMessage', 'This name already exist')
                return res.redirect('/admin/add-product-form')
            }
            const variants = JSON.parse(req.body.variens) || []
            if (!variants || variants?.length <= 0) {
                throw new Error('in sufficient data')
            }
            const idRemovedVarient = variatFormater(variants)

            const uploader = async (path) => await cloudinary.uploads(path, "Images");

            let urls = [];
            const files = req.files;
            for (const file of files) {
                const { path } = file;

                const newPath = await uploader(path);

                urls.push(newPath);
                fs.unlinkSync(path);
            }

            const imagePaths = urls.map((item) => item.url);
            const finalImage = imagePaths.slice(0, 5);
            const { Name, brand, category, price, description } = req.body
            if (!Name || !brand || !category || !price) {
                res.status(400).json({ message: 'insufficient data' })
            }
            const Newproduct = {
                Name,
                brand,
                category,
                variants: idRemovedVarient,
                price,
                description,
                images: {
                    path: finalImage,
                },

            };
            await productItemModel
                .create(Newproduct)
                .then(() => {
                    req.flash('message', 'Product Added Successfully')
                    res.redirect(
                        "/admin/product-management"
                    );
                })
                .catch(() => {
                    req.session('errMessage', 'Product Added successfull')
                    res.redirect(
                        "/admin/product-management"
                    );
                });
        } catch (error) {
            console.log(error)
            next(error)
        }
    },
    productVariant: async (req, res) => {
        try {
            const { productID } = req.body
            const { size, color, stock } = req.body.newVariant

            if (!productID || !size || !color || stock < 0 || stock > 5000) {
                res.status(400).json({ message: 'insufficient data' })
                return
            }
            const product = await productItemModel.findById(productID)

            if (!product) {
                res.status(400).json({ message: 'product id not found' })
                return
            }
            const isDuplicate = product.variants.find(v => {
                return v.size === size && v.color === color
            })

            if (isDuplicate) {
                res.status(400).json({ message: 'This variant already exist' })
                return
            } else {
                product.variants.push({ size, color, stock })
                const result = await product.save()
                if (result) {
                    res.json(true)
                    return
                }
            }
            throw new Error('internal server error')
        } catch (error) {

            console.log(error)
            res.status(400).json(error.message || 'internal server error')
        }
    },
    category: async (req, res, next) => {
        try {
            const { cate: newCategory } = req.body;
            if (!newCategory) {
                req.flash('dltMessage', 'category date not found')
                res.redirect("/admin/managecategory")
                return
            }
            const categoryData = await category.findOne()
            if (!categoryData) {
                await category.updateMany({}, { $set: { category: [newCategory] } }, { upsert: true })
                req.flash('catMessage', 'category Added Successfully')
                return res.redirect(
                    "/admin/managecategory"
                );
            } else {
                const isDuplicate = categoryData.category.find(elem => elem.toLocaleLowerCase() === newCategory.toLocaleLowerCase())
                if (isDuplicate) {
                    req.flash('dltMessage', 'Category already exists')
                    res.redirect("/admin/managecategory")
                    return
                } else {
                    categoryData.category.push(newCategory)
                    await categoryData.save()
                    req.flash('catMessage', 'category Added Successfully')
                    res.redirect("/admin/managecategory")
                    return
                }
            }

        } catch (error) {
            next(error)
        }
    },
    brand: async (req, res, next) => {
        try {
            const { brand: newBrand } = req.body;

            if (!newBrand) {
                req.flash('dltMessage', 'brand date not found')
                res.redirect("/admin/getBrandPages")
                return
            }
            const brandData = await category.findOne()
            if (!brandData) {
                await category.updateMany({}, { $set: { brand: [newBrand] } }, { upsert: true })
                req.flash('brandAddedMessage', 'Brand Added Successfully')
                return res.redirect(
                    "/admin/getBrandPages?To=brand"
                );
            } else {
                const isDuplicate = brandData.brand.find(elem => elem.toLocaleLowerCase() === newBrand.toLocaleLowerCase())
                if (isDuplicate) {
                    req.flash('dltMessage', 'Brand already exists')
                    res.redirect("/admin/getBrandPages?To=brand")
                    return
                } else {
                    brandData.brand.push(newBrand)
                    await brandData.save()
                    req.flash('brandAddedMessage', 'category Added Successfully')
                    res.redirect("/admin/getBrandPages?To=brand")
                    return
                }
            }

        } catch (error) {
            next(error)
        }
    },
    coupen: async (req, res) => {

        const {
            name,
            startingDate,
            endingDate,
            code,
            amount,
            orderValue
        } = req.body
        if (!name || !startingDate || !endingDate || !code || !amount || !orderValue) {
            return res.status(400).json({ message: 'insufficient data' })
        }

        const coupenData = {
            name: name,
            code,
            startingDate: new Date(startingDate).setHours(0, 0, 0, 0),
            expiry: new Date(endingDate).setHours(23, 59, 59, 999),
            amount: parseInt(amount),
            orderValue
        };
        try {
            const result = await coupenModel.create(coupenData);
            if (result) {
                res.json("Coupen created");
            }
        } catch (error) {
            res.status(400).json({ message: error.message || 'error on coupon insertion' })
        }
    },
    offer: async (req, res, next) => {
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
                    const data = await productItemModel.findByIdAndUpdate(productArray[i], {
                        $set: { offer_rate: req.body.rate },
                    });
                  
                }

                const data = await offerModel.create(offerObj);

            
                req.session.offerAdded = "Offer Added";
                res.redirect("/admin/getPages?from=offer");
            }
        } catch (error) {
            next(error)
        }
    },
}

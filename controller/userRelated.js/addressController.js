const user=require('../../Model/user')
const addressModel = require("../../Model/address");
const { ObjectId } = require("mongodb");

module.exports = {
   renderAdressMgt: async (req, res) => {

    ///////////rendering address management page///////////
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
     submitAddress: async (req, res) => {
        ///////////submitting address from add address page///////////
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
     resetingDefualtAddress: async (req, res) => {
        ///////////resetting default address from manage address page///////////
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
     editAddress: async (req, res) => {
        ///////////editing address from manage address page///////////
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
    }
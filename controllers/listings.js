const e = require("connect-flash");
const Listing = require("../models/listing");
const expressError = require("../utils/expressError.js");
module.exports.index = async (req, res) => {
  const alllisting = await Listing.find({});
  res.render("./listings/index.ejs", { alllisting });
};

module.exports.newRoute = (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.showRoute = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    res.redirect("/listings");
  } else {
    res.render("./listings/show.ejs", { listing });
  }
};

module.exports.createRoute = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };
  await newlisting.save();
  req.flash("success", "New listing created successfully");
  res.redirect("/listings");
};

module.exports.editRoute = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    res.redirect("/listings");
  } else {
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("./listings/edit.ejs", { listing, originalImageUrl });
  }
};

module.exports.updateRoute = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteRoute = async (req, res) => {
  let { id } = req.params;
  let dellisting = await Listing.findByIdAndDelete(id);
  console.log("listing deleted");
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

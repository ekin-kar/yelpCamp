const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;
const { cloudinary } = require("../cloudinary");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_220");
});

const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
    for (let img of doc.images) {
      await cloudinary.uploader.destroy(img.filename);
    }
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);

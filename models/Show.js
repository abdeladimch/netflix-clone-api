const mongoose = require("mongoose");

const ShowSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "Title cannot be more than 50 characters long!"],
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "Description cannot be more than 200 characters long!"],
    },
    actors: {
      type: [String],
      required: true,
      trim: true,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

ShowSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ show: this._id });
  next();
});

module.exports = mongoose.model("Show", ShowSchema);

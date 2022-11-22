const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    show: {
      type: mongoose.Types.ObjectId,
      ref: "Show",
      required: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ show: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calcAvgRating = async function (showId) {
  const result = await this.aggregate([
    {
      $match: {
        show: showId,
      },
    },
    {
      $group: {
        _id: null,
        avgRating: {
          $avg: "$rating",
        },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);

  await this.model("Show").findOneAndUpdate(
    { _id: showId },
    {
      avgRating: result[0]?.avgRating || 0,
      numOfReviews: result[0]?.numOfReviews || 0,
    }
  );
};

ReviewSchema.post("save", async function () {
  await this.constructor.calcAvgRating(this.show);
});

ReviewSchema.post("remove", async function () {
  await this.constructor.calcAvgRating(this.show);
});

module.exports = mongoose.model("Review", ReviewSchema);

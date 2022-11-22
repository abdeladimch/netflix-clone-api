const mongoose = require("mongoose");

const WatchListschema = new mongoose.Schema(
  {
    watchlist: {
      type: [mongoose.Types.ObjectId],
      ref: "Show",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WatchList", WatchListschema);

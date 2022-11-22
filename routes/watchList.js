const express = require("express");
const router = express.Router();

const {
  createWatchList,
  myWatchLists,
  updateWatchList,
  deleteWatchlist,
} = require("../controllers/watchList");

const { authUser } = require("../middlewares/authMiddleware");

router.route("/").post(authUser, createWatchList);

router.route("/myWatchlists").get(authUser, myWatchLists);

router
  .route("/:id")
  .patch(authUser, updateWatchList)
  .delete(authUser, deleteWatchlist);

module.exports = router;

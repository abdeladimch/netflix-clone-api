const express = require("express");
const router = express.Router();

const {
  createShow,
  getAllShows,
  getSingleShow,
  updateShow,
  deleteShow,
} = require("../controllers/show");

const { displayShowReviews } = require("../controllers/review");

const { authUser, authPerms } = require("../middlewares/authMiddleware");

router
  .route("/")
  .post(authUser, authPerms("admin"), createShow)
  .get(authUser, getAllShows);

router.route("/:id/showReviews").get(authUser, displayShowReviews);

router
  .route("/:id")
  .get(authUser, getSingleShow)
  .patch(authUser, updateShow)
  .delete(authUser, deleteShow);

module.exports = router;

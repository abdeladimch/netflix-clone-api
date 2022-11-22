const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getSingleUser,
  showMe,
  updateUser,
  updateUserPassword,
  deleteUser,
} = require("../controllers/user");

const { displayMyShows } = require("../controllers/show");
const { displayMyReviews } = require("../controllers/review");

const { authUser, authPerms } = require("../middlewares/authMiddleware");

router.route("/").get(authUser, authPerms("admin"), getAllUsers);
router.route("/showMe").get(authUser, showMe);

router.route("/myShows").get(authUser, authPerms("admin"), displayMyShows);
router.route("/myReviews").get(authUser, displayMyReviews);

router.route("/:id").get(authUser, getSingleUser);
router.route("/updateUser").patch(authUser, updateUser);
router.route("/updateUserPassword").patch(authUser, updateUserPassword);
router.route("/:id").delete(authUser, deleteUser);

module.exports = router;

const Review = require("../models/Review");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const Show = require("../models/Show");
const checkPerms = require("../utils/checkPerms");

const createReview = async (req, res) => {
  const { id: showId } = req.params;
  const { rating, comment } = req.body;

  const show = await Show.findOne({ _id: showId });

  if (!show) {
    throw new CustomError.NotFoundError(`Couldn't find show with id ${showId}`);
  }

  const existingReview = await Review.findOne({
    user: req.user.userId,
    show: showId,
  });

  if (existingReview) {
    throw new CustomError.BadRequestError(
      "Review for this show was already submitted!"
    );
  }

  if (!rating || !comment) {
    throw new CustomError.BadRequestError(
      "Rating and comment fields are required!"
    );
  }

  req.body.user = req.user.userId;
  req.body.show = req.params.id;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ status: "Success!", review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find()
    .populate({ path: "user", select: "_id name" })
    .populate({ path: "show", select: "_id title" });

  if (!reviews) {
    throw new CustomError.NotFoundError("No reviews found!");
  }

  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(
      `Couldn't find review with id ${reviewId}`
    );
  }
  res.status(StatusCodes.OK).json({ status: "Success!", review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, comment } = req.body;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(
      `Couldn't find review with id ${reviewId}`
    );
  }

  if (!rating || !comment) {
    throw new CustomError.BadRequestError(
      "Rating and comment fields are required!"
    );
  }

  checkPerms(req.user, review.user);
  review.rating = rating;
  review.comment = comment;
  await review.save();
  res.status(StatusCodes.OK).json({ status: "Success!", review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(
      `Couldn't find review with id ${reviewId}`
    );
  }
  checkPerms(req.user, review.user);
  await review.remove();
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", msg: "Review removed!" });
};

const displayShowReviews = async (req, res) => {
  const { id: showId } = req.params;
  const show = await Show.findOne({ _id: showId });

  if (!show) {
    throw new CustomError.NotFoundError(`Couldn't find show with id ${showId}`);
  }

  const showReviews = await Review.find({ show: showId })
    .populate({
      path: "user",
      select: "_id name",
    })
    .populate({ path: "show", select: "_id title" });

  if (!showReviews.length) {
    throw new CustomError.NotFoundError("This show has no reviews yet!");
  }
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", showReviews, count: showReviews.length });
};

const displayMyReviews = async (req, res) => {
  const myReviews = await Review.find({ user: req.user.userId });
  if (!myReviews.length) {
    throw new CustomError.NotFoundError("You don't have any reviews yet!");
  }
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", myReviews, count: myReviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  displayShowReviews,
  displayMyReviews,
};

const Show = require("../models/Show");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const checkPerms = require("../utils/checkPerms");
const path = require("path");

const createShow = async (req, res) => {
  const { title, duration, description, actors, image } = req.body;
  if (!title || !duration || !description || !actors || !image) {
    throw new CustomError.BadRequestError(
      "Title, description, image, duration and actors fields are required!"
    );
  }
  req.body.user = req.user.userId;
  const show = await Show.create(req.body);
  res.status(StatusCodes.CREATED).json({ status: "Success!", show });
};

const getAllShows = async (req, res) => {
  const shows = await Show.find().populate({
    path: "user",
    select: "_id name",
  });
  if (!shows.length) {
    throw new CustomError.BadRequestError("No shows found!");
  }
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", shows, count: shows.length });
};

const getSingleShow = async (req, res) => {
  const { id: showId } = req.params;
  const show = await Show.findOne({ _id: showId }).populate({
    path: "user",
    select: "_id name",
  });
  if (!show) {
    throw new CustomError.NotFoundError(`Couldn't find show with id ${showId}`);
  }
  res.status(StatusCodes.OK).json({ status: "Success!", show });
};

const updateShow = async (req, res) => {
  const { id: showId } = req.params;
  const { title, description, duration, actors, image } = req.body;

  if (!title || !duration || !description || !actors || !image) {
    throw new CustomError.BadRequestError(
      "Title, description, image, duration and actors fields are required!"
    );
  }

  const show = await Show.findOne({ _id: showId });

  if (!show) {
    throw new CustomError.NotFoundError(`Couldn't find show with id ${showId}`);
  }

  checkPerms(req.user, show.user);

  show.title = title;
  show.description = description;
  show.duration = duration;
  show.actors = actors;
  await show.save();
  res.status(StatusCodes.OK).json({ status: "Status!", show });
};

const deleteShow = async (req, res) => {
  const { id: showId } = req.params;
  const show = await Show.findOne({ _id: showId });

  if (!show) {
    throw new CustomError.NotFoundError(`Couldn't find show with id ${showId}`);
  }

  checkPerms(req.user, show.user);

  await show.remove();
  res.status(StatusCodes.OK).json({ status: "Success!", msg: "Show removed!" });
};

const displayMyShows = async (req, res) => {
  const myShows = await Show.find({ user: req.user.userId }).populate({
    path: "user",
    select: "_id name",
  });
  if (!myShows.length) {
    throw new CustomError.NotFoundError("You don't have any shows yet!");
  }
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", myShows, count: myShows.length });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No file uploaded!");
  }

  const showImage = req.files.image;

  if (!showImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please upload image!");
  }

  const maxSize = 1024 * 5120;

  if (showImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Image size cannot be more than 5MB!"
    );
  }

  const imagePath = path.join(__dirname, `../public/uploads/${showImage.name}`);

  await showImage.mv(imagePath);
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", msg: "Image uploaded successfully!" });
};

module.exports = {
  createShow,
  getAllShows,
  getSingleShow,
  updateShow,
  deleteShow,
  displayMyShows,
  uploadImage,
};

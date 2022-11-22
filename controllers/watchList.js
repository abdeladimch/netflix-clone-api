const WatchList = require("../models/watchList");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const checkPerms = require("../utils/checkPerms");

const createWatchList = async (req, res) => {
  const { watchlist } = req.body;
  if (!watchlist) {
    throw new CustomError.BadRequestError(
      "Watchlist content is cannot be empty!"
    );
  }
  req.body.user = req.user.userId;
  const createWatchlist = await WatchList.create(req.body);
  res
    .status(StatusCodes.CREATED)
    .json({ status: "Success!", watchlist: createWatchlist });
};

const myWatchLists = async (req, res) => {
  const { userId } = req.user;
  const myWatchlists = await WatchList.find({ user: userId })
    .populate({
      path: "user",
      select: "_id name",
    })
    .populate({ path: "watchlist", select: "_id title" });
  if (!myWatchlists.length) {
    throw new CustomError.NotFoundError("You don't have any watchlists yet!");
  }
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", myWatchlists, count: myWatchlists.length });
};

const updateWatchList = async (req, res) => {
  const { id: watchlistId } = req.params;
  const { watchlist } = req.body;
  if (!watchlist) {
    throw new CustomError.BadRequestError("Watchlist content cannot be empty");
  }
  const updateWatchlist = await WatchList.findOne({ _id: watchlistId });
  if (!updateWatchlist) {
    throw new CustomError.NotFoundError(
      `Couldn't find watchlist with id ${watchlistId}`
    );
  }
  checkPerms(req.user, updateWatchlist.user);
  updateWatchlist.watchlist = watchlist;
  await updateWatchlist.save();
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", watchlist: updateWatchlist });
};

const deleteWatchlist = async (req, res) => {
  const { id: watchlistId } = req.params;
  const deleteWatchlist = await WatchList.findOne({ _id: watchlistId });
  if (!deleteWatchlist) {
    throw new CustomError.NotFoundError(
      `Couldn't find watchlist with id ${watchlistId}`
    );
  }
  checkPerms(req.user, deleteWatchlist.user);
  await deleteWatchlist.remove();
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", msg: "Watchlist removed!" });
};

module.exports = {
  createWatchList,
  myWatchLists,
  updateWatchList,
  deleteWatchlist,
};

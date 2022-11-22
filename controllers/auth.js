const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const CustomError = require("..//errors");
const { StatusCodes } = require("http-status-codes");
const sendEmail = require("../utils/sendEmail");
const Token = require("../models/Token");
const jwt = require("../utils/index");

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new CustomError.BadRequestError(
      "Name, email and password fields are required!"
    );
  }

  const emailToken = crypto.randomBytes(64).toString("hex");
  const origin = req.headers.host;
  req.body.emailToken = emailToken;
  const user = await User.create(req.body);
  await sendEmail(user.name, user.email, emailToken, origin);
  res
    .status(StatusCodes.CREATED)
    .json({ status: "Success!", msg: "Please verify your email!" });
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({ emailToken: token });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Email validation failed!");
  }

  user.emailToken = "";
  user.isVerified = true;
  user.verified = Date.now();

  await user.save();
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", msg: "Email verified!" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError(
      "Email and password fields are required!"
    );
  }
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new CustomError.UnauthenticatedError("Invalid credentials!");
  }

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("Please verify your email!");
  }

  let refreshToken = "";
  const userToken = jwt.createToken(user);

  const existingToken = await Token.findOne({ user });
  if (existingToken) {
    refreshToken = existingToken.refreshToken;
    jwt.attachCookiesToRes(res, userToken, refreshToken);
    return res
      .status(StatusCodes.OK)
      .json({ status: "Success!", user: userToken });
  }
  refreshToken = crypto.randomBytes(64).toString("hex");
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];
  const token = await Token.create({
    refreshToken,
    ip,
    userAgent,
    user: user._id,
  });

  jwt.attachCookiesToRes(res, userToken, refreshToken);
  res.status(StatusCodes.OK).json({ status: "Success!", user: userToken });
};

const logout = async (req, res) => {
  res.cookie("accessToken", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.cookie("refreshToken", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", msg: "User logged out!" });
};

module.exports = { signup, verifyEmail, login, logout };

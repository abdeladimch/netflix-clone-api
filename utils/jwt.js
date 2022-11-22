const jwt = require("jsonwebtoken");
require("dotenv").config();

const createToken = (user) => {
  return { name: user.name, userId: user._id, role: user.role };
};

const genJWT = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToRes = (res, accessToken, refreshToken) => {
  const accessTokenJWT = genJWT(accessToken);
  const refreshTokenJWT = genJWT({ accessToken, refreshToken });
  const oneMonth = 1000 * 3600 * 24 * 30;

  res.cookie("accesstoken", accessTokenJWT, {
    maxAge: 1000 * 60 * 15,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    signed: true,
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    expires: new Date(Date.now() + oneMonth),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    signed: true,
  });
};

module.exports = { createToken, genJWT, verifyToken, attachCookiesToRes };

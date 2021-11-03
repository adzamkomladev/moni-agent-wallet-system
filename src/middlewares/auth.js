import jwt from "jsonwebtoken";

function verifyToken(req, res, next) {
  const token = req.body.token || req.query.token || req.headers["auth-token"];
console.log(token);
  if (!token) {
    return res
      .status(403)
      .json({ message: "A token is required for authentication" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
      console.log(err);
    return res.status(401).json({ message: "Invalid Token" });
  }

  return next();
}

export { verifyToken };

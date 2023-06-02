const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("No está autenticado, vuelva a iniciar sesión");
  }
  try {
    const decoded = jwt.verify(token, 'Centro_Galo');
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Token vencido o inválido");
  }
  return next();
};

module.exports = verifyToken;
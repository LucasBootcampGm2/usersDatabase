import db from "../database/sqlite.js";

const validateUser = (req, res, next) => {
  const { email } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) return next(err);

    if (row)
      return res
        .status(400)
        .json({ message: "User with this email already exists" });

    next();
  });
};

export { validateUser };

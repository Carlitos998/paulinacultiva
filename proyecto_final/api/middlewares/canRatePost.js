const { Calification } = require("../models/Calification");

const canRatePost = async (req, res, next) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  const existing = await Calification.findOne({ where: { userId, postId } });
  if (existing) {
    return res.status(400).json({ message: "Ya calificaste este post" });
  }
  next();
};



module.exports = {
    canRatePost
}

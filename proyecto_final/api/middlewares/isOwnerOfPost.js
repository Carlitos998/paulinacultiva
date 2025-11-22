
const isOwnerOfPost = async (req, res, next) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  const post = await Post.findByPk(postId);
  if (!post) return res.status(404).json({ message: "Post no encontrado" });

  if (post.autorId !== userId && !req.user.isAdmin) {
    return res.status(403).json({ message: "No tienes permiso para modificar este post" });
  }
  next();
};

module.exports = {
    isOwnerOfPost
}
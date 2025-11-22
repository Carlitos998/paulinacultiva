const isOwnerOfComment = async (req, res, next) => {
  const userId = req.user.id;
  const commentId = req.params.commentId;

  const comment = await Comment.findByPk(commentId);
  if (!comment) return res.status(404).json({ message: "Comentario no encontrado" });

  if (comment.autorId !== userId && !req.user.isAdmin) {
    return res.status(403).json({ message: "No tienes permiso para modificar este comentario" });
  }
  next();
};

module.exports = {
    isOwnerOfComment
}

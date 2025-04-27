// Middleware untuk membatasi akses hanya untuk admin
module.exports = function (req, res, next) {
  // Pastikan user sudah terautentikasi dan ada di req.user
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Admin only' });
};

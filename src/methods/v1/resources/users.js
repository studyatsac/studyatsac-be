const UsersService = require("../../../services/v1/users_service");

exports.getAllUsers = async function (req, res) {
  try {
    // Ambil query param limit & page (default: limit=10, page=1)
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const offset = (page - 1) * limit;

    // Ambil data dan total count
    const { rows: users, count: total } = await UsersService.getAllUsers({ limit, offset });

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Controller untuk menambah user
exports.createUser = async function (req, res) {
  try {
    const userData = req.body;
    const user = await UsersService.createUser(userData);
    return res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Controller untuk menghapus user
exports.deleteUser = async function (req, res) {
  try {
    const userId = req.params.id;
    const deleted = await UsersService.deleteUser(userId);
    if (deleted) {
      return res.status(200).json({ success: true, message: "User deleted" });
    } else {
      return res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Controller untuk bulk delete user
exports.bulkDeleteUsers = async function (req, res) {
  try {
    const userIds = req.body.userIds;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: "userIds array is required" });
    }
    const deleted = await UsersService.bulkDeleteUsers(userIds);
    return res.status(200).json({ success: true, deletedCount: deleted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

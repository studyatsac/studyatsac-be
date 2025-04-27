exports.item = (data) => ({
    token: data.token,
    user: data.user ? {
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
        role: data.user.role
    } : undefined
});

module.exports = exports;

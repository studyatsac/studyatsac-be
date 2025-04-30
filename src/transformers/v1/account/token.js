exports.item = (data) => ({
    token: data.token,
    user: data.user ? {
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
        roles: data.user.roles
    } : undefined
});

module.exports = exports;

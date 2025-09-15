exports.item = (role) => {
    return {
        uuid: role.uuid,
        name: role.name,
        description: role.description
    };
};

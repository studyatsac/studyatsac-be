const Helpers = require('../utils/helpers');
const RolesUserRepository = require('../repositories/mysql/role_users');
const Response = require('../utils/response');
const UsersRepository = require('../repositories/mysql/user');
const RolesRepository = require('../repositories/mysql/roles');

const getListUsersWithRoles = async (input) => {
    const users = await UsersRepository.findAndCountAll(
        {},
        {
            limit: input.limit,
            offset: Helpers.setOffset(input.page, input.limit),
            include: 'Roles' // Ambil peran untuk setiap pengguna
        }
    );
    // Lakukan transformasi data di sini
    return users;
};

const getUserWithRoles = async (userUuid) => {
    // Panggil findOne dari repository dengan opsi `include`
    const user = await UsersRepository.findOne({ uuid: userUuid }, {
        include: [{ model: RolesRepository.getModel(), as: 'Roles' }] // Ini menginstruksikan Sequelize untuk mengambil data roles
    });

    // Anda mungkin perlu mentransformasi data di sini untuk menyesuaikan output API
    if (user) {
        return {
            uuid: user.uuid,
            fullName: user.fullName,
            email: user.email,
            roles: user.Roles.map(role => ({
                uuid: role.uuid,
                name: role.name
            }))
        };
    }
    return null;
};

const assignRoleToUser = async (input, opts = {}) => {
    const language = opts.lang;

    // // Tambahkan validasi dasar untuk memastikan input UUID tidak kosong
    // if (!input.userUuid || !input.roleUuid) {
    //     return Response.formatServiceReturn(false, 400, null, language.COMMON.BAD_REQUEST);
    // }
    const user = await UsersRepository.findOne({ uuid: input.userUuid });
    if (!user) {
        return Response.formatServiceReturn(false, 404, null, language.USER.NOT_FOUND);
    }
    const role = await RolesRepository.findOne({ uuid: input.roleUuid });
    if (!role) {
        return Response.formatServiceReturn(false, 404, null, language.ROLE.NOT_FOUND);
    }

    // 2. Cek apakah user sudah memiliki role tersebut untuk menghindari duplikasi
    const existingAssignment = await RolesUserRepository.findOne({
        user_id: user.id,
        role_id: role.id
    });
    if (existingAssignment) {
        return Response.formatServiceReturn(false, 409, null, language.ROLE_USER.ALREADY_ASSIGNED);
    }

    // 3. Buat entitas RoleUser baru
    const newRoleUser = await RolesUserRepository.create({
        user_id: user.id,
        role_id: role.id
    });

    return Response.formatServiceReturn(true, 201, {
        uuid: newRoleUser.uuid,
        message: language.ROLE_USER.ASSIGN_SUCCESS
    });
};

module.exports = {
    assignRoleToUser,
    getUserWithRoles,
    getListUsersWithRoles
};

const Helpers = require('../../utils/helpers');
const RolesUserRepository = require('../../repositories/mysql/role_users');
const Response = require('../../utils/response');
const UsersRepository = require('../../repositories/mysql/user');
const RolesRepository = require('../../repositories/mysql/roles');

// const getListUsersWithRoles = async (input) => {
//     const users = await UsersRepository.findAndCountAll(
//         {},
//         {
//             limit: input.limit,
//             offset: Helpers.setOffset(input.page, input.limit),
//             include: 'Roles' // Ambil peran untuk setiap pengguna
//         }
//     );
//     // Lakukan transformasi data di sini
//     return users;
// };

const getListUsersWithRoles = async (input) => {
    // Ambil data user beserta perannya dari repository
    const { rows: users, count } = await UsersRepository.findAndCountAll(
        {},
        {
            limit: input.limit,
            offset: Helpers.setOffset(input.page, input.limit),
            // Pastikan alias 'Roles' ada di sini
            includeRoles: true
        }
    );

    // Lakukan transformasi data untuk setiap user
    const formattedUsers = users.map(user => {
        // Gabungkan nama peran menjadi satu string
        const roleNames = user.Roles.map(role => role.name).join(', ');

        return {
            uuid: user.uuid,
            fullName: user.fullName,
            email: user.email,
            // Format 'roles' sekarang adalah string
            roles: roleNames
        };
    });

    // Kembalikan data yang sudah diformat bersama total count
    return {
        rows: formattedUsers,
        count
    };
};

const getUserWithRoles = async (userUuid) => {
    // Panggil findOne dari repository dengan opsi `includeRoles: true`
    const user = await UsersRepository.findOne({ uuid: userUuid }, {
        includeRoles: true // Ini memberi tahu repository untuk menyertakan data roles
    });

    if (user && user.Roles) {
        // Ambil nama peran dan gabungkan menjadi string
        const roleNames = user.Roles.map(role => role.name).join(', ');

        return {
            uuid: user.uuid,
            fullName: user.fullName,
            email: user.email,
            roles: roleNames // <-- Sekarang nilainya adalah string
        };
    }
    // Kembalikan null jika user tidak ditemukan
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
        new_role: role.name,
        message: language.ROLE_USER.ASSIGN_SUCCESS
    });
};

module.exports = {
    assignRoleToUser,
    getUserWithRoles,
    getListUsersWithRoles
};

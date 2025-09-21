const RolesRepository = require('../../repositories/mysql/roles');
const Helpers = require('../../utils/helpers');
const Response = require('../../utils/response');
const Models = require('../../models/mysql');

const getAllRoles = async () => {
    const roles = await RolesRepository.findAll();
    return roles.map((role) => (role.toJSON ? role.toJSON() : role));
};

const getListRoles = async (input, opts = {}) => {
    const orderBy = input.orderBy || 'id';
    const order = input.order || 'asc';

    const whereClause = {};
    const optionsClause = {
        order: [[orderBy, order]],
        limit: input.limit,
        offset: Helpers.setOffset(input.page, input.limit),
        include: [
            {
                model: Models.User,
                attributes: ['id', 'full_name', 'email', 'institution_name', 'faculty', 'nip']
            }
        ]
    };

    // Menggunakan repository findAndCountAll untuk mengambil data dan total
    const roles = await RolesRepository.findAndCountAll(whereClause, optionsClause);

    const data = { rows: roles.rows, count: roles.count };

    return Response.formatServiceReturn(true, 200, data, 'Successfully retrieved role list.');
};

const getDetailRole = async (input, opts = {}) => {
    const language = opts.lang;

    // Mengambil role dari repository berdasarkan UUID
    const role = await RolesRepository.findOne({ uuid: input.uuid });
    if (!role) {
        // Mengembalikan error jika role tidak ditemukan
        return Response.formatServiceReturn(false, 404, null, language.ROLE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, role, language.ROLE.SUCCESS_GET_DETAIL);
};

const createRole = async (input, opts = {}) => {
    const language = opts.lang;

    // Memeriksa apakah nama role sudah ada
    const existingRole = await RolesRepository.findOne({ name: input.name });
    if (existingRole) {
        return Response.formatServiceReturn(false, 409, null, language.ROLE.ALREADY_EXISTS);
    }

    // Membuat role baru menggunakan repository
    const newRole = await RolesRepository.create({
        name: input.name,
        description: input.description
    });

    if (!newRole) {
        return Response.formatServiceReturn(false, 500, null, language.ROLE.CREATE_FAILED);
    }

    return Response.formatServiceReturn(true, 200, newRole, language.ROLE.CREATE_SUCCESS);
};

const updateRole = async (input, opts = {}) => {
    const language = opts.lang;

    // Memeriksa apakah role yang akan diperbarui ada
    const role = await RolesRepository.findOne({ uuid: input.uuid });
    if (!role) {
        return Response.formatServiceReturn(false, 404, null, language.ROLE.NOT_FOUND);
    }

    // Memeriksa duplikasi nama jika nama baru diberikan
    if (input.name) {
        const existingRole = await RolesRepository.findOne({ name: input.name });
        // Memastikan role yang duplikat bukan role yang sedang diperbarui
        if (existingRole && existingRole.id !== role.id) {
            return Response.formatServiceReturn(false, 409, null, language.ROLE.ALREADY_EXISTS);
        }
    }

    // Melakukan update menggunakan repository
    const updated = await RolesRepository.update(
        { name: input.name, description: input.description },
        { uuid: input.uuid }
    );
    if ((Array.isArray(updated) && !updated[0]) || !updated) {
        return Response.formatServiceReturn(false, 500, null, language.ROLE.UPDATE_FAILED);
    }

    // Mengambil data role yang sudah diperbarui untuk respons
    const updatedRole = await RolesRepository.findOne({ uuid: input.uuid });

    return Response.formatServiceReturn(true, 200, updatedRole, language.ROLE.UPDATE_SUCCESS);
};

const deleteRole = async (input, opts = {}) => {
    const language = opts.lang;

    // Memeriksa apakah role yang akan dihapus ada
    const role = await RolesRepository.findOne({ uuid: input.uuid });
    if (!role) {
        return Response.formatServiceReturn(false, 404, null, language.ROLE.NOT_FOUND);
    }

    // Menghapus role menggunakan repository
    await RolesRepository.delete({ id: role.id });

    return Response.formatServiceReturn(true, 200, null, language.ROLE.DELETE_SUCCESS);
};

module.exports = {
    getAllRoles,
    getListRoles,
    getDetailRole,
    createRole,
    updateRole,
    deleteRole
};

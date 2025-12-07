const { DataTypes } = require('sequelize');
const { sequelize } = require('../../clients/db/main');

const LeadSubmissions = sequelize.define(
    'LeadSubmissions',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        whatsapp_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: 'Nomor WA user'
        },
        selected_program: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Program yang dipilih'
        },
        source: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Misal: landing_english_prep'
        },
        status: {
            type: DataTypes.ENUM('new', 'contacted', 'converted'),
            allowNull: false,
            defaultValue: 'new',
            comment: 'Status lead: new / contacted / converted'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Kapan lead masuk'
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        tableName: 'lead_submissions',
        timestamps: false,
        indexes: [
            {
                fields: ['whatsapp_number']
            },
            {
                fields: ['source']
            },
            {
                fields: ['status']
            },
            {
                fields: ['created_at']
            }
        ]
    }
);

module.exports = LeadSubmissions;

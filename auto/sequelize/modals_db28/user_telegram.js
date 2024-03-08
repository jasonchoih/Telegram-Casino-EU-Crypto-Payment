//
module.exports = (DataTypes) => {
    return {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        address_business:{
            type: DataTypes.STRING(64),
            unique: true,
            allowNull: false,
        },
        address_withdraw:{
            type: DataTypes.STRING(64),
            unique: true,
            // allowNull: false,
        },
        unconfirmed_event:{
            type: DataTypes.STRING(80),
            unique: true,
        },
        confirmed_event:{
            type: DataTypes.STRING(80),
            unique: true,
        },
        telegram_id: {
            type: DataTypes.STRING(80),
            unique: true,
        },
        user_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        telegram_tag: {
            type: DataTypes.STRING(64),
            unique: true,
            allowNull: false,
        },
        bot: {
            type: DataTypes.TINYINT(4)
        }
    }
};
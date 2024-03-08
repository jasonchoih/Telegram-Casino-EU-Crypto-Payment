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
            // unique: true,
            // allowNull: false,
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
        telegram_bet_acl: {
            type: DataTypes.STRING(1500),
        },
        bot: {
            type: DataTypes.TINYINT(4)
        }
    }
};
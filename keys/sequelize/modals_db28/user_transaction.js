//
module.exports = (DataTypes) => {
    return {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        charge_id:{
            type: DataTypes.INTEGER
        },
        user_id:{
            type: DataTypes.INTEGER
        },
        address_business:{
            type: DataTypes.STRING(64)
        },
        amount: {
            type: DataTypes.DECIMAL(15, 0),
            defaultValue: 0
        },
        unit:{
            type: DataTypes.STRING(10)
        },
        block:{
            type: DataTypes.STRING(64)
        },
        transaction_id:{
            type: DataTypes.STRING(64)
        },
        time: {
            type: DataTypes.DATE
        }
    }
};
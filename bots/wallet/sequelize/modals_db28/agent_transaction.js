//
module.exports = (DataTypes) => {
    return {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        agent_id: {
            type: DataTypes.INTEGER
        }, 
        address_agent: {
            type: DataTypes.STRING(64)
        },
        address_customer:{
            type: DataTypes.STRING(64)
        },
        amount: {
            type: DataTypes.DECIMAL(15, 0)
        },
        // unit:{
        //     type: DataTypes.STRING(10)
        // },
        transaction_id:{
            type: DataTypes.STRING(64)
        },
        time: {
            type: DataTypes.DATE
        }
    }
};
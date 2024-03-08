//
module.exports = (DataTypes) => {
    return {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        agent_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '用户ID'
        },
        charge: {
            type: DataTypes.DECIMAL(18, 0),
            defaultValue: '0',
            comment: '充值金额/元'
        },
        charge_num: {
            type: DataTypes.INTEGER,
            defaultValue: '0',
            comment: '充值笔数'
        },
        charge_rate: {
            type: DataTypes.DECIMAL(18, 0),
            defaultValue: '0',
            comment: '充值利润/豆'
        },
        exchange: {
            type: DataTypes.DECIMAL(18, 0),
            defaultValue: '0',
            comment: '回收金额/元'
        },
        exchange_num: {
            type: DataTypes.INTEGER,
            defaultValue: '0',
            comment: '回收笔数'
        },
        exchange_rate: {
            type: DataTypes.DECIMAL(18, 0),
            defaultValue: '0',
            comment: '回收利润/豆'
        },
        rate_sum: {
            type: DataTypes.DECIMAL(18, 0),
            defaultValue: '0',
            comment: '总利润/豆'
        },
        time: {
            type: DataTypes.DATEONLY,
            comment: '时间'
        },
    }
};
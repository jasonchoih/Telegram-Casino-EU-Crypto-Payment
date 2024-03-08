//
module.exports = (DataTypes) => {
    return {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        admin_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '客服ID'
        },
        sys_charge: {
            type: DataTypes.DECIMAL(18, 0),
            defaultValue: 0,
            comment: '系统充值统计'
        },
        admin_charge: {
            type: DataTypes.DECIMAL(18, 0),
            defaultValue: 0,
            comment: '客服充值统计'
        },
        agent_charge: {
            type: DataTypes.DECIMAL(18, 0),
            defaultValue: 0,
            comment: '代理充值统计'
        },
        exchange: {
            type: DataTypes.DECIMAL(18, 0),
            defaultValue: 0,
            comment: '代理提现金豆'
        },
        time: {
            type: DataTypes.DATE,
            comment: '最后更新时间'
        },
    }
};
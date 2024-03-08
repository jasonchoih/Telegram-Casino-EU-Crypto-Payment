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
            comment: '代理ID'
        },
        admin_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '客服ID'
        },
        money: {
            type: DataTypes.DECIMAL(12, 0),
            defaultValue: '0',
            comment: '提现金额'
        },
        status: {
            type: DataTypes.TINYINT(4),
            defaultValue: 1,
            comment: '状态 1发起提现 2审核通过 3提现取消'
        },
        time: {
            type: DataTypes.DATE,
            comment: '发起时间'
        },
        shtime: {
            type: DataTypes.DATE,
            comment: '审核时间'
        },
    }
};
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
        money: {
            type: DataTypes.DECIMAL(12, 0),
            defaultValue: '0',
            comment: '充值金额'
        },
        dou: {
          type: DataTypes.DECIMAL(18, 0),
          defaultValue: '0',
          comment: '金豆余额'
        },
        form_admin_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '管理员ID'
        },
        time: {
            type: DataTypes.DATE,
            comment: '时间'
        },
    }
};
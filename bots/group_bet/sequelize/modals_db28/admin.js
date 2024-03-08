//
module.exports = (DataTypes) => {
    return {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        uuid: {
            type: DataTypes.STRING(30),
            comment: '认证标识'
        },
        user: {
            type: DataTypes.STRING(32),
            unique: true,
            allowNull: false,
            comment: '账号'
        },
        pass: {
            type: DataTypes.STRING(64),
            allowNull: false,
            comment: '密码'
        },
        role: {
            type: DataTypes.TINYINT(4),
            defaultValue: 1,
            comment: '用户类型 1普通 2管理员 3总裁'
        },
        calling: {
            type: DataTypes.STRING(8),
            allowNull: false,
            comment: '国家区号'
        },
        phone: {
            type: DataTypes.STRING(11),
            allowNull: false,
            comment: '手机号码'
        },
        nick: {
            type: DataTypes.STRING(20),
            unique: true,
            allowNull: false,
            comment: '昵称'
        },
        dou: {
            type: DataTypes.DECIMAL(15, 0),
            defaultValue: '0',
            comment: '金豆余额'
        },
        up_max: {
            type: DataTypes.DECIMAL(15, 0),
            defaultValue: '10000',
            comment: '最高上分'
        },
        status: {
            type: DataTypes.TINYINT(4),
            defaultValue: 1,
            comment: '状态 1正常 2冻结'
        },
        time: {
            type: DataTypes.DATE,
            comment: '时间'
        }
    }
};
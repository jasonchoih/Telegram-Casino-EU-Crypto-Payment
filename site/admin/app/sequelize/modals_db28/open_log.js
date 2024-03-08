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
            comment: '用户ID'
        },
        admin_nick: {
            type: DataTypes.STRING(32),
            comment: '昵称'
        },
        type: {
            type: DataTypes.STRING(10),
            comment: '游戏类型'
        },
        peroids: {
            type: DataTypes.STRING(18),
            comment: '期数'
        },
        des: {
            type: DataTypes.STRING(),
            comment: '内容'
        },
        time: {
            type: DataTypes.DATE,
            comment: '时间'
        }
    }
};
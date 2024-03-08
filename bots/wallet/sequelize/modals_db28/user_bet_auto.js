//
module.exports = (DataTypes) => {
    return {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '用户ID'
        },
        category: {
            type: DataTypes.STRING(10),
            comment: '游戏分类'
        },
        type: {
            type: DataTypes.STRING(10),
            comment: '游戏类型'
        },
        start_peroids: {
            type: DataTypes.STRING(15),
            allowNull: false,
            comment: '期数'
        },
        end_peroids: {
            type: DataTypes.STRING(15),
            allowNull: false,
            comment: '期数'
        },
        min_dou: {
            type: DataTypes.DECIMAL(15, 0),
            comment: '金豆'
        },
        max_dou: {
            type: DataTypes.DECIMAL(15, 0),
            comment: '金豆'
        },
        mode: {
            type: DataTypes.TINYINT(4),
            defaultValue: 1,
            comment: '类型 1输赢模式 2对号模式'
        },
        vals: {
            type: DataTypes.STRING(500),
            allowNull: false,
            comment: '投注模式'
        },
        peroids: {
            type: DataTypes.STRING(15),
            allowNull: false, 
            comment: '当前执行期数'
        },
        pn: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '已执行到第几期'
        },
        dou: {
            type: DataTypes.DECIMAL(15, 0),
            comment: '已投注金豆'
        },
        win: {
            type: DataTypes.DECIMAL(15, 0),
            comment: '中奖金豆'
        },
        lose: {
            type: DataTypes.DECIMAL(15, 0),
            comment: '输了金豆'
        },
        status: {
            type: DataTypes.TINYINT(4),
            defaultValue: 1,
            comment: '类型 1准备中 2自动投注中 3手工停止 30不在期数范围内 31金豆低于下限 32金豆大于上限 33投注模式不存在 34金豆不足以投注'
        },
        time: {
            type: DataTypes.DATE,
            comment: '时间'
        }
    }
};
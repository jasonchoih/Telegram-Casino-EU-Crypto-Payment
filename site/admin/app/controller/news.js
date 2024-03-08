//
const dayjs = require('dayjs'); 
const { Op,TITLE,CONTENT } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
//
const list = async(d) => 
{
    const { _title, page, time_start, time_end } = d;
    //
    const { offset,limit } = await xpage(page);
    // 
    let where = {};
    if(_title) where['title'] = { [Op.like]: '%'+_title+'%' };
    if(time_start)
    {
        where['time'] = {
            [Op.gte]: time_start,
            [Op.lte]: time_end,
        };
    }
    // 
    const count = await TITLE.count(where);
    const rows = await TITLE.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        list.push([
            v.id,
            v.title,
            v.auth,
            dayjs(v.time).format('YYYY-MM-DD HH:mm:ss'),
        ])
    }
    return {
        NewsList: [
            [page, count],
            list
        ],
        NewsListLoading: false
    };
}
// 
const get = async(d) => 
{
    const { _id } = d;
    // 
    const _title = await TITLE.findOne({where:{id:_id}});
    if(!_title) return { M:{c:'没有该新闻ID信息，或已删除！'} }
    const _content = await CONTENT.findOne({where:{title_id:_id}});
    // 
    return {
        TitleContent:{
            id: _title.id,
            title: _title.title,
            auth: _title.auth,
            _time: dayjs(_title.time).format('YYYY-MM-DD HH:mm:ss'),
            content: _content.content,
        }
    }
}
//
const add = async(d) => 
{
    const { title, auth, _time, content } = d;
    //
    const _title = await TITLE.create({
        type: 'news',
        title,
        auth,
        time: _time
    });
    await CONTENT.create({
        title_id: _title.id,
        content
    });
    return {
        ...await list({}),
        M:{c:'添加新闻成功！'},
    }
}
// 
const del = async(d) => 
{
    const { _id } = d;
    //
    const _title = await TITLE.findOne({where:{id:_id}});
    if(!_title) return { M:{c:'没有该新闻ID信息，或已删除！'} }
    // 
    await TITLE.destroy({where:{id:_id}});
    await CONTENT.destroy({where:{title_id:_id}});
    return {
        ...await list({}),
        M:{c:'删除新闻成功！'},
    }
}
// 
const edit = async(d) => 
{
    const { _id, title, auth, _time, content } = d;
    //
    const _title = await TITLE.findOne({where:{id:_id}});
    if(!_title) return { M:{c:'没有该新闻ID信息，或已删除！'} }
    // 
    await TITLE.update({ title, auth, time: _time }, {
        where: {
          id: _id
        }
    });
    await CONTENT.update({ content }, {
        where: {
          title_id: _id
        }
    });
    return {
        ...await list({}),
        M:{c:'编辑新闻成功！'},
    }
}
// 
module.exports = 
{
    list,
    get,
    add,
    del,
    edit
};
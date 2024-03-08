const express = require('express')
const app = express();
const cors = require('cors')
// 
const controllers = require('./plugin/controllers');
const controller = controllers('../controller');
const SEND = async(path, data) => {
  const _path = path.split('/');
  return await controller[_path[0]][_path[1]](data)
}
// 
app.use(cors());
// 
app.get('/game', async(req, res) => {
  const { category, type, path } = req.query;
  switch (path) 
  {
    case 'jg':
      const data_jg = await SEND('puppy/jg', { category, type, path });
      if(data_jg) res.json(data_jg);
    break;
    // 
    case 'yc':
      const data_yc = await SEND('puppy/yc', { category, type, path });
      if(data_yc) res.json(data_yc);
    break;
    case 'zst':
      const data_zst = await SEND('puppy/zst', { category, type, path });
      if(data_zst) res.json(data_zst);
    break;
  }
});
//   
app.listen(3000, () => { })
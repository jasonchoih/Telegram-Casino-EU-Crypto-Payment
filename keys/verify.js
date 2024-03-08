const express = require('express');
const path = require('path');
// 
const app = express();
app.disable('x-powered-by');
// 
app.use(express.static(path.join(__dirname, 'public')));
// 
app.get('/cryptoapisverifydomain', async(req, res) => 
{
    // console.log(req)
    // 'user-agent': 'Crypto APIs / 2.0 callback URL verification',
    // 
    const filePath = path.join(__dirname, 'cryptoapisverifydomain.txt');
    res.download(filePath, 'cryptoapisverifydomain.txt', (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          res.status(500).send('Internal Server Error');
        }
      });
});
// 
// app.listen(4000, ()=> {
//     console.log('Running')
// });
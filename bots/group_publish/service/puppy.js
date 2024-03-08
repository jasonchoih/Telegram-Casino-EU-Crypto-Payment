const puppeteer = require("puppeteer");
// 
const generateScreenshot = async(d) =>
{
    const { category, peroids, type } = d;
    // 
    const screenshots = {
        // 'jg':  [{ width: 593, height: type==28 ? 1020 : 900 } ,7777],
        'yc':  [{ width: 593, height: type==28 ? 1000: 900 } , 8888],
        'zst': [{ width: 1300, height: 1350 }, 9999]
    } 
    // 
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [ '--no-sandbox']
        });
        // 
        const page = await browser.newPage();
        await page.setViewport({ width: 1300, height: 1350 });
        // 
        for(let i in screenshots){
            await page.goto(`http://localhost:${screenshots[i][1]}/#/${category}/${type}/${i}`, { waitUntil: 'networkidle0' });
            // console.log({
            //     i,
            //     ...screenshots[i]
            // })
            await page.screenshot({
                type: 'png',
                path: `./screens/${category}/${i}_${peroids}.png`,
                clip: {
                    x: 0,
                    y: 0,
                    ...screenshots[i][0]
                }
            });
        }
        await browser.close();
        return 'ok'
        // 
        // console.log('finished')
    } catch (error) {
        // console.log(error)
    }    
}
// 
const generateSingle = async(d) =>
{
    const { category, peroids, path, type } = d;
    // 
    // console.log({
    //     category, peroids, path
    // })
    // 
    const screenshots = {
        'jg':  [{ width: 593, height: type==28 ? 1020 : 900 } ,7777],
        'yc':  [{ width: 593, height: type==28 ? 1000: 900 } , 8888],
        'zst': [{ width: 1300, height: 1350 }, 9999]
    } 
    // 
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [ '--no-sandbox']
        });
        // 
        const page = await browser.newPage();
        await page.setViewport({ width: 1300, height: 1350 });
        let screen;
        // 
        await page.goto(`http://localhost:${screenshots[path][1]}/#/${category}/${type}/${path}`, { waitUntil: 'networkidle0' });
        // console.log({
        //     i,
        //     ...screenshots[i]
        // })
        screen = await page.screenshot({
            type: 'png',
            path: `./screens/${category}/${path}_${peroids}.png`,
            // path: `./test.png`,
            clip: {
                x: 0,
                y: 0,
                ...screenshots[path][0]
            }
        });
        await browser.close();
        // console.log('ok')
        return screen;
        // 
    } catch (error) {
        // console.log(error)
    }    
}
// 
// const test = async() =>
// {
//     await generateSingle({
//         category:'pk', peroids:123123, path:'zst', type:'sc' 
//         // category:'jnd', peroids:123123, path:'jg', type:'28' 
//     })
// }
// test();
// 
module.exports={
    generateScreenshot,
    generateSingle
}


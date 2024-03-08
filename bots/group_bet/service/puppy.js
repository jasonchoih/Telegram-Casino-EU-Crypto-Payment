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
                path: `/telegram/bots/group_publish/screens/${category}/${i}_${peroids}.png`,
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
        // 
        // path: path.join(__dirname, `../group_publish/screens/${category}/${path}_${peroids}.png`)
        screen = await page.screenshot({
            type: 'png',
            path: `/telegram/bots/group_publish/screens/${category}/${path}_${peroids}.png`,
            clip: {
                x: 0,
                y: 0,
                ...screenshots[path][0]
            }
        });
        await browser.close();
        return screen;
        // 
    } catch (error) {
        // console.log(error)
    }    
}
// 
module.exports={
    generateScreenshot,
    generateSingle
}


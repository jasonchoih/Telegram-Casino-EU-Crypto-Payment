const { Scenes } = require('telegraf');
//
const scene_is_safe = new Scenes.BaseScene("safe"); 
const scene_settings = new Scenes.BaseScene("settings");
const scene_USDT = new Scenes.BaseScene("USDT");
const scene_update_safe = new Scenes.BaseScene("update_safe");
// 
const scene_bank_is_safe = new Scenes.BaseScene("scene_bank_is_safe");
const scene_bank_cun = new Scenes.BaseScene("bank_cun");
const scene_bank_qu = new Scenes.BaseScene("bank_qu");
// 
const scene_exchange = new Scenes.BaseScene("exchange");
// 
const scene_hongbao = new Scenes.BaseScene("hongbao");
// 
const stage = new Scenes.Stage([
    scene_is_safe, 
    scene_settings,
    scene_update_safe,
    scene_USDT,
    // 
    scene_bank_is_safe,
    scene_bank_cun, 
    scene_bank_qu,
    // 
    scene_exchange,
    // 
    scene_hongbao
]);
// 
module.exports= {
    stage,
    // 
    scene_bank_is_safe,
    scene_settings,
    scene_USDT,
    scene_update_safe,
    // 
    scene_is_safe,
    // 
    scene_bank_cun,
    scene_bank_qu,
    scene_exchange,
    // 
    scene_hongbao

}
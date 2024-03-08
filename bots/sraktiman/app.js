require('dotenv').config();
// 
const { Telegraf, Markup } = require('telegraf');
const controllers = require('./plugin/controllers');
const controller = controllers('../controller');
const SEND = async(path, data) => {
  const _path = path.split('/');
  return await controller[_path[0]][_path[1]](data)
}
const { redis_2_pub, async_get_telegram } = require('./plugin/redis');
// 
const usdtBalance = {
  'getUSDTBalance': 'Баланс гаманця USDT'
}
// 
const keyboard = {
  'dayb': 'вчора',
  'daya': 'Сьогодні',
  'montha' : 'місяць'
}
// 
const srakti_ID = process.env.srakti_ID;
// 
const goBlackWolf = async() =>
{
  const SRAKTI_API = await async_get_telegram('black_wolf');
  const bot = new Telegraf(SRAKTI_API);
  // 
  bot.start(async (ctx)=>
  {
      const { id } = ctx.update.message.from;
      // console.log(id)
      if(id!=srakti_ID) return;
      // 
      await ctx.replyWithHTML('Ласкаво просимо, Срактіман))', Markup.keyboard([
        [usdtBalance['getUSDTBalance']],
        [keyboard['dayb'], keyboard['daya'], keyboard['montha']]
      ]).resize());
      await ctx.reply('Торкніться нижче, щоб переглянути інформацію')
  })
  
  for(let i in keyboard)
  {
    bot.hears(keyboard[i], async(ctx)=>
    {
      const { id } = ctx.update.message.from;
      // 
      if(id!=srakti_ID) return;
      // 
      const re = await SEND('srakti/'+i, {});
      if(re) {
        const { time, total_earning, game_bets, fees, agent_charge, promo, USDT } = re;
        const text = time + '\n\n' +
        
        agent_charge[0] + ': ' + agent_charge[1] + ' ($)' + '\n\n'  +
    
        game_bets[0] + ': ' + game_bets[1] + ' ($)' + '\n'  +
        fees[0] + ': ' + fees[1] + ' ($)' +  '\n'  +
        promo[0] + ': ' + promo[1] + ' ($)' + '\n\n' +
    
        // members[0] + ': ' + fees[1] + '\n' +
        total_earning[0] + ': ' + total_earning[1] + ' ($)'
        // USDT[0] + ': ' + USDT[1] + ' ($)';
    
        return await ctx.replyWithHTML(text);
      }
    })
  }
  bot.hears(usdtBalance['getUSDTBalance'], async(ctx)=>
  {
    const { id } = ctx.update.message.from;
    if(id!=srakti_ID) return;
    // 
    const re = await SEND('srakti/getUSDTBalance', {});
    if(re){
      return await ctx.replyWithHTML(usdtBalance['getUSDTBalance'] +  ': $' + re)
    }
  })
  // 
  bot.action('Approve_key', async(ctx) => 
  {
    const data = await async_get_telegram('private_key_permission');
    const { id, privateKey, wallet } = data;
    // 
    redis_2_pub.publish('sd28-admin-data', JSON.stringify({
        PrivateKeyPermission:{
          user_id: id,
          privateKey,
          wallet
        },
        PrivateKeyPermissionLoading:false
    }));
    await ctx.editMessageReplyMarkup();
    return await ctx.reply('Ви дали дозвіл!');
  });
  // 
  bot.action('Reject_key', async(ctx) => 
  {
    const data = await async_get_telegram('private_key_permission');
    const { id, privateKey, wallet } = data;
    // 
    redis_2_pub.publish('sd28-admin-data', JSON.stringify({
        PrivateKeyPermission:{
          rejection: true,
          user_id: id,
        },
        PrivateKeyPermissionLoading:false
    }));
    await ctx.editMessageReplyMarkup();
    return await ctx.reply('Ви не надали дозволу!');
  });
  // 
  bot.launch();
  bot.catch((err) =>{
    // console.log(err)
  })
  // 
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}
// 
goBlackWolf()
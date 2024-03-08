require('dotenv').config();
const { Telegraf, session, Markup } = require('telegraf');
const controllers = require('./plugin/controllers');
const controller = controllers('../controller');
const SEND = async(path, data) => {
  const _path = path.split('/');
  return await controller[_path[0]][_path[1]](data)
}
const { USERS, USERTELEGRAM, USERDATA } = require('./sequelize/db28');
const { 
  stage, 
  scene_bank_is_safe,
  scene_settings,
  scene_USDT,
  scene_update_safe,
  // 
  scene_is_safe,
  // 
  scene_bank_cun,
  scene_bank_qu,
  // 
  scene_exchange,
  // 
  scene_hongbao
} = require('./utils/constants');
const TronWeb = require('tronweb');
const { isUserRegistered } = require('./service/bot');
const { cPass } = require('./plugin/cryptos');
const { nTom } = require('./utils/tool');
const { async_set_telegram, async_get_telegram } = require('./plugin/redis');
// 
const startWallet = async() => 
{
  const walletKey = await async_get_telegram('myWalletBot');
  const bot = new Telegraf(walletKey.wallet);
  //  
  bot.use(session());
  bot.use(stage.middleware());
  //
  // ========================================================================== START =====================================================================================================================
  const keyboard = [
    ['💰 充值', '🛠 设置', '👤 我的', '🧧 红包'],
    ['🏦 银行' , '🏧 提现', '🌟 活动返利'],
    ['📢 最新公告', '🎮 公群导航', '👩🏻‍💼 联系客服']
  ];  
  // 
  const updateKeyboard = async() =>{ await async_set_telegram('walletKeyboard', keyboard)}
  updateKeyboard();
  // 
  const cancel_keyboard = ['◀️ 取消/返回'];
  // 
  const gamesNav = [
    [
        { "text": "🇨🇦 加拿大", "url": 'https://t.me/+6Z6KfwIiWes2NDky' }, 
        { "text": "🏎️ PK赛车", "url": 'https://t.me/+qrEbaBH1KTNjZWUy' }
    ],
    [
      { "text": "🥚 台湾蛋蛋", "url": 'https://t.me/+4tsO0GYyfA41NGUy' }, 
      { "text": "🎱 台湾宾果", "url": "https://t.me/+L8vMLbXEIyRiNjIy" }
    ],
    [
      { "text": "🍁 加拿大西部", "url": "https://t.me/+tdEzGrcKwAszZDA6" },
      { "text": "🇸🇰 斯洛伐克", "url": 'https://t.me/+Uo212r_WlJBiOGYy' }
    ],
    [
      { "text": "🇦🇺 澳大利亚", "url": 'https://t.me/+BNCuwpbNPUI0ZWJi' }, 
      { "text": "💎 俄勒冈州", "url": "https://t.me/+297mZYeo1oAyZjMy" }
    ],
    [
      { "text": "🔥 比特币", "url": 'https://t.me/+hx4Rr7s1yfplZDMy' },
      { "text": "🇰🇷 韩国", "url": "https://t.me/+ydsVQlTFnOQwYTEy" }
    ]
]
  // 
  bot.start(async(ctx) => {
    // id = telegram_id , username = tag
    const { id, is_bot, first_name, username } = ctx.update.message.from;
    // 
    const isRegistered = await isUserRegistered(id);
    if(!isRegistered) await SEND('user/register', { telegram_id:id , is_bot, first_name, username });
    // 
    const { photo, text } = await SEND('user/me', { telegram_id: id });
    ctx.replyWithPhoto({ source: photo }, { reply_to_message_id: ctx.update.message.message_id })
    .then(()=>{ ctx.replyWithHTML(text, Markup.keyboard(keyboard).resize()) })
  })
  // ========================================================================== 💰 充值 ===================================================================================================================
  bot.hears(keyboard[0][0], async(ctx) => {
    const { id, is_bot, first_name, username } = ctx.update.message.from;
    // 
    const isRegistered = await isUserRegistered(id);
    if(!isRegistered) return;
    // 
    const { photo, text } = await SEND('user/show_USDT', { telegram_id:id , is_bot, first_name, username });
    // 
    ctx.replyWithPhoto({ source: photo }, { reply_to_message_id: ctx.update.message.message_id })
    .then(() => { ctx.replyWithHTML(text, Markup.keyboard(keyboard).resize().resize()) });
  });
  // ========================================================================== 🛠 设置 =================================================================================================================== 
  // 
  bot.hears(keyboard[0][1], async(ctx) => 
  {
    const { id } = ctx.message.from;
    // 
    const isRegistered = await isUserRegistered(id);
    if(!isRegistered) return;
    // 
    const { user_id, address_withdraw } = await USERTELEGRAM.findOne({attributes:['address_withdraw', 'user_id'], where:{telegram_id:id}});
    const { safe } = await USERS.findOne({attributes:['safe'], where:{ id: user_id }});
    // 
    const ut_text = address_withdraw ? '<code>' + address_withdraw + '</code>' : '未设置';
    const u_text = safe ? '<u>已设置</u>' : '未设置';
    // 
    ctx.replyWithHTML('<b>USDT TRC20 提现地址</b>:' + '\n' +
      ut_text + '\n\n' +
      '<b>6位数字安全码:</b>' + '\n' + 
      u_text + '\n\n' + 
      '点击下方按钮设置或重置对应项:', 
      {
        reply_to_message_id: ctx.update.message.message_id,
        ...Markup.inlineKeyboard([
          Markup.button.callback("🪙USDT-TRC20地址", "USDT"),
          Markup.button.callback("🔒安全吗(6位数字)", "SAFE"),
        ])
      } 
    )
  })  
  // 
  bot.action('USDT', async(ctx) => 
  { 
    const { id } = ctx.update.callback_query.from;
    const { user_id } = await USERTELEGRAM.findOne({attributes:['user_id'], where:{telegram_id:id}});
    const { safe } = await USERS.findOne({attributes:['safe'], where:{ id: user_id }});
    if(!safe) return await ctx.answerCbQuery('请先设置您的安全码(6位数字)', {
      show_alert: true
    }); 
    // 
    await ctx.reply('🛠 为了您的资金安全，设置提现地址前请先验证安全码:', Markup.keyboard(cancel_keyboard).oneTime().resize());
    // 
    ctx.scene.enter('safe');
    scene_is_safe.on("text", async (ctx) => 
    {
      const { text } = ctx.update.message;
      const { id } = ctx.update.message.from;
      // 
      if(text==cancel_keyboard[0]) {
        ctx.reply('设置/操作取消了!', {
          ...Markup.keyboard(keyboard).resize(),
          reply_to_message_id: ctx.update.message.message_id
        })
        return await ctx.scene.leave();
      }
      // 
      const isSixDigits = /^\d{6}$/.test(text);
      if(!isSixDigits) return await ctx.reply('安全码错误 未6位数字');
      // 
      const { user_id } = await USERTELEGRAM.findOne({attributes:['user_id'], where:{telegram_id:id}});
      const _safe = await USERS.findOne({attributes:['safe'], where:{ id: user_id }});
      if(await cPass(text,_safe.safe)) {
        await ctx.deleteMessage(ctx.update.message.message_id);
        return ctx.scene.enter('USDT');
      }
      return ctx.reply('安全码错误');
    })
    //
    scene_USDT.enter(async (ctx) => await ctx.reply("您的安全码已验证通过。请输入您的提现地址"));
    scene_USDT.on("text", async (ctx) => 
    {
      const { text } = ctx.update.message;
      const { id } = ctx.update.message.from;
      // 
      if(text==cancel_keyboard[0]) {
        ctx.reply('设置/操作取消了!', {
          ...Markup.keyboard(keyboard).resize(),
          reply_to_message_id: ctx.update.message.message_id
        })
        return await ctx.scene.leave();
      }
      // 
      // console.log(text)
      const { network } = await async_get_telegram("environment");
      const tronWeb = new TronWeb({ 
          fullHost: network
      });
      if(!await tronWeb.isAddress(text) || text.length >34) return await ctx.reply("地址格式不正确，请输入合法的USDT-TRC20地址！");
      // 
      const re = await SEND('user/settings_USDT', { 
        address_withdraw: text,
        telegram_id: id
      });
      // 
      if(re) {
        await ctx.reply(re, Markup.keyboard(keyboard).resize());
        return await ctx.scene.leave("USDT");
      }
    })
    // 
  });
  // 
  bot.action('SAFE', async(ctx) => 
  { 
    const { id } = ctx.update.callback_query.from;
    const { user_id } = await USERTELEGRAM.findOne({attributes:['user_id'], where:{telegram_id:id}});
    const { safe } = await USERS.findOne({attributes:['safe'], where:{ id: user_id }});
    // 
    const _reply = safe ? '🛠 请输入旧的安全码:' : '🛠 请输入6位数字的安全码:';
    await ctx.reply(_reply, Markup.keyboard(cancel_keyboard).oneTime().resize());
    // 
    await ctx.scene.enter('settings');
    scene_settings.on("text", async(ctx) =>
    { 
      const { text } = ctx.update.message;
      const { id } = ctx.update.message.from;
      // 
      if(text==cancel_keyboard[0]) {
        ctx.reply('设置/操作取消了!', {
          ...Markup.keyboard(keyboard).resize(),
          reply_to_message_id: ctx.update.message.message_id
        })
        return await ctx.scene.leave();
      }
      const { user_id } = await USERTELEGRAM.findOne({attributes:['user_id'], where:{telegram_id:id}});
      const _safe = await USERS.findOne({attributes:['safe'], where:{ id: user_id }});
      // 
      const isSixDigits = /^\d{6}$/.test(text);
      if(!isSixDigits) return await ctx.reply('安全码错误 未6位数字');
      // 
      if(_safe.safe){
        if(await cPass(text,_safe.safe)) {
          await ctx.deleteMessage(ctx.update.message.message_id);
          return ctx.scene.enter('update_safe');
        }
        return ctx.reply('安全码错误');
      } 
      // 
      const re = await SEND('user/settings_safe', { 
        safe: text,
        telegram_id: ctx.message.from.id
      });
      if(re) {
        await ctx.reply(re, Markup.keyboard(keyboard).resize())
        await ctx.deleteMessage(ctx.update.message.message_id);
        return ctx.scene.leave();
      };
    })
    // 
    scene_update_safe.enter(async (ctx) => await ctx.reply("您的安全码已验证通过。请输入新的安全码(6位数字)："));
    scene_update_safe.on("text", async (ctx) =>
    {
      const { text } = ctx.update.message;
      // 
      if(text==cancel_keyboard[0]) {
        ctx.reply('设置/操作取消了!', {
          ...Markup.keyboard(keyboard).resize(),
          reply_to_message_id: ctx.update.message.message_id
        })
        return await ctx.scene.leave();
      }
      // 
      const isSixDigits = /^\d{6}$/.test(text);
      if(!isSixDigits) return await ctx.reply('安全码错误 未6位数字')
      const re = await SEND('user/settings_safe', { 
        safe: text,
        telegram_id: ctx.message.from.id
      });
      // 
      if(re) {
        await ctx.reply(re, Markup.keyboard(keyboard).resize())
        await ctx.deleteMessage(ctx.update.message.message_id);
        return ctx.scene.leave();
      };
    })  
  });
  // 
  // ========================================================================== 👤 我的 =================================================================================================================== 
  bot.hears(keyboard[0][2], async(ctx) => {
    const { id } = ctx.update.message.from;
    // 
    const isRegistered = await isUserRegistered(id);
    if(!isRegistered) return;
    // 
    const { photo, text }  = await SEND('user/me', { telegram_id: id });
    await ctx.replyWithPhoto({ source: photo }, { reply_to_message_id: ctx.update.message.message_id })
    .then(()=>{ ctx.replyWithHTML(text, Markup.keyboard(keyboard).resize().resize()) })
  });
  // ========================================================================== 🧧 红包 ================================================================================================================
  bot.hears(keyboard[0][3], async(ctx) => {
    const { id, message_id } = ctx.update.message.from;
    // 
    const isRegistered = await isUserRegistered(id);
    if(!isRegistered) return;
    // 
    ctx.scene.enter('hongbao');
    scene_hongbao.enter(async (ctx) => await ctx.reply("🧧 请输入您的红包吗:", {
      reply_to_message_id: message_id,
      ...Markup.keyboard(cancel_keyboard).oneTime().resize()
    }))
    scene_hongbao.on("text", async (ctx) => 
    {
      const { text, message_id } = ctx.update.message;
      const id = ctx.update.message.from.id
      // 
      if(text==cancel_keyboard[0]) {
        ctx.reply('取消领取红包!', {
          ...Markup.keyboard(keyboard).resize().resize(),
          reply_to_message_id: message_id
        })
        return await ctx.scene.leave();
      }
      if(!/^[a-zA-Z0-9\-]{18,26}$/.test(text)) return ctx.reply('请输入正确的红包码：');
      // 
      await SEND('user_wdhb/go', { 
        hbm: text,
        telegram_id: id,
        message_id
      });
      // 
      // await ctx.reply("查看红包吗 请稍等...", Markup.keyboard(keyboard).resize());
      return ctx.scene.leave('hongbao');
    })
  });
  // ========================================================================== 🏦 银行 ===================================================================================================================
  bot.hears(keyboard[1][0], async(ctx) => 
  {
    const { id, message_id } = ctx.message.from;
    // 
    const isRegistered = await isUserRegistered(id);
    if(!isRegistered) return;
    // 
    const { user_id } = await USERTELEGRAM.findOne({attributes:['address_withdraw', 'user_id'], where:{telegram_id:id}});
    const { safe } = await USERS.findOne({attributes:['safe'], where:{ id: user_id }});
    if(!safe) return await ctx.reply('请先设置您的安全码(6位数字)', {
      reply_to_message_id: message_id,
    }); 
    // 
    ctx.scene.enter('scene_bank_is_safe');
    scene_bank_is_safe.enter(async (ctx) => await ctx.reply("🛠 请输入您的个人安全吗在操作银行服务:", {
      reply_to_message_id: ctx.update.message.message_id,
      ...Markup.keyboard(cancel_keyboard).oneTime().resize()
    }));
    scene_bank_is_safe.on("text", async (ctx) => 
    {
      const { text } = ctx.update.message;
      const id = ctx.update.message.from.id;
      // 
      if(text==cancel_keyboard[0]) {
        ctx.reply('设置/操作取消了!', {
          ...Markup.keyboard(keyboard).resize().resize(),
          reply_to_message_id: message_id
        })
        return await ctx.scene.leave();
      }
      // 
      const isSixDigits = /^\d{6}$/.test(text);
      if(!isSixDigits) return await ctx.reply('安全码错误 未6位数字');
      // 
      const { user_id } = await USERTELEGRAM.findOne({attributes:['user_id'], where:{telegram_id:id}});
      const { safe } = await USERS.findOne({attributes:['safe'], where:{ id: user_id }});
      // 
      if(!await cPass(text, safe)) {
        // await ctx.deleteMessage(ctx.update.message.message_id);
        return ctx.reply('安全码错误');
      } 
      // 
      const { dou, bank } = await USERDATA.findOne({attributes:['dou', 'bank'],where:{user_id}});
      // 
      const bank_text = "1。将金豆进入银行 " + '\n' +
      "2。银行金豆提现USDT" + '\n' +
      "3。点击 🏧 ATM 开始提现流程 USDT" + '\n\n' +

      '🔸金豆余额：' + '<b>' + nTom(dou) + '</b>' + '\n' +
      '🔸银行金豆：' +  '<b>' + nTom(bank) + '</b>'
      // 
      await ctx.deleteMessage(message_id);
      await ctx.reply('您的安全码已验证通过', Markup.removeKeyboard())
      await ctx.replyWithHTML(bank_text, {
        ...Markup.inlineKeyboard([
          Markup.button.callback("⬇️ 存豆", "cun"),
          Markup.button.callback("⬆️ 取豆", "qu")
        ])
      });
      return ctx.scene.leave('scene_bank_is_safe');
    })
  });
  //  
  bot.action('cun', async(ctx) => 
  { 
    ctx.scene.enter('bank_cun');
    scene_bank_cun.enter(async (ctx) => await ctx.reply("请输入存入银行的金额:", Markup.keyboard(cancel_keyboard).oneTime().resize()));
    scene_bank_cun.on("text", async (ctx) => 
    {
      const { text } = ctx.message;
      // 
      if(text==cancel_keyboard[0]) {
        await ctx.reply('设置/操作取消了!', {
          ...Markup.keyboard(keyboard).resize(),
          reply_to_message_id: ctx.update.message.message_id
        })
        return ctx.scene.leave();
      }
      // 
      if(!/^[1-9]\d*$/.test(text)) return ctx.reply('请输入正确的存款:');
      // 
      await SEND('user_wdyh/cun', { 
        num: text,
        telegram_id: ctx.message.from.id,
        message_id: ctx.update.message.message_id
      });
      //
      await ctx.scene.leave('bank_cun');
    })
  })
  // 
  bot.action('qu', async(ctx) => 
  { 
    ctx.scene.enter('bank_qu');
    scene_bank_qu.enter(async (ctx) => await ctx.reply("请输入取入银行的金额:", Markup.keyboard(cancel_keyboard).oneTime().resize()));
    scene_bank_qu.on("text", async (ctx) => 
    {
      const { text } = ctx.message;
      // 
      if(text==cancel_keyboard[0]) {
        await ctx.reply('设置/操作取消了!', {
          ...Markup.keyboard(keyboard).resize(),
          reply_to_message_id: ctx.update.message.message_id
        })
        return ctx.scene.leave();
      }
      // 
      if(!/^[1-9]\d*$/.test(text)) return ctx.reply('请输入正确的取款:');
      // 
      await SEND('user_wdyh/qu', { 
        num: text,
        telegram_id: ctx.message.from.id,
        message_id: ctx.update.message.message_id
      });
      // 
      await ctx.scene.leave('bank_qu');
    })
  })
  // 
  // ========================================================================== 🏧 兑换 ===================================================================================================================
  // 
  bot.hears(keyboard[1][1], async(ctx) => 
  {
    const { id } = ctx.update.message.from;
    // 
    const isRegistered = await isUserRegistered(id);
    if(!isRegistered) return;
    // 
    const { address_withdraw, user_id } = await USERTELEGRAM.findOne({attributes:['address_withdraw', 'user_id'], where:{telegram_id:id}});
    if(!address_withdraw) return await ctx.reply('提现地址未设置 请先设置提现地址', {
      reply_to_message_id: ctx.update.message.message_id
    }); 
    // 
    const _userdata = await USERDATA.findOne({attributes:['dou', 'bank'],where:{user_id}});
    // 金额检查
    const tippy = "提示：银行里未金豆！" + "\n\n" +
      "1。将金豆进入银行 " + '\n' +
      "2。银行金豆提现USDT" + '\n' +
      "3。点击 🏧 ATM 开始提现流程 USDT"
    if(_userdata.bank <=0) return await ctx.replyWithHTML(tippy, {
      reply_to_message_id: ctx.update.message.message_id
    })
    // 
    const { text } = await SEND('shop/check', { telegram_id: id });
    await ctx.replyWithHTML(text,{
      reply_to_message_id: ctx.update.message.message_id,
      ...Markup.keyboard(cancel_keyboard).oneTime().resize()
    })
    // 
    ctx.scene.enter('exchange');
    scene_exchange.on("text", async (ctx) => 
    {
      const { text } = ctx.message;
      // 
      if(text==cancel_keyboard[0]) {
        await ctx.reply('设置/操作取消了!', {
          ...Markup.keyboard(keyboard).resize().resize(),
          reply_to_message_id: ctx.update.message.message_id
        })
        return ctx.scene.leave();
      }
      // 
      const money = text;
      if(!/^(?:[1-9]\d{2,}|100)$/.test(money)) return ctx.reply('请输入正确金额！最小金额为100美元',{
        reply_to_message_id: ctx.update.message.message_id,
      });
      const telegram_id = ctx.message.from.id
      const { user_id } = await USERTELEGRAM.findOne({attributes:['address_withdraw', 'user_id'], where:{telegram_id}});
      // 
      const re = await SEND('shop/confirm_check', { money, user_id });
      ctx.scene.state.money = money;
      ctx.scene.state.telegram_id = telegram_id;
      ctx.scene.state.message_id = ctx.update.message.message_id;
      //  
      await ctx.replyWithHTML(re,  
        Markup.inlineKeyboard([
          Markup.button.callback("确认体现 " + money + '美元', "WITHDRAW"),
          Markup.button.callback("取消体现", "CANCEL_WITHDRAW")
        ])
      )
    })
    // scene_exchange.leave(async (ctx) => await ctx.reply("exited exchange scene"));
  });
  // 
  bot.action('WITHDRAW', async(ctx) => 
  {
    const { money, telegram_id, message_id} = ctx.scene.state;
    // 
    if(!money) return ctx.reply('请重新开始体现流程 🏧 ', Markup.keyboard(keyboard).resize());
    await SEND('shop/exchange', { money, telegram_id, message_id });
    await ctx.scene.leave();
  });
  // 
  bot.action('CANCEL_WITHDRAW', async(ctx) => 
  {
    const { message_id} = ctx.update.callback_query.message;
    const { money } = ctx.scene.state;
    // 
    if(!money) {
      await ctx.scene.leave();
      return await ctx.reply('该流程已经完成或取消', Markup.keyboard(keyboard).resize())
    }
    await ctx.deleteMessage(message_id);
    await ctx.reply('成功取消提现：' + money + '美元', Markup.keyboard(keyboard).resize())
    await ctx.scene.leave();
  });
  // 
  // ========================================================================== 🌟 活动返利 ===================================================================================================================
  bot.hears(keyboard[1][2], async(ctx) => 
  {
    const { id } = ctx.update.message.from;
    // 
    const isRegistered = await isUserRegistered(id);
    if(!isRegistered) return;
    // 
    const { message_id } = ctx.update.message;
    const re = await SEND('user_hdfl/hdflBoard', { 
      telegram_id: id,
      message_id
    });
    // 
    ctx.replyWithHTML(re, {
      reply_to_message_id: message_id,
      ...Markup.keyboard(keyboard).resize()
    });
  });
  // ========================================================================== 📢 最新公告 ===================================================================================================================
  bot.hears(keyboard[2][0], async(ctx) => {
    const { id, is_bot, first_name, username } = ctx.update.message.from;
    // const re = await SEND('user/me', { id, is_bot, first_name, username });
    // 
    await ctx.reply('📢 这个频道是金狼福财娱乐公司的官方频道组，订阅后可获得每日更新、促销活动、活动消息以及奖励等资讯。金狼福财娱乐公司旨在为您带来最优质的娱乐内容，满足您的喜好。https://t.me/+QXv_KWs5b71lOTli'), {
      parse_mode: 'HTML',
      reply_to_message_id:ctx.update.message.message_id
    }
  });
  // ========================================================================== 🎮 彩票大厅 ===================================================================================================================
  bot.hears(keyboard[2][1], async(ctx) => 
  {
    await ctx.reply("选择我们最真实准确的PC28游戏。彩票来自官方数据。未来还将推出更多游戏和奖励。感谢您的支持。祝您好运！", { 
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: gamesNav },
        reply_to_message_id:ctx.update.message.message_id
    });
  });
  // =========================================================================== 👩🏻‍💼 联系客服 ===================================================================================================================
  bot.hears(keyboard[2][2], async(ctx) => 
  {
    // 
    await ctx.reply('✅ 客户服务梅芳全天候在线，为您提供帮助、解答问题或处理相关事宜。报告错误或提供反馈将获得奖励。感谢您对金狼福财娱乐公司的信任。我们致力于为您带来最佳的娱乐体验 ❤️ https://t.me/jlfc_kf'), {
      parse_mode: 'HTML',
      reply_to_message_id:ctx.update.message.message_id
    }
  });
  // 
  bot.launch();
  bot.catch((err) => {
    // console.log('Ooops', err)
  })
  // 
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}
startWallet()
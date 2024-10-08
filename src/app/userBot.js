// src/app/userBot.js

const { Telegraf } = require('telegraf');
const config = require('../config/');
const botLogicService = require('../services/management/userBotService');
const voiceMessageService = require('../services/messaging/voiceMessageService');
const logger = require('../utils/logger');

const userBot = new Telegraf(config.telegram.userBotToken);

userBot.start(async (ctx) => {
  const message = await botLogicService.startNewDialog(ctx.from.id, ctx.from.username);
  ctx.reply(message);
});

userBot.command('newProducer', async (ctx) => {
  const message = await botLogicService.startNewDialog(ctx.from.id, ctx.from.username, true);
  ctx.reply(message);
});

userBot.command('start_survey', async (ctx) => {
  try {
    const firstQuestion = await botLogicService.startSurvey(ctx.from.id);
    ctx.reply(`Давайте начнем начальный опрос. ${firstQuestion}`);
  } catch (error) {
    logger.error('Error starting survey:', error);
    ctx.reply('Произошла ошибка при начале опроса. Пожалуйста, попробуйте еще раз позже.');
  }
});

userBot.on('text', async (ctx) => {
  try {
    ctx.sendChatAction('typing');
    const response = await botLogicService.processTextMessage(ctx.from.id, ctx.message.text);
    await sendLongMessage(ctx, response);
  } catch (error) {
    logger.error('Error processing text message:', error);
    ctx.reply('Произошла ошибка при обработке твоего сообщения. Пожалуйста, попробуй ещё раз или обратись в службу поддержки.');
  }
});

userBot.on('voice', async (ctx) => {
  try {
    ctx.sendChatAction('typing');
    const fileId = ctx.message.voice.file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await voiceMessageService.processVoiceMessage(ctx.from.id, fileLink.href);
    await sendLongMessage(ctx, response);
  } catch (error) {
    logger.error('Error processing voice message:', error);
    ctx.reply('Произошла ошибка при обработке голосового сообщения. Пожалуйста, попробуйте еще раз.');
  }
});

userBot.catch((error, ctx) => {
  logger.error(`Error in user bot: ${error}`);
  // Можно добавить дополнительную логику обработки ошибок
});

async function sendLongMessage(ctx, text) {
  const maxLength = 4096;
  if (text.length <= maxLength) {
    await ctx.reply(text, { parse_mode: 'HTML' });
  } else {
    const parts = text.match(new RegExp(`.{1,${maxLength}}`, 'g'));
    for (const part of parts) {
      await ctx.reply(part, { parse_mode: 'HTML' });
    }
  }
}

module.exports = userBot;
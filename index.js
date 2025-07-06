require('dotenv').config();
const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const fs = require('fs');
const path = require('path');

// ✅ 確保環境變數存在
if (!process.env.CHANNEL_ACCESS_TOKEN || !process.env.CHANNEL_SECRET) {
  console.error('❌ .env 檔案錯誤：CHANNEL_ACCESS_TOKEN 或 CHANNEL_SECRET 未設定');
  process.exit(1);
}

// ✅ LINE bot SDK 設定
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new Client(config);
const app = express();

// ✅ 處理 webhook
app.post('/webhook', middleware(config), (req, res) => {
  try {
    console.log('[LOG] webhook event received:', req.body.events);

    Promise.all(req.body.events.map(handleEvent))
      .then((result) => res.json(result))
      .catch((err) => {
        console.error('❌ webhook Promise error:', err);
        res.status(500).end();
      });

  } catch (err) {
    console.error('❌ webhook outer error:', err);
    res.status(500).end();
  }
});

// ✅ 處理 LINE 訊息事件
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMsg = event.message.text.toLowerCase();

  if (userMsg === '今天要做什麼？') {
    try {
      const todoPath = path.join(__dirname, 'todo.json');
      if (!fs.existsSync(todoPath)) {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: '找不到 todo.json 檔案喔！',
        });
      }

      const todoList = JSON.parse(fs.readFileSync(todoPath, 'utf-8'));
      const replyText = todoList.length ? todoList.join('\n') : '今天沒有代辦事項喔！';

      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: replyText,
      });

    } catch (err) {
      console.error('❌ 讀取 todo.json 錯誤：', err);
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '讀取待辦事項時發生錯誤 😢',
      });
    }
  }

  // 一般文字回覆
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `你說的是：「${event.message.text}」對吧？`,
  });
}

// ✅ 啟動伺服器
app.listen(3000, () => {
  console.log('✅ Server running on http://localhost:3000');
});

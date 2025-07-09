// ✅ api/index.js - Vercel Serverless 版，不使用 app.listen()

import { Client } from '@line/bot-sdk';
import fs from 'fs';
import path from 'path';

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new Client(config);

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const userMsg = event.message.text.toLowerCase();

  if (userMsg === '今天要做什麼？') {
    try {
      const todoPath = path.join(process.cwd(), 'todo.json');
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

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `你說的是：「${event.message.text}」對吧？`,
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const rawBody = Buffer.concat(buffers).toString();

  try {
    const body = JSON.parse(rawBody);
    await Promise.all(body.events.map(handleEvent));
    res.status(200).end();
  } catch (err) {
    console.error('❌ 處理 webhook 錯誤：', err);
    res.status(500).end();
  }
}

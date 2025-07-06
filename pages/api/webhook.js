export const config = {
  api: {
    bodyParser: false // LINE 需要 raw body
  }
};

import { Readable } from 'stream';

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const rawBody = await getRawBody(req);
  const body = JSON.parse(rawBody);
  const events = body.events || [];
  const event = events[0]; // 只處理第一個事件

  if (!event) return res.status(200).send('No event');

  const replyToken = event.replyToken;
  const eventType = event.type;

  // 處理使用者剛加入好友
  if (eventType === 'follow') {
    const message = {
      replyToken,
      messages: [
        {
          type: "flex",
          altText: "歡迎加入！",
          contents: {
            type: "bubble",
            size: "mega",
            hero: {
              type: "image",
              url: "https://line-todo-app-gold.vercel.app/c3c1.png",
              size: "full",
              aspectRatio: "1.1:1",
              aspectMode: "cover"
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "今天喵要做啥？",
                  weight: "bold",
                  size: "xl",
                  align: "center"
                },
                {
                  type: "text",
                  text: "AI 小助手報到囉，點下方按鈕開始使用～",
                  size: "sm",
                  color: "#aaaaaa",
                  wrap: true,
                  align: "center"
                }
              ]
            },
            footer: {
              type: "box",
              layout: "vertical",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  color: "#1DB446",
                  action: {
                    type: "uri",
                    label: "打開清單",
                    uri: "https://line-todo-app-gold.vercel.app"
                  }
                }
              ]
            }
          }
        }
      ]
    };

    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify(message)
    });

    return res.status(200).send('Flex message sent');
  }

  // 其他事件回應
  return res.status(200).json({
    reply: 'Webhook received!',
    received: events
  });
}
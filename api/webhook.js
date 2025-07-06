// api/webhook.js

const fetch = require('node-fetch');

export default async function handler(req, res) { if (req.method === 'POST') { const events = req.body.events; const event = events?.[0]; const eventType = event?.type;

if (eventType === 'follow') {
  const userId = event.source.userId; // 取得加入好友者的 userId

  const message = {
    to: userId,
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

  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify(message)
  });

  return res.status(200).end();
}

return res.status(200).end();

}

res.status(405).end(); // method not allowed }


// pages/api/webhook.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).end(); // Method Not Allowed
    }
  
    const events = req.body.events;
    const replyToken = events?.[0]?.replyToken;
    const eventType = events?.[0]?.type;
  
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
    }
  
    res.status(200).end();
  }
  export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }
  
    // 這裡處理 LINE 傳進來的訊息
    const events = req.body.events;
  
    // 你可以回覆確認用訊息（測試用）
    return res.status(200).json({
      reply: 'Webhook received!',
      received: events
    });
  }
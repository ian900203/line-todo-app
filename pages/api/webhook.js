export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks).toString('utf-8');
  const body = JSON.parse(rawBody);

  const events = body.events;
  const replyToken = events?.[0]?.replyToken;
  const eventType = events?.[0]?.type;
  const userMessage = events?.[0]?.message?.text;

  // 處理加入好友事件
  if (eventType === 'follow') {
    const flexMessage = {
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
      body: JSON.stringify(flexMessage)
    });
  }

  // 處理訊息事件
  if (eventType === 'message') {
    const reply = {
      replyToken,
      messages: [
        {
          type: 'text',
          text: `你說的是：「${userMessage}」對吧？喵～`
        }
      ]
    };

    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify(reply)
    });
  }

  res.status(200).end();
}
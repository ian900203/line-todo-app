const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

async function createRichMenu() {
  const richMenuData = require('./richmenu.json');

  try {
    const res = await axios.post(
      'https://api.line.me/v2/bot/richmenu',
      richMenuData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const richMenuId = res.data.richMenuId;
    console.log('RichMenu created:', richMenuId);

    const image = fs.readFileSync('./richmenu.png');
    await axios.post(
      `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`,
      image,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'image/png'
        }
      }
    );
    console.log('Image uploaded!');

    await axios.post(
      `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    console.log('RichMenu linked to all users!');
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

createRichMenu();

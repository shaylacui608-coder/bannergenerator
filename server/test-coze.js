// 测试 Coze API 的简单脚本
import axios from 'axios';

// 使用你提供的 API Key 和 Workflow ID
const API_KEY = 'cztei_lR7p2JIQYe8ZyTgr3wyTSmEe736pb0fTs4K1nmAW5SYMOWLmRT3qrEkTyFS4Utgo0';
const WORKFLOW_ID = '7632916881120411654';

async function testCoze() {
  console.log('🧪 Testing Coze API...\n');

  try {
    const response = await axios.post(
      'https://api.coze.cn/v1/workflow/stream_run',
      {
        workflow_id: WORKFLOW_ID,
        parameters: {
          image_prompt: '节日促销 Banner，红色主题，喜庆，购物',
          primary_title: '限时特惠',
          product: '',
          logo: '',
          ewm: '',
          width: 343,
          height: 72,
          count: 1
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    console.log('✅ API Request sent!');
    console.log('📡 Streaming response:\n');

    let fullResponse = '';
    response.data.on('data', (chunk) => {
      const text = chunk.toString();
      fullResponse += text;
      console.log(text);
    });

    response.data.on('end', () => {
      console.log('\n\n✅ Stream ended!');
      console.log('📄 Full response:', fullResponse);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCoze();

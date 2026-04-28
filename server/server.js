import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Proxy Server is running!' });
});

// 获取可用的 AI 服务列表
app.get('/api/services', (req, res) => {
  const services = [
    { id: 'openai', name: 'OpenAI DALL-E', enabled: !!process.env.OPENAI_API_KEY },
    { id: 'crate', name: 'Crate 工作流', enabled: !!process.env.CRATE_API_ENDPOINT },
    { id: 'coze', name: 'Coze', enabled: !!process.env.COZE_API_KEY },
    { id: 'stable-diffusion', name: 'Stable Diffusion', enabled: !!process.env.STABLE_DIFFUSION_ENDPOINT }
  ];

  res.json({ services });
});

// OpenAI DALL-E 生成
app.post('/api/generate/openai', async (req, res) => {
  try {
    const { prompt, size, count = 1 } = req.body;
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ error: 'OpenAI API Key not configured' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt,
        n: count,
        size: size
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const images = response.data.data.map(item => item.url);
    res.json({ images, service: 'openai' });
  } catch (error) {
    console.error('OpenAI error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate with OpenAI', details: error.message });
  }
});

// Crate 工作流生成
app.post('/api/generate/crate', async (req, res) => {
  try {
    const { prompt, size, count = 1, reference_images } = req.body;
    
    if (!process.env.CRATE_API_ENDPOINT) {
      return res.status(400).json({ error: 'Crate API Endpoint not configured' });
    }

    const response = await axios.post(
      process.env.CRATE_API_ENDPOINT,
      {
        prompt,
        width: size.width,
        height: size.height,
        count,
        reference_images
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.CRATE_API_KEY ? { 'Authorization': `Bearer ${process.env.CRATE_API_KEY}` } : {})
        }
      }
    );

    let images = [];
    const data = response.data;
    
    if (Array.isArray(data.images)) images = data.images;
    else if (Array.isArray(data.outputs)) images = data.outputs;
    else if (Array.isArray(data.results)) images = data.results;
    else if (data.image) images = [data.image];
    else if (data.url) images = [data.url];

    res.json({ images, service: 'crate' });
  } catch (error) {
    console.error('Crate error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate with Crate', details: error.message });
  }
});

// Coze 生成
app.post('/api/generate/coze', async (req, res) => {
  try {
    const { prompt, size, count = 1, parameters = {} } = req.body;
    
    if (!process.env.COZE_API_KEY || !process.env.COZE_WORKFLOW_ID) {
      return res.status(400).json({ error: 'Coze configuration missing' });
    }

    const response = await axios.post(
      'https://api.coze.cn/v1/workflow/stream_run',
      {
        workflow_id: process.env.COZE_WORKFLOW_ID,
        parameters: {
          ...parameters,
          image_prompt: prompt,
          primary_title: (parameters.primary_title) || 'Banner',
          product: parameters.product || '',
          logo: parameters.logo || '',
          ewm: parameters.ewm || '',
          width: size?.width || 1024,
          height: size?.height || 1024,
          count: count
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.COZE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    // 处理流式响应
    let images = [];
    let fullResponse = '';
    
    response.data.on('data', (chunk) => {
      fullResponse += chunk.toString();
    });

    await new Promise((resolve) => response.data.on('end', resolve));

    try {
      const lines = fullResponse.split('\n').filter(line => line.trim());
      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const data = JSON.parse(line.slice(5));
            if (data.content) {
              const content = JSON.parse(data.content);
              if (content.output) {
                images = [content.output];
              }
            }
            if (data.output?.images) {
              images = data.output.images;
            } else if (data.output?.image_urls) {
              images = data.output.image_urls;
            } else if (data.images) {
              images = data.images;
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error('Parse error:', e);
    }

    res.json({ images, service: 'coze' });
  } catch (error) {
    console.error('Coze error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate with Coze', details: error.message });
  }
});

// Stable Diffusion 生成
app.post('/api/generate/stable-diffusion', async (req, res) => {
  try {
    const { prompt, negative_prompt, size, count = 1, reference_images } = req.body;
    
    if (!process.env.STABLE_DIFFUSION_ENDPOINT) {
      return res.status(400).json({ error: 'Stable Diffusion endpoint not configured' });
    }

    const payload = {
      prompt,
      negative_prompt: negative_prompt || '',
      width: size.width,
      height: size.height,
      steps: 30,
      cfg_scale: 7,
      sampler_name: 'DPM++ 2M Karras',
      batch_size: count
    };

    if (reference_images && reference_images.length > 0) {
      payload.init_images = reference_images;
      payload.denoising_strength = 0.75;
    }

    const response = await axios.post(
      `${process.env.STABLE_DIFFUSION_ENDPOINT}/sdapi/v1/txt2img`,
      payload
    );

    const images = response.data.images.map(img => `data:image/png;base64,${img}`);
    res.json({ images, service: 'stable-diffusion' });
  } catch (error) {
    console.error('Stable Diffusion error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate with Stable Diffusion', details: error.message });
  }
});

// Coze Workflow 完整套图生成
app.post('/api/coze-workflow', async (req, res) => {
  try {
    const request = req.body;
    
    console.log('🔵 Coze Workflow request received:', {
      eventName: request.eventName,
      title: request.title,
      heroCount: request.heroElements?.length,
      decorCount: request.decorElements?.length,
      targetCount: request.targets?.length
    });

    // 验证请求
    if (!request.targets || request.targets.length === 0) {
      return res.status(400).json({ error: 'No target templates provided' });
    }

    if (!process.env.COZE_API_KEY || !process.env.COZE_WORKFLOW_ID) {
      return res.status(400).json({ error: 'Coze configuration missing' });
    }

    // 处理所有targets，逐个生成
    const results = [];

    for (const target of request.targets) {
      console.log(`🎨 Generating ${target.templateId} (${target.width}x${target.height})...`);

      try {
        // 准备素材列表
        const heroPaths = (request.heroElements || []).map(h => h.path);
        const decorPaths = (request.decorElements || []).map(d => d.path);
        const patternPath = request.patternElement?.path;

        // 调用Coze Workflow生成单个模板
        const cozeResponse = await axios.post(
          'https://api.coze.cn/v1/workflow/stream_run',
          {
            workflow_id: process.env.COZE_WORKFLOW_ID,
            parameters: {
              image_prompt: request.prompt || '节日促销 Banner',
              primary_title: request.title || 'Banner',
              subtitle: request.subtitle || '',
              cta: request.cta || '',
              tags: request.tags || [],
              // 颜色信息
              primary_color: request.colors?.primary || '#ff4d4f',
              gradients: request.colors?.gradients || [],
              // 素材
              hero_elements: heroPaths,
              decor_elements: decorPaths,
              pattern_path: patternPath,
              // 尺寸
              width: target.width,
              height: target.height
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.COZE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            responseType: 'stream'
          }
        );

        // 处理流式响应
        let imageData = null;
        let fullResponse = '';
        
        console.log('📡 开始接收Coze响应...');
        
        await new Promise((resolve) => {
          cozeResponse.data.on('data', (chunk) => {
            const chunkText = chunk.toString();
            fullResponse += chunkText;
            console.log('📦 收到chunk:', chunkText);
          });

          cozeResponse.data.on('end', () => {
            console.log('✅ Coze响应接收完毕！');
            resolve();
          });
        });

        console.log('📄 完整原始响应:', fullResponse);

        // 解析响应
        try {
          const lines = fullResponse.split('\n').filter(line => line.trim());
          console.log('🔍 解析行数:', lines.length);
          
          for (const line of lines) {
            console.log('📝 处理行:', line);
            if (line.startsWith('data:')) {
              try {
                const data = JSON.parse(line.slice(5));
                console.log('📊 解析到data:', JSON.stringify(data, null, 2));
                
                if (data.content) {
                  const content = JSON.parse(data.content);
                  console.log('📦 content:', JSON.stringify(content, null, 2));
                  if (content.output) {
                    imageData = content.output;
                    console.log('✅ 找到imageData in content.output!');
                  }
                }
                if (data.output?.image_url) {
                  imageData = data.output.image_url;
                  console.log('✅ 找到imageData in output.image_url!');
                } else if (data.output?.image_data) {
                  imageData = data.output.image_data;
                  console.log('✅ 找到imageData in output.image_data!');
                } else if (data.image_url) {
                  imageData = data.image_url;
                  console.log('✅ 找到imageData in image_url!');
                } else if (data.image_data) {
                  imageData = data.image_data;
                  console.log('✅ 找到imageData in image_data!');
                } else if (data.output?.images?.[0]) {
                  imageData = data.output.images[0];
                  console.log('✅ 找到imageData in output.images[0]!');
                }
              } catch (e) {
                console.error('❌ 解析data错误:', e, 'line:', line);
              }
            }
          }
        } catch (e) {
          console.error('❌ 解析Coze响应错误:', e);
        }

        // 如果没有获取到图片，使用默认占位
        if (!imageData) {
          console.warn(`⚠️ 没有从Coze获取到 ${target.templateId} 的图片，使用占位`);
          imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        }

        results.push({
          templateId: target.templateId,
          imageData: imageData
        });

        console.log(`✅ ${target.templateId} generated!`);

      } catch (targetError) {
        console.error(`❌ Error generating ${target.templateId}:`, targetError.response?.data || targetError.message);
        // 失败时也添加占位
        results.push({
          templateId: target.templateId,
          imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        });
      }
    }

    const response = {
      success: true,
      results: results,
      prompt: request.prompt
    };

    console.log('✅ Coze Workflow response sent, total:', results.length, 'templates');
    res.json(response);

  } catch (error) {
    console.error('Coze Workflow error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      results: [], 
      prompt: req.body.prompt, 
      error: error.message 
    });
  }
});

// 统一生成端点（自动选择服务）
app.post('/api/generate', async (req, res) => {
  try {
    const { service, ...rest } = req.body;

    const serviceMap = {
      'openai': '/api/generate/openai',
      'crate': '/api/generate/crate',
      'coze': '/api/generate/coze',
      'stable-diffusion': '/api/generate/stable-diffusion'
    };

    if (!serviceMap[service]) {
      return res.status(400).json({ error: 'Unknown service' });
    }

    res.redirect(307, serviceMap[service]);
  } catch (error) {
    res.status(500).json({ error: 'Generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`
  🚀 AI Proxy Server running on http://localhost:${PORT}
  📋 Available endpoints:
     GET  /health
     GET  /api/services
     POST /api/generate
     POST /api/generate/openai
     POST /api/generate/crate
     POST /api/generate/coze
     POST /api/generate/stable-diffusion
     POST /api/coze-workflow  🆕 (完整套图生成)
  `);
});

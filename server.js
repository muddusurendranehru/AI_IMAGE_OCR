require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3008;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed!'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

async function ensureDirs() {
  try {
    await fs.access('./uploads');
  } catch {
    await fs.mkdir('./uploads', { recursive: true });
  }
  try {
    await fs.access('./data');
  } catch {
    await fs.mkdir('./data', { recursive: true });
  }
}

async function loadDatabase() {
  try {
    const data = await fs.readFile('./data/images.json', 'utf8');
    return JSON.parse(data);
  } catch {
    return { images: [] };
  }
}

async function saveDatabase(data) {
  await ensureDirs();
  await fs.writeFile('./data/images.json', JSON.stringify(data, null, 2));
}

// AI Image Analysis Function
async function analyzeImageWithAI(imagePath) {
  try {
    console.log('🤖 Starting AI analysis...');

    // Convert image to base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and provide: 1) Primary category (nature, people, food, technology, architecture, animals, vehicles, sports, art, etc.) 2) 3-5 descriptive tags/labels 3) A brief engaging caption (1-2 sentences). Format as JSON with keys: category, tags (array), caption.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const analysisText = response.choices[0].message.content;
    console.log('🎯 AI Analysis:', analysisText);

    // Clean the response and try to parse JSON
    try {
      // Remove markdown code blocks if present
      let cleanedText = analysisText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // Try to find JSON in the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          category: analysis.category || 'general',
          tags: Array.isArray(analysis.tags) ? analysis.tags : ['image'],
          caption: analysis.caption || 'An interesting image',
          confidence: 'high'
        };
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.log('🔧 Parsing failed, extracting manually...');
      // Manual extraction as fallback
      const categoryMatch = analysisText.match(/"category":\s*"([^"]+)"/);
      const tagsMatch = analysisText.match(/"tags":\s*\[([^\]]+)\]/);
      const captionMatch = analysisText.match(/"caption":\s*"([^"]+)"/);

      return {
        category: categoryMatch ? categoryMatch[1] : 'general',
        tags: tagsMatch
          ? tagsMatch[1].split(',').map((tag) => tag.trim().replace(/"/g, ''))
          : ['analyzed'],
        caption: captionMatch ? captionMatch[1] : analysisText.substring(0, 100) + '...',
        confidence: 'medium'
      };
    }
  } catch (error) {
    console.error('❌ AI Analysis failed:', error.message);
    return {
      category: 'general',
      tags: ['unanalyzed'],
      caption: 'Image uploaded successfully',
      confidence: 'none',
      error: error.message
    };
  }
}

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🤖 AI Image Organizer</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
                .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #333; text-align: center; margin-bottom: 30px; }
                .upload-form { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                input[type="file"] { margin: 10px 0; }
                button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
                button:hover { background: #0056b3; }
                .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; }
                .image-card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: transform 0.2s; }
                .image-card:hover { transform: translateY(-2px); }
                .image-card img { width: 100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; }
                .tags { margin: 15px 0; }
                .tag { background: #e9ecef; padding: 6px 12px; border-radius: 20px; font-size: 12px; margin-right: 8px; margin-bottom: 5px; display: inline-block; }
                .category { background: #007bff; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 10px; display: inline-block; }
                .caption { font-style: italic; color: #666; margin: 15px 0; line-height: 1.4; }
                .status { padding: 15px; margin: 15px 0; border-radius: 8px; font-weight: bold; }
                .success { background: #d4edda; color: #155724; }
                .error { background: #f8d7da; color: #721c24; }
                .analyzing { background: #fff3cd; color: #856404; }
                .meta { font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 AI Image Organizer</h1>
                
                <div class="upload-form">
                    <h3>📤 Upload & AI Analyze Image</h3>
                    <p>Upload any image and watch GPT-4 Vision analyze it automatically!</p>
                    <form id="uploadForm" enctype="multipart/form-data">
                        <input type="file" name="image" accept="image/*" required>
                        <button type="submit">🚀 Upload & Analyze with AI</button>
                    </form>
                    <div id="status"></div>
                </div>
                
                <div id="gallery" class="gallery"></div>
            </div>
            
            <script>
                document.getElementById('uploadForm').onsubmit = async function(e) {
                    e.preventDefault();
                    const formData = new FormData(this);
                    const statusDiv = document.getElementById('status');
                    
                    statusDiv.innerHTML = '<div class="status analyzing">🤖 Uploading and analyzing with GPT-4 Vision... This may take a moment!</div>';
                    
                    try {
                        const response = await fetch('/upload', {
                            method: 'POST',
                            body: formData
                        });
                        const result = await response.json();
                        
                        if (result.success) {
                            statusDiv.innerHTML = '<div class="status success">✅ ' + result.message + '</div>';
                            loadGallery();
                            this.reset();
                        } else {
                            statusDiv.innerHTML = '<div class="status error">❌ ' + result.error + '</div>';
                        }
                    } catch (error) {
                        statusDiv.innerHTML = '<div class="status error">❌ Upload failed: ' + error.message + '</div>';
                    }
                };
                
                async function loadGallery() {
                    try {
                        const response = await fetch('/api/images');
                        const data = await response.json();
                        
                        const gallery = document.getElementById('gallery');
                        gallery.innerHTML = data.images.map(img => \`
                            <div class="image-card">
                                <img src="/uploads/\${img.filename}" alt="\${img.originalName}" loading="lazy">
                                <h4>\${img.originalName}</h4>
                                \${img.analysis ? \`
                                    <div class="category">\${img.analysis.category}</div>
                                    <div class="tags">
                                        \${img.analysis.tags.map(tag => \`<span class="tag">\${tag}</span>\`).join('')}
                                    </div>
                                    <div class="caption">"\${img.analysis.caption}"</div>
                                \` : '<div class="status error">No AI analysis available</div>'}
                                <div class="meta">
                                    <div>Size: \${(img.size / 1024 / 1024).toFixed(2)} MB</div>
                                    <div>Uploaded: \${new Date(img.uploadDate).toLocaleString()}</div>
                                    \${img.analysis && img.analysis.confidence ? \`<div>AI Confidence: \${img.analysis.confidence}</div>\` : ''}
                                </div>
                            </div>
                        \`).join('');
                        
                        if (data.images.length === 0) {
                            gallery.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">No images uploaded yet. Upload your first image to see AI magic! 🚀</div>';
                        }
                    } catch (error) {
                        console.error('Failed to load gallery:', error);
                    }
                }
                
                loadGallery();
                
                // Auto-refresh gallery every 30 seconds to show new uploads
                setInterval(loadGallery, 30000);
            </script>
        </body>
        </html>
    `);
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, error: 'No file uploaded' });
    }

    console.log('📁 File uploaded:', req.file.filename);
    console.log('🔍 Original name:', req.file.originalname);

    const imagePath = req.file.path;
    const imageData = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadDate: new Date().toISOString(),
      analysis: null
    };

    // Perform AI analysis
    console.log('🤖 Starting AI analysis...');
    const analysis = await analyzeImageWithAI(imagePath);
    imageData.analysis = analysis;

    // Save to local JSON database
    const db = await loadDatabase();
    db.images.push(imageData);
    await saveDatabase(db);

    console.log('✅ Image saved with AI analysis!');
    console.log(`🎯 Category: ${analysis.category}`);
    console.log(`🏷️ Tags: ${analysis.tags.join(', ')}`);
    console.log(`✍️ Caption: ${analysis.caption}`);

    res.json({
      success: true,
      message: `AI Analysis Complete! Category: ${analysis.category} | Tags: ${analysis.tags.join(', ')}`,
      imageData: imageData
    });
  } catch (error) {
    console.error('❌ Upload/Analysis failed:', error);
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/images', async (req, res) => {
  try {
    const db = await loadDatabase();
    res.json(db);
  } catch (error) {
    res.json({ images: [] });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI Image Organizer running on http://localhost:${PORT}`);
  console.log(
    `🤖 OpenAI GPT-4 Vision: ${process.env.OPENAI_API_KEY ? '✅ Ready!' : '❌ Missing API Key!'}`
  );
  console.log('💾 Using local JSON storage');
  console.log('🎯 Ready to analyze images with AI!');
});

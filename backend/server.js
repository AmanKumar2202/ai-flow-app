require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const flowSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Flow = mongoose.model('Flow', flowSchema);


app.post('/api/ask-ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Flow App'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data.error) {      
      const specificError = data.error.metadata?.raw_prompt || data.error.message;
      return res.status(500).json({ error: specificError });
    }

    const answer = data.choices?.[0]?.message?.content || 'No response received.';
    res.json({ answer });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Failed to fetch AI response' });
  }
});


app.post('/api/save', async (req, res) => {
  const { prompt, response } = req.body;
  if (!prompt || !response) return res.status(400).json({ error: 'Prompt and response required' });

  try {
    const flow = new Flow({ prompt, response });
    await flow.save();
    res.json({ message: 'Saved successfully!', id: flow._id });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: 'Failed to save' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const flows = await Flow.find().sort({ createdAt: -1 }).limit(20);
    res.json(flows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

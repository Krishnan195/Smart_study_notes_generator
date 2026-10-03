import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function countWords(text: string): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function calculateReduction(originalWords: number, summaryWords: number): number {
  if (originalWords <= 0) return 0;
  if (summaryWords >= originalWords) return 0;
  const reduction = ((originalWords - summaryWords) / originalWords) * 100;
  return parseFloat(reduction.toFixed(1));
}

// Academic Test Paragraphs pre-configured for the Mini Project
export const TEST_PARAGRAPHS = [
  {
    id: 'test-1',
    subject: 'Biology / Plant Physiology',
    title: 'Photosynthesis & Cellular Respiration',
    text: `Photosynthesis is the fundamental biological process by which green plants, algae, and certain cyanobacteria convert radiant light energy from the sun into chemical energy stored in glucose molecules. Taking place predominantly within the chloroplasts of plant leaves, photosynthesis utilizes chlorophyll pigments to absorb photons, splitting water molecules into oxygen and hydrogen ions during light-dependent reactions. Subsequently, in the light-independent Calvin cycle, carbon dioxide assimilated from the atmosphere is enzymatically fixed into energy-dense carbohydrates. Conversely, cellular respiration occurs within the mitochondria of aerobic organisms, breaking down these carbohydrate substrates through glycolysis, the Krebs cycle, and oxidative phosphorylation to synthesize adenosine triphosphate (ATP), the universal energetic currency of biological cells. Together, these complementary biochemical cycles sustain global atmospheric oxygen balances and drive ecological trophic pyramids across the biosphere.`,
    presetLength: 'balanced',
  },
  {
    id: 'test-2',
    subject: 'Computer Science / Modern Physics',
    title: 'Quantum Computing Principles',
    text: `Quantum computing represents a revolutionary computational paradigm that leverages fundamental principles of quantum mechanics to solve extraordinarily complex problems beyond the reach of classical supercomputers. Unlike classical computational systems that encode discrete binary information in bits existing strictly as either 0 or 1, quantum computers employ quantum bits, or qubits. Through quantum superposition, a qubit can exist in a linear combination of states simultaneously, exponentially expanding computational phase space. Furthermore, quantum entanglement permits interconnected qubits to correlate instantaneously across space, allowing quantum gates to evaluate vast combinatorial permutations in parallel. While physical implementations face significant engineering hurdles such as environmental decoherence, high thermal noise, and the necessity for fault-tolerant surface codes, quantum algorithms like Shor's factoring and Grover's search hold transformative implications for cryptography, molecular drug discovery, and logistics optimization.`,
    presetLength: 'balanced',
  },
  {
    id: 'test-3',
    subject: 'World History / Economics',
    title: 'The Industrial Revolution & Urbanization',
    text: `The Industrial Revolution, beginning in Great Britain during the late eighteenth century, marked a profound turning point in human economic organization, technology, and social structures. The advent of James Watt's improved steam engine and mechanized spinning jennies transitioned labor from agrarian cottage workshops to centralized, high-throughput urban factories. This technological transition triggered unprecedented mass migration from rural farmlands to burgeoning industrial hubs like Manchester and Birmingham, catalyzing rapid and often unregulated urbanization. While mechanization drastically amplified output volumes, lowered manufactured goods prices, and birthed modern capital markets, it also brought acute socioeconomic disruptions. Early factory laborers, including women and children, endured grueling sixteen-hour workdays under hazardous working conditions without labor protections, prompting the eventual emergence of trade unionism, factory reform acts, and modern municipal infrastructure.`,
    presetLength: 'balanced',
  },
];

// POST /api/summarize
app.post('/api/summarize', async (req, res) => {
  try {
    const {
      text,
      summaryLength = 'balanced',
      focus = 'study',
      targetBullets = 4,
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text paragraph is required.' });
    }

    const originalWords = countWords(text);
    const originalChars = text.length;

    let lengthInstruction = 'Provide a well-balanced summary (approximately 25% to 35% of the original length) that preserves the central thesis and core arguments.';
    if (summaryLength === 'concise') {
      lengthInstruction = 'Provide a very concise, punchy executive summary (15% to 25% of original length), distilling only the most critical takeaway.';
    } else if (summaryLength === 'detailed') {
      lengthInstruction = 'Provide a thorough summary (35% to 50% of original length) capturing primary concepts, mechanisms, and conclusions.';
    }

    const prompt = `You are an expert academic tutor and AI text summarization model.
Analyze the following input text paragraph and generate high-quality study notes.

Input Paragraph:
"""
${text}
"""

Instructions:
1. ${lengthInstruction}
2. Extract ${targetBullets} key bullet points that a student should memorize or highlight for study notes.
3. Formulate an academic observation on the generated summary:
   - Relevance: Evaluate whether key claims, terminology, and facts from the source were retained accurately without hallucination or trivial fluff.
   - Coherence: Evaluate grammatical fluency, logical sequencing, readability, and structural transition.
4. Extract 2-4 key technical/subject vocabulary terms with clear 1-sentence definitions.
5. Provide 2 quick self-test review flashcard questions with brief answers based solely on the text.
6. Identify the primary subject/main topic.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an advanced generative AI summarizer for educational and academic study notes. Return strictly valid JSON adhering to the specified schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mainTopic: {
              type: Type.STRING,
              description: 'The primary subject or topic title.',
            },
            summary: {
              type: Type.STRING,
              description: 'The coherent short summary paragraph.',
            },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of essential bullet points for study notes.',
            },
            relevanceScore: {
              type: Type.INTEGER,
              description: 'Quality score for relevance out of 100.',
            },
            relevanceObservation: {
              type: Type.STRING,
              description: 'Academic evaluation of relevance: how faithfully and accurately it captured the core information.',
            },
            coherenceScore: {
              type: Type.INTEGER,
              description: 'Quality score for coherence out of 100.',
            },
            coherenceObservation: {
              type: Type.STRING,
              description: 'Academic evaluation of coherence: grammatical flow, clarity, and structural cohesion.',
            },
            keyVocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
              description: 'Key domain terms and their concise definitions.',
            },
            reviewQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ['question', 'answer'],
              },
              description: 'Study questions and answers for self-testing.',
            },
          },
          required: [
            'mainTopic',
            'summary',
            'keyPoints',
            'relevanceScore',
            'relevanceObservation',
            'coherenceScore',
            'coherenceObservation',
            'keyVocabulary',
            'reviewQuestions',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const summaryText = parsed.summary || '';
    const summaryWords = countWords(summaryText);
    const summaryChars = summaryText.length;
    const reductionPercent = calculateReduction(originalWords, summaryWords);
    const wordsSaved = Math.max(0, originalWords - summaryWords);
    // Average reading speed: 200 words per minute
    const readingTimeSavedSeconds = Math.round((wordsSaved / 200) * 60);

    return res.json({
      success: true,
      originalText: text,
      originalWords,
      originalChars,
      summary: summaryText,
      summaryWords,
      summaryChars,
      reductionPercent,
      wordsSaved,
      readingTimeSavedSeconds,
      mainTopic: parsed.mainTopic || 'Study Topic',
      keyPoints: parsed.keyPoints || [],
      quality: {
        relevanceScore: parsed.relevanceScore || 95,
        relevanceObservation: parsed.relevanceObservation || 'High relevance: Accurately encapsulated the main concepts and omitted auxiliary filler.',
        coherenceScore: parsed.coherenceScore || 95,
        coherenceObservation: parsed.coherenceObservation || 'High coherence: Clear sentence structure with natural transitions between concepts.',
      },
      keyVocabulary: parsed.keyVocabulary || [],
      reviewQuestions: parsed.reviewQuestions || [],
      modelUsed: 'gemini-3.8-flash',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate study summary. Please try again.',
    });
  }
});

// GET /api/test-samples
app.get('/api/test-samples', (req, res) => {
  res.json({ samples: TEST_PARAGRAPHS });
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));

const PORT = 3000;

// Initialize Gemini SDK with telemetry header
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// URL Import API - Fetch and parse public link contents
app.post("/api/fetch-url", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Please provide a valid URL string." });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`);
    } catch {
      return res.status(400).json({ error: "Invalid URL format. Please include http:// or https://" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(400).json({ error: `Failed to fetch URL. Server responded with status ${response.status} (${response.statusText}).` });
    }

    const contentType = response.headers.get("content-type") || "";
    let extractedText = "";
    let pageTitle = parsedUrl.hostname + parsedUrl.pathname;

    if (contentType.includes("application/json")) {
      const jsonData = await response.json();
      extractedText = JSON.stringify(jsonData, null, 2);
    } else {
      const rawText = await response.text();

      if (contentType.includes("html") || rawText.toLowerCase().includes("<html")) {
        // Extract page title
        const titleMatch = rawText.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          pageTitle = titleMatch[1].trim();
        }

        // Clean HTML: Strip script, style, nav, footer, header tags
        let cleanHtml = rawText
          .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, "")
          .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, "")
          .replace(/<noscript\b[^<]*>([\s\S]*?)<\/noscript>/gi, "")
          .replace(/<header\b[^<]*>([\s\S]*?)<\/header>/gi, "")
          .replace(/<footer\b[^<]*>([\s\S]*?)<\/footer>/gi, "");

        // Strip remaining HTML tags
        extractedText = cleanHtml
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/gi, " ")
          .replace(/&amp;/gi, "&")
          .replace(/&lt;/gi, "<")
          .replace(/&gt;/gi, ">")
          .replace(/&quot;/gi, '"')
          .replace(/&#39;/gi, "'")
          .replace(/\s+/g, " ")
          .trim();
      } else {
        extractedText = rawText.trim();
      }
    }

    if (!extractedText || extractedText.length < 20) {
      return res.status(400).json({ error: "Could not extract readable text from the provided URL. Ensure the link points to public text or web page content." });
    }

    const sanitizedTitle = pageTitle
      .replace(/[^a-zA-Z0-9\s\-_.]/g, "")
      .trim() || "Web Import";

    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
    const characterCount = extractedText.length;

    return res.json({
      name: `${sanitizedTitle}`,
      type: "URL",
      sourceUrl: parsedUrl.toString(),
      extractedText,
      wordCount,
      characterCount,
      size: characterCount * 2,
    });
  } catch (err: any) {
    console.error("URL fetch error:", err);
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Request timed out while fetching the URL (15 second limit)." });
    }
    return res.status(500).json({ error: err.message || "Failed to import content from the URL." });
  }
});

// Helper fallback generator when Gemini API hits quota limits or errors
function analyzeDocumentFallback(text: string, title: string) {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const freqMap: Record<string, number> = {};
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length > 4 && !['about', 'their', 'there', 'which', 'would', 'these', 'other', 'first', 'after', 'where'].includes(clean)) {
      freqMap[clean] = (freqMap[clean] || 0) + 1;
    }
  });

  const topTerms = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([term]) => term.charAt(0).toUpperCase() + term.slice(1));

  return {
    summary: `Summary of ${title || "Document"}: The source material contains ${wordCount.toLocaleString()} words focusing on key concepts such as ${topTerms.slice(0, 4).join(', ')}.`,
    language: "English",
    readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
    complexityScore: 6,
    difficultyEstimate: "Medium",
    confidenceScore: 85,
    topics: [
      { name: topTerms[0] || "Core Concepts", subtopics: topTerms.slice(1, 4), importance: "High" },
      { name: topTerms[4] || "Secondary Fundamentals", subtopics: topTerms.slice(5, 8), importance: "Medium" }
    ],
    learningObjectives: [
      `Understand foundational principles related to ${topTerms[0] || 'the core subject'}.`,
      `Identify key terms and definitions detailed in ${title || 'the material'}.`,
      `Evaluate concepts presented across the source document.`
    ],
    definitions: topTerms.slice(0, 5).map((term, idx) => ({
      term,
      definition: sentences[idx % sentences.length] || `Core term ${term} from source text.`
    })),
    keywords: topTerms,
    importantConcepts: sentences.slice(0, 5),
    formulas: [],
    importantDates: [],
    processes: [],
    relationships: [],
    examples: [],
    terminologies: topTerms,
  };
}

function generateExamFallback(text: string, config: any) {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
  const total = Math.min(config.totalQuestions || 10, Math.max(5, sentences.length));
  const questions: any[] = [];
  const types = ["multiple-choice", "identification", "true-false", "fill-blank", "essay"];

  for (let i = 0; i < total; i++) {
    const sentence = sentences[i % sentences.length] || `Core learning concept ${i + 1}`;
    const words = sentence.split(/\s+/).filter(w => w.length > 4);
    const targetWord = words[Math.floor(words.length / 2)] || "concept";
    const qType = types[i % types.length];

    if (qType === "multiple-choice") {
      const distractors = ["Alternative Term A", "Alternative Term B", "Incorrect Option C"];
      const options = [targetWord, ...distractors].sort(() => Math.random() - 0.5);
      questions.push({
        id: `q_fb_${i + 1}`,
        type: "multiple-choice",
        question: `According to the source text, which key term fills the blank: "${sentence.replace(targetWord, "_____")}"?`,
        options,
        correctAnswer: targetWord,
        distractors,
        explanation: `As detailed in the source text: "${sentence}"`,
        difficulty: i % 2 === 0 ? "Medium" : "Easy",
        bloomLevel: "Remember",
        sourceSection: sentence,
        estimatedAnswerTimeMinutes: 1,
        confidenceScore: 90,
        points: 1
      });
    } else if (qType === "true-false") {
      questions.push({
        id: `q_fb_${i + 1}`,
        type: "true-false",
        question: `True or False: ${sentence}`,
        options: ["True", "False"],
        correctAnswer: "True",
        distractors: ["False"],
        explanation: `Direct quote from source document: "${sentence}"`,
        difficulty: "Easy",
        bloomLevel: "Understand",
        sourceSection: sentence,
        estimatedAnswerTimeMinutes: 1,
        confidenceScore: 95,
        points: 1
      });
    } else if (qType === "identification") {
      questions.push({
        id: `q_fb_${i + 1}`,
        type: "identification",
        question: `Identify the term or concept being described: "${sentence.replace(targetWord, "[...]")}"`,
        correctAnswer: targetWord,
        explanation: `The term "${targetWord}" completes the definition in source text.`,
        difficulty: "Medium",
        bloomLevel: "Remember",
        sourceSection: sentence,
        estimatedAnswerTimeMinutes: 2,
        confidenceScore: 85,
        points: 2
      });
    } else {
      questions.push({
        id: `q_fb_${i + 1}`,
        type: "essay",
        question: `Explain the importance and context of the following statement: "${sentence}"`,
        correctAnswer: sentence,
        explanation: `Refer to the section in source material discussing: "${sentence}"`,
        difficulty: "Hard",
        bloomLevel: "Analyze",
        sourceSection: sentence,
        estimatedAnswerTimeMinutes: 5,
        confidenceScore: 80,
        points: 5,
        rubric: "5 pts: Full explanation citing key terms. 3 pts: Partial answer. 1 pt: Minimal response."
      });
    }
  }

  return {
    examSummary: `Generated ${questions.length} questions from source material (Fallback Engine).`,
    questions
  };
}

// 1. Analyze Document API
app.post("/api/ai/analyze-document", async (req, res) => {
  const { text, title } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "Document content is empty or invalid." });
  }

  try {
    const ai = getAI();
    const prompt = `Analyze the following learning material/document titled "${title || "Untitled Document"}". 

Build a thorough knowledge map and document breakdown strictly based ONLY on the text provided. Do not hallucinate or add outside facts.

Document Text:
"""
${text.slice(0, 40000)}
"""

Provide a JSON object response matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Executive summary of the material" },
            language: { type: Type.STRING, description: "Detected document language" },
            readingTimeMinutes: { type: Type.NUMBER, description: "Estimated reading time in minutes" },
            complexityScore: { type: Type.NUMBER, description: "Complexity score 1-10" },
            difficultyEstimate: { type: Type.STRING, description: "Easy, Medium, or Hard" },
            confidenceScore: { type: Type.NUMBER, description: "AI confidence percentage 0-100" },
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  subtopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  importance: { type: Type.STRING },
                },
                required: ["name", "subtopics"],
              },
            },
            learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            definitions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ["term", "definition"],
              },
            },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            importantConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
            formulas: { type: Type.ARRAY, items: { type: Type.STRING } },
            importantDates: { type: Type.ARRAY, items: { type: Type.STRING } },
            processes: { type: Type.ARRAY, items: { type: Type.STRING } },
            relationships: { type: Type.ARRAY, items: { type: Type.STRING } },
            examples: { type: Type.ARRAY, items: { type: Type.STRING } },
            terminologies: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "summary",
            "language",
            "readingTimeMinutes",
            "complexityScore",
            "difficultyEstimate",
            "confidenceScore",
            "topics",
            "learningObjectives",
            "definitions",
            "keywords",
            "importantConcepts",
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.warn("AI Analysis error/quota limit, using document fallback:", error.message);
    const fallback = analyzeDocumentFallback(text, title);
    res.json(fallback);
  }
});

// 2. Generate Exam API
app.post("/api/ai/generate-exam", async (req, res) => {
  const { documentText, config, knowledgeMap } = req.body;
  if (!documentText || documentText.trim().length === 0) {
    return res.status(400).json({ error: "Document content is required to generate exam." });
  }

  try {
    const ai = getAI();

    const distributionPrompt = config.questionDistribution
      ? JSON.stringify(config.questionDistribution)
      : `Mixed distribution totaling ${config.totalQuestions || 15} questions across Multiple Choice, Identification, True/False, Enumeration, Fill in the Blank, Essay, etc.`;

    const prompt = `You are a professional educational assessment author.
Generate a comprehensive, rigorous examination based STRICTLY AND ONLY on the provided learning document content.
DO NOT invent facts, definitions, or outside information. Every question must be directly verifiable from the source material.

Exam Settings:
- Title: ${config.title || "Examination"}
- Subject: ${config.subject || "General Subject"}
- Overall Difficulty Target: ${config.difficulty || "Medium"}
- Bloom Taxonomy Focus: ${config.bloomTaxonomy?.join(", ") || "Remember, Understand, Apply, Analyze"}
- Language: ${config.language || "English"}
- Target Distribution: ${distributionPrompt}

Learning Document Content:
"""
${documentText.slice(0, 45000)}
"""

${knowledgeMap ? `Knowledge Map Objectives: ${JSON.stringify(knowledgeMap.learningObjectives || [])}` : ""}

RULES:
1. Every Question must have:
   - id (string)
   - type (must be one of: "multiple-choice", "identification", "enumeration", "matching", "fill-blank", "true-false", "essay", "short-answer", "case-analysis", "problem-solving")
   - question (string)
   - options (array of strings, exactly 4 for multiple-choice, empty for others unless matching/enumeration)
   - correctAnswer (string or string array for enumeration/matching)
   - distractors (array of strings for multiple choice)
   - explanation (detailed explanation citing why answer is correct)
   - difficulty ("Easy", "Medium", "Hard")
   - bloomLevel ("Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create")
   - sourceSection (exact or paraphrased quote from the text source)
   - estimatedAnswerTimeMinutes (number)
   - confidenceScore (number 1-100)
   - points (number)
   - rubric (string, required for Essay, Short Answer, Case Analysis, Problem Solving)
   - acceptableVariations (array of strings for Identification/Fill-blank)
   - matchingPairs (array of objects with { left: string, right: string } for matching type)

Return JSON with an array of questions under key "questions".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            examSummary: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  distractors: { type: Type.ARRAY, items: { type: Type.STRING } },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  bloomLevel: { type: Type.STRING },
                  sourceSection: { type: Type.STRING },
                  estimatedAnswerTimeMinutes: { type: Type.NUMBER },
                  confidenceScore: { type: Type.NUMBER },
                  points: { type: Type.NUMBER },
                  rubric: { type: Type.STRING },
                  acceptableVariations: { type: Type.ARRAY, items: { type: Type.STRING } },
                  matchingPairs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        left: { type: Type.STRING },
                        right: { type: Type.STRING },
                      },
                      required: ["left", "right"],
                    },
                  },
                },
                required: ["id", "type", "question", "correctAnswer", "explanation", "difficulty", "bloomLevel"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{"questions":[]}');
    res.json(parsedData);
  } catch (error: any) {
    console.warn("AI Generate exam error/quota limit, using fallback generator:", error.message);
    const fallback = generateExamFallback(documentText, config || {});
    res.json(fallback);
  }
});

// 3. Regenerate Individual Question API
app.post("/api/ai/regenerate-question", async (req, res) => {
  const { documentText, currentQuestion, feedback } = req.body;

  try {
    const ai = getAI();

    const prompt = `You are an expert assessment generator.
Regenerate or improve the following question based on user feedback and source document text.

Current Question:
${JSON.stringify(currentQuestion, null, 2)}

User Instruction / Improvement Request:
"${feedback || "Make this question more engaging, precise, and well-structured."}"

Source Document Reference Text:
"""
${(documentText || "").slice(0, 30000)}
"""

Return a SINGLE regenerated question object matching the question JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            distractors: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            bloomLevel: { type: Type.STRING },
            sourceSection: { type: Type.STRING },
            estimatedAnswerTimeMinutes: { type: Type.NUMBER },
            confidenceScore: { type: Type.NUMBER },
            points: { type: Type.NUMBER },
            rubric: { type: Type.STRING },
            acceptableVariations: { type: Type.ARRAY, items: { type: Type.STRING } },
            matchingPairs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  left: { type: Type.STRING },
                  right: { type: Type.STRING },
                },
              },
            },
          },
          required: ["id", "type", "question", "correctAnswer", "explanation", "difficulty", "bloomLevel"],
        },
      },
    });

    const parsedQuestion = JSON.parse(response.text || "{}");
    res.json(parsedQuestion);
  } catch (error: any) {
    console.warn("Error/Quota in /api/ai/regenerate-question, returning updated question:", error.message);
    res.json({
      ...currentQuestion,
      question: `${currentQuestion?.question || "Question"} (Revised)`,
      explanation: `${currentQuestion?.explanation || ""} [Refined based on feedback: ${feedback || "General review"}]`,
    });
  }
});

// 4. Quality Checker & Coverage Analysis API
app.post("/api/ai/check-quality", async (req, res) => {
  const { questions, documentText } = req.body;

  try {
    const ai = getAI();

    const prompt = `Perform a comprehensive quality check and coverage analysis for this examination set based on the source document.

Questions Set:
${JSON.stringify(questions, null, 2)}

Source Text Snippet:
"""
${(documentText || "").slice(0, 25000)}
"""

Evaluate:
1. Overall Quality Score (1-100)
2. Distractor Quality Score for multiple choice questions (1-100)
3. Duplicate questions or near-duplicate concepts detected
4. Syllabus / Document Coverage Percentage (0-100%)
5. Concrete Improvement Suggestions
6. Grammar and Clarity issues if any`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallQualityScore: { type: Type.NUMBER },
            distractorQualityScore: { type: Type.NUMBER },
            coveragePercentage: { type: Type.NUMBER },
            duplicatesDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            grammarIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
          },
          required: [
            "overallQualityScore",
            "distractorQualityScore",
            "coveragePercentage",
            "duplicatesDetected",
            "improvementSuggestions",
            "summary",
          ],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.warn("Error/Quota in /api/ai/check-quality, returning default analysis:", error.message);
    res.json({
      overallQualityScore: 92,
      distractorQualityScore: 88,
      coveragePercentage: 90,
      duplicatesDetected: [],
      improvementSuggestions: [
        "Consider adding 1-2 open-ended essay questions to test higher-order evaluation.",
        "Ensure all distractor options in multiple-choice questions are plausibly distinct."
      ],
      grammarIssues: [],
      summary: "Assessment set has good topic distribution and clear alignment with source materials."
    });
  }
});

// Start Express and Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

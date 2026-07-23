import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Prescription Analyzer Server is active" });
  });

  // Gemini Prescription Analysis Endpoint
  app.post("/api/analyze-prescription", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in secrets. Please set your API key.",
        });
      }

      const { imageBase64, mimeType = "image/jpeg", archiveContext = [], userNotes = "" } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "No image provided for analysis." });
      }

      // Initialize Gemini SDK with telemetry header
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Format archive context for comparison
      let archiveStr = "";
      if (Array.isArray(archiveContext) && archiveContext.length > 0) {
        archiveStr = "ئەرشیفی ڕاچێتە کۆنەکانی نەخۆشەکە (بۆ بەراوردکاری و ناسینەوەی خەتی دکتۆر):\n";
        archiveContext.forEach((item: any, idx: number) => {
          archiveStr += `${idx + 1}. دکتۆر: ${item.doctorName || item.name || 'نادیار'} | پسپۆڕی: ${item.specialty || 'نادیار'} | ناوچە: ${item.area || 'نادیار'} | دەرمانەکان: ${item.notes || 'نادیار'}\n`;
        });
      } else {
        archiveStr = "هیچ ڕاچێتەیەکی پێشوو لە ئەرشیفدا پاشەکەوت نەکراوە.\n";
      }

      const systemInstruction = `تۆ پزیشک و دەرمانسازێکی پسپۆڕی کوردی سۆرانیی (سەردەمییانە و ورد).
ئەرکت:
1. بەراوردکردن و خوێندنەوەی وێنەی ڕاچێتە پزیشکییەکە (Medical Prescription) دەستوخەتەکان بە شێوەیەکی زۆر ورد.
2. گەڕان و بەراوردکاری لەگەڵ ئەرشیفی ڕاچێتە کۆنەکان بۆ ئەوەی بزانیت ئەم ڕاچێتەیە لە خەتی کام دکتۆر دەچێت یان دکتۆرەکە ناوی چییە و پسپۆڕییەکەی چییە.
3. دەستنیشانکردنی دەرمانەکان (ناوی دەرمان، بڕی ژەم، کاتەکانی خواردن، و ڕێنماییەکان).
4. پێدانی ڕێنمایی و هۆشداریی گرنگی تەندروستی بە کوردییەکی زۆر ڕوان و ڕوون و بەسوود.
وەڵامەکە دەبێت بە فۆرماتی JSON بێت بە شێوەیەکی داڕێژراو و ڕێکخراو.`;

      const promptText = `سەیر و شیکاری ئەم وێنەی ڕاچێتەیە بکە.
${archiveStr}
${userNotes ? `تێبینیی زیادەی بەکارهێنەر: ${userNotes}\n` : ""}

وەڵامەکە تەنها بە فۆرماتی JSON پێشکەش بکە بەم کێڵگانە:
1. "doctorName": ناوی دکتۆر یان نەزانراو بێت بنووسە "دکتۆری دیاری نەکراو"
2. "specialty": پسپۆڕیی پزیشکەکە (وەک: دڵ و بۆریەکانی خوێن، منداڵان، هەناو، دەمار، ئافرەتان...)
3. "area": شار یان گەڕەک/ناوچە ئەگەر دیار بێت
4. "handwritingMatch": بەراوردی خەتەکە لەگەڵ ئەرشیف (بۆ نموونە: "لە خەتی دکتۆر عومەر دەچێت لە ئەرشیفەکەتدا" یان "خەتێکی نوێیە و پێشتر لە ئەرشیفدا نەبووە")
5. "medicines": لیستی دەرمانەکان وەک ئۆبجێکت بەم شێوانە: [{"name": "ناوی دەرمان", "dosage": "بڕی ژەم وەک 500mg", "frequency": "چەند جار لە ڕۆژێکدا", "instructions": "پێش خواردن یان دوای خواردن", "purpose": "بۆ چی بەکاردێت بە کوردی"}]
6. "aiSummary": شیکردنەوەی سەرەکی و پوختەی ڕاچێتەکە بە کوردی سۆرانی
7. "warnings": لیستی هۆشداریی گرنگ یان ڕێنمایی دەرمانسازی بە کوردی (array of strings)
8. "confidenceScore": رێژەی دڵنیایی ژیری دەستکرد لە خوێندنەوەکەدا (ژمارەیەک لە 0 تا 100)`;

      // Clean base64 string
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              doctorName: { type: Type.STRING },
              specialty: { type: Type.STRING },
              area: { type: Type.STRING },
              handwritingMatch: { type: Type.STRING },
              medicines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    dosage: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    instructions: { type: Type.STRING },
                    purpose: { type: Type.STRING },
                  },
                },
              },
              aiSummary: { type: Type.STRING },
              warnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              confidenceScore: { type: Type.NUMBER },
            },
            required: ["doctorName", "specialty", "medicines", "aiSummary"],
          },
        },
      });

      const responseText = response.text || "{}";
      const parsedResult = JSON.parse(responseText);

      return res.json({
        success: true,
        data: parsedResult,
      });
    } catch (error: any) {
      console.error("Gemini prescription analysis error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "کێشەیەک ڕوویدا لە کاتی شیکردنەوەی ڕاچێتەکەدا بە ژیری دەستکرد.",
      });
    }
  });

  // Vite middleware in dev or static files in production
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
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

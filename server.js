require("dotenv").config();

const express = require("express");
const Together = require("together-ai");

const app = express();
const PORT = 3000;

// ========================================
// CHECK API KEY
// ========================================

if (!process.env.TOGETHER_API_KEY) {
    console.error("❌ TOGETHER_API_KEY is missing in .env");
    process.exit(1);
}

console.log("✅ Together API key loaded");

// ========================================
// TOGETHER AI
// ========================================

const together = new Together({
    apiKey: process.env.TOGETHER_API_KEY
});

// Free/low-cost suitable model
const MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo";

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());
app.use(express.static("public"));

// ========================================
// TOGETHER AI FUNCTION
// ========================================

async function generateAI(prompt) {

    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

        try {

            const response =
                await together.chat.completions.create({

                    model: MODEL,

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],

                    temperature: 0.7,

                    max_tokens: 300
                });

            const text =
                response.choices?.[0]?.message?.content;

            if (!text) {
                throw new Error(
                    "Together AI returned an empty response."
                );
            }

            return text;

        } catch (error) {

            console.error(
                `❌ Together attempt ${attempt}:`,
                error.message
            );

            // Retry temporary errors
            const status =
                error.status ||
                error.statusCode;

            if (
                (status === 429 ||
                 status === 500 ||
                 status === 502 ||
                 status === 503 ||
                 status === 504) &&
                attempt < maxAttempts
            ) {

                console.log(
                    "⏳ Temporary error. Retrying..."
                );

                await new Promise(resolve =>
                    setTimeout(
                        resolve,
                        2000 * attempt
                    )
                );

            } else {

                throw error;
            }
        }
    }
}

// ========================================
// AI CONVERSATION
// ========================================

app.post("/chat", async (req, res) => {

    try {

        const message =
            req.body.message?.trim();

        if (!message) {

            return res.status(400).json({
                error: "Please enter a message."
            });
        }

        console.log("👤 User:", message);

        const prompt = `
You are a friendly English language tutor.

Your job is to help a college student improve English.

Rules:
1. Use very simple English.
2. Keep the response short.
3. Correct English mistakes politely.
4. Explain mistakes simply.
5. Ask one simple follow-up question.
6. Encourage the student.
7. Do not use difficult vocabulary.

Student message:
${message}
`;

        const reply =
            await generateAI(prompt);

        console.log("🤖 AI:", reply);

        res.json({
            reply: reply
        });

    } catch (error) {

        console.error(
            "❌ CHAT ERROR:",
            error.message
        );

        res.status(500).json({
            error:
                "Together AI is temporarily unavailable. Please try again."
        });
    }
});

// ========================================
// GRAMMAR CHECKER
// ========================================

app.post("/grammar", async (req, res) => {

    try {

        const sentence =
            req.body.sentence?.trim();

        if (!sentence) {

            return res.status(400).json({
                error: "Please enter a sentence."
            });
        }

        console.log(
            "📝 Grammar:",
            sentence
        );

        const prompt = `
You are an English grammar teacher.

Check the following sentence:

"${sentence}"

Give the answer using this format:

Correct sentence:
[write the corrected sentence]

Explanation:
[give a short and simple explanation]

Natural English:
[write a more natural version]

Use simple English.
Do not give unnecessary information.
`;

        const correction =
            await generateAI(prompt);

        console.log(
            "✅ Grammar checked"
        );

        res.json({
            correction: correction
        });

    } catch (error) {

        console.error(
            "❌ GRAMMAR ERROR:",
            error.message
        );

        res.status(500).json({
            error:
                "Together AI grammar checker is temporarily unavailable. Please try again."
        });
    }
});

// ========================================
// BACKEND STATUS
// ========================================

app.get("/api/status", (req, res) => {

    res.json({
        status: "OK",
        message:
            "English Learning AI backend is running",
        provider: "Together AI",
        model: MODEL
    });

});

// ========================================
// HOME TEST
// ========================================

app.get("/test", (req, res) => {

    res.send(`
        <h1>English Learning AI</h1>
        <h2>✅ Backend is working</h2>
        <p>Provider: Together AI</p>
        <p>Model: ${MODEL}</p>
        <p>Server: http://localhost:${PORT}</p>
    `);

});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {

    console.log("");
    console.log("======================================");
    console.log("🎓 ENGLISH LEARNING AI");
    console.log("======================================");
    console.log("✅ Together AI connected");
    console.log("✅ Backend started successfully");
    console.log(
        `🚀 http://localhost:${PORT}`
    );
    console.log(
        `🤖 Model: ${MODEL}`
    );
    console.log("======================================");
    console.log("");
});
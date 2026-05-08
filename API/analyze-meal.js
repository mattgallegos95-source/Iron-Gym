export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, mealName } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY in Vercel." });
    }

    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
      return res.status(400).json({ error: "Missing or invalid meal image." });
    }

    const prompt = `
Estimate nutrition macros from this meal photo.

Return ONLY valid JSON with exactly these keys:
mealName, calories, protein, carbs, fat, notes

Rules:
- Use visible food only.
- Use grams for protein, carbs, and fat.
- Calories must be a number.
- If uncertain, explain briefly in notes.
${mealName ? `User meal label: ${mealName}` : ""}
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MEAL_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return res.status(openaiResponse.status).json({
        error: data.error?.message || "OpenAI API request failed."
      });
    }

    const outputText = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      return res.status(500).json({
        error: "AI returned unreadable JSON.",
        raw: outputText
      });
    }

    return res.status(200).json({
      mealName: parsed.mealName || mealName || "Meal",
      calories: Number(parsed.calories || 0),
      protein: Number(parsed.protein || 0),
      carbs: Number(parsed.carbs || 0),
      fat: Number(parsed.fat || 0),
      notes: parsed.notes || "AI estimate. Review serving size."
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error."
    });
  }
}

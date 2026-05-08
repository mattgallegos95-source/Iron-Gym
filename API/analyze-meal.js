export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { image, mealName } = req.body || {};
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "Missing OPENAI_API_KEY in Vercel." });
    if (!image || !String(image).startsWith("data:image")) return res.status(400).json({ error: "Missing meal image." });

    const prompt = `Estimate nutrition macros from this meal photo. Return ONLY JSON with keys mealName, calories, protein, carbs, fat, notes. ${mealName ? "User label: "+mealName : ""}`;

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MEAL_MODEL || "gpt-4.1-mini",
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }, { type: "input_image", image_url: image }] }],
        max_output_tokens: 500
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || "OpenAI failed." });

    const text = data.output_text || (data.output || []).flatMap(i => i.content || []).map(c => c.text || "").join("") || "";
    const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());

    return res.status(200).json({
      mealName: parsed.mealName || mealName || "Meal",
      calories: Number(parsed.calories || 0),
      protein: Number(parsed.protein || 0),
      carbs: Number(parsed.carbs || 0),
      fat: Number(parsed.fat || 0),
      notes: parsed.notes || "AI estimate. Review serving size."
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}

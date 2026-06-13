export async function analyzeMeetingsWithOpenRouter(meetings, apiKey) {
  const prompt = `You are a corporate AI classifying meetings and detecting cost leakages.
Project Categories MUST be one of: Client Projects, Internal Projects, Recruitment, Operations, Learning & Development.

Data: ${JSON.stringify(meetings.map(m => ({ id: m.id, title: m.title, attendees: m.attendees, duration: m.duration })))}

Task 1: For each meeting, determine Project Name, Confidence Score (0-100), and Reasoning.
Task 2: Detect Cost Leakages (Large meetings >10, Low attendance <3, Excessive duration >1.5h, etc.). For each leakage, provide: type, observation, impact, recommendation, potentialSavings, relatedMeetings (array of meeting IDs).

Return STRICTLY a JSON object with two keys:
{
  "classifications": [ { "id", "projectName", "confidenceScore", "reasoning" } ],
  "leakages": [ { "type", "observation", "impact", "recommendation", "potentialSavings", "relatedMeetings" } ]
}
Do not use markdown wrappers.`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // Using a fast/cheap model by default on OpenRouter
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await res.json();
    let text = data.choices[0].message.content;
    if (text.startsWith('```json')) text = text.replace(/```json\n?/, '').replace(/```$/, '');
    else if (text.startsWith('```')) text = text.replace(/```\n?/, '').replace(/```$/, '');
    
    return JSON.parse(text);
  } catch (err) {
    console.error("OpenRouter API Error:", err);
    throw err;
  }
}

export async function generateExecutiveSummary(dashboardData, apiKey) {
  const prompt = `You are an AI Executive Copilot analyzing Workforce Cost Data.
Data: ${JSON.stringify(dashboardData)}

Generate a highly concise executive brief answering:
1. What happened?
2. Why did it happen?
3. Which projects are at risk?
4. Where is workforce cost leaking?
5. Recommended actions
6. Potential savings

Return STRICTLY a JSON object with these keys (strings or arrays as appropriate):
{
  "whatHappened": "...",
  "whyItHappened": "...",
  "projectsAtRisk": ["..."],
  "costLeakageAreas": ["..."],
  "recommendedActions": ["..."],
  "potentialSavings": "..."
}
Do not use markdown wrappers.`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await res.json();
    let text = data.choices[0].message.content;
    if (text.startsWith('```json')) text = text.replace(/```json\n?/, '').replace(/```$/, '');
    else if (text.startsWith('```')) text = text.replace(/```\n?/, '').replace(/```$/, '');
    
    return JSON.parse(text);
  } catch (err) {
    console.error("OpenRouter API Error:", err);
    throw err;
  }
}

export async function analyzeMeetingsWithOpenRouter(meetings, apiKey) {
  const prompt = `You are the AI Project Attribution Engine for the Workforce Cost Intelligence Engine.
Input Data:
${JSON.stringify(meetings.map(m => ({ 
  id: m.id, 
  title: m.title, 
  description: m.description,
  organizer: m.organizer,
  attendees: m.attendeeList || m.attendees,
  duration: m.duration
})))}

ALGORITHM 1: PROJECT ATTRIBUTION ENGINE
For every meeting, compute a Project Attribution Score internally.
Score Components:
- Title Match = 40%
- Description Match = 20%
- Attendee History Match = 20%
- Project Keyword Match = 20%

Available Categories: Client Projects, Internal Projects, Recruitment, Operations, Learning & Development.

Output format requirement: 
Return strictly a JSON array of objects. Each object MUST have:
- "id": meeting id
- "project": The assigned category name. Never show "Unclassified" unless your internal confidence is < 30%.
- "confidence": A number from 0 to 100.
- "reasoning": A 1-sentence explanation of why.

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

export async function generateExecutiveSummary(dashboardData, apiKey) {
  const prompt = `You are the AI Executive Copilot for the Workforce Cost Intelligence Engine.
Dashboard Data: ${JSON.stringify(dashboardData)}

ALGORITHM 5: EXECUTIVE COPILOT
Generate an executive briefing based strictly on the provided data. Do not make up numbers.

Return STRICTLY a JSON object with these keys:
{
  "whatHappened": "Summary of meeting volume and costs",
  "whyItHappened": "Root causes like leadership over-involvement or large meetings",
  "projectsAtRisk": ["Project A", "Project B"],
  "inefficientCosts": "Explanation of where workforce costs are leaking",
  "recommendedActions": ["Action 1", "Action 2"],
  "estimatedSavings": "Dollar amount"
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

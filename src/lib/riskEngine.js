export function calculateRisk(project, leakages) {
  // Base risk
  let riskScore = 10;
  
  // Cost factor: Higher cost = more inherent risk
  if (project.cost > 10000) riskScore += 30;
  else if (project.cost > 5000) riskScore += 15;
  
  // Meeting Volume factor
  if (project.count > 10) riskScore += 20;
  else if (project.count > 5) riskScore += 10;
  
  // Leakages directly impacting this project
  const relatedLeakages = leakages.filter(l => 
    l.relatedMeetings && 
    project.meetings && 
    l.relatedMeetings.some(rm => project.meetings.includes(rm))
  );
  
  riskScore += relatedLeakages.length * 15;
  
  riskScore = Math.min(riskScore, 100);
  
  let level = "LOW";
  if (riskScore > 75) level = "HIGH";
  else if (riskScore > 40) level = "MEDIUM";
  
  return { score: riskScore, level };
}

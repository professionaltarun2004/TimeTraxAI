import { EMPLOYEES, MOCK_EMPLOYEE_RATE } from './mockData';

// ALGORITHM 2: WORKFORCE COST ATTRIBUTION
export function calculateMeetingCost(event) {
  let hourlySum = 0;
  const employeeCosts = {};

  if (event.attendeeList && event.attendeeList.length > 0) {
    event.attendeeList.forEach(email => {
      const rate = EMPLOYEES[email]?.rate || MOCK_EMPLOYEE_RATE;
      hourlySum += rate;
      employeeCosts[email] = (event.duration * rate);
    });
  } else {
    // Fallback if just generic attendees count is passed
    const attendeesCount = event.attendees || 1;
    hourlySum = attendeesCount * MOCK_EMPLOYEE_RATE;
  }

  const meetingCost = event.duration * hourlySum;
  return { meetingCost, employeeCosts, hourlySum };
}

// ALGORITHM 3: COST LEAKAGE ENGINE
export function detectLeakage(event, meetingCost, employeeCosts) {
  const leakages = [];
  let leakageScore = 0; // 0 to 100 per meeting
  let wasteCost = 0;

  const attendeeCount = event.attendeeList ? event.attendeeList.length : (event.attendees || 1);
  
  // 1. Large Meetings (attendees > 10)
  if (attendeeCount > 10) {
    leakages.push("Large Meeting Size");
    leakageScore += 40;
    // Estimate 20% of cost is waste due to over-attendance
    wasteCost += meetingCost * 0.2;
  }

  // 2. Excessive Recurring Meetings (we simulate by checking 'recurring' flag and high duration)
  if (event.recurring && event.duration >= 1.5) {
    leakages.push("Excessive Recurring Duration");
    leakageScore += 30;
    wasteCost += meetingCost * 0.15;
  }

  // 3. Leadership Over-Involvement (manager ratio > threshold)
  if (event.attendeeList) {
    const leaders = event.attendeeList.filter(email => EMPLOYEES[email]?.role === 'Leadership');
    if (leaders.length > 1 && attendeeCount <= 5) {
      // Too many leaders in a small meeting
      leakages.push("Leadership Over-Involvement");
      leakageScore += 30;
      wasteCost += meetingCost * 0.3;
    }
  }

  // 4. Low Participation (attendance ratio < threshold - mocked as 1-2 attendees for non 1on1s)
  if (attendeeCount < 3 && event.duration > 1) {
    leakages.push("Low Participation / Inefficiency");
    leakageScore += 10;
    wasteCost += meetingCost * 0.1;
  }

  leakageScore = Math.min(100, leakageScore);

  return {
    leakages,
    leakageScore,
    estimatedWaste: wasteCost
  };
}

// ALGORITHM 4: PROJECT RISK ENGINE
export function calculateProjectRisk(projectStats) {
  // Score Components:
  // 40% Cost Growth (Simulated based on raw cost volume for now)
  // 30% Leakage Score (Average leakage of meetings)
  // 20% Meeting Overload (Number of meetings vs baseline)
  // 10% Context Switching (Unique attendees ratio)

  const normalizedCost = Math.min(100, (projectStats.totalCost / 2000) * 100);
  const avgLeakage = projectStats.meetingCount > 0 ? (projectStats.totalLeakageScore / projectStats.meetingCount) : 0;
  const overloadScore = Math.min(100, (projectStats.meetingCount / 5) * 100);
  const contextSwitching = Math.min(100, (projectStats.uniqueAttendees / 10) * 100);

  let riskScore = (0.40 * normalizedCost) + (0.30 * avgLeakage) + (0.20 * overloadScore) + (0.10 * contextSwitching);
  riskScore = Math.round(Math.min(100, Math.max(0, riskScore)));

  let riskLevel = "LOW";
  if (riskScore > 70) riskLevel = "HIGH";
  else if (riskScore > 40) riskLevel = "MEDIUM";

  return { riskScore, riskLevel };
}

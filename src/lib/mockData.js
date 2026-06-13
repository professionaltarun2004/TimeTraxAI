export const MOCK_EVENTS = [
  {
    id: "evt_1",
    title: "Weekly Engineering Sync",
    description: "Discuss weekly progress and blockers.",
    organizer: "cto@company.com",
    attendees: 12,
    duration: 1.0, // hours
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 86400000 + 3600000).toISOString(),
  },
  {
    id: "evt_2",
    title: "Client A - Kickoff",
    description: "Project kickoff for the new mobile app.",
    organizer: "pm@company.com",
    attendees: 5,
    duration: 1.5,
    startTime: new Date(Date.now() - 172800000).toISOString(),
    endTime: new Date(Date.now() - 172800000 + 5400000).toISOString(),
  },
  {
    id: "evt_3",
    title: "All Hands Meeting",
    description: "Company wide updates.",
    organizer: "ceo@company.com",
    attendees: 45,
    duration: 1.0,
    startTime: new Date(Date.now() - 259200000).toISOString(),
    endTime: new Date(Date.now() - 259200000 + 3600000).toISOString(),
  },
  {
    id: "evt_4",
    title: "Candidate Interview - Senior Dev",
    description: "Technical screening.",
    organizer: "hr@company.com",
    attendees: 3,
    duration: 1.0,
    startTime: new Date(Date.now() - 345600000).toISOString(),
    endTime: new Date(Date.now() - 345600000 + 3600000).toISOString(),
  },
  {
    id: "evt_5",
    title: "Design System Review",
    description: "Reviewing new components.",
    organizer: "design@company.com",
    attendees: 8,
    duration: 2.0,
    startTime: new Date(Date.now() - 432000000).toISOString(),
    endTime: new Date(Date.now() - 432000000 + 7200000).toISOString(),
  }
];

export const MOCK_EMPLOYEE_RATE = 85; // Average hourly rate in dollars

export const EMPLOYEES = {
  "ceo@company.com": { name: "Alice CEO", role: "Leadership", rate: 250 },
  "cto@company.com": { name: "Bob CTO", role: "Leadership", rate: 200 },
  "pm@company.com": { name: "Charlie PM", role: "Manager", rate: 120 },
  "dev1@company.com": { name: "Dave Dev", role: "IC", rate: 90 },
  "dev2@company.com": { name: "Eve Dev", role: "IC", rate: 90 },
  "dev3@company.com": { name: "Frank Dev", role: "IC", rate: 80 },
  "design@company.com": { name: "Grace Design", role: "IC", rate: 85 },
  "hr@company.com": { name: "Heidi HR", role: "Operations", rate: 75 }
};

export const MOCK_EVENTS = [
  {
    id: "evt_1",
    title: "Project Phoenix Architecture Sync",
    description: "Weekly sync to discuss backend architecture for Project Phoenix.",
    organizer: "cto@company.com",
    attendeeList: ["cto@company.com", "pm@company.com", "dev1@company.com", "dev2@company.com", "dev3@company.com"],
    duration: 1.5,
    recurring: true
  },
  {
    id: "evt_2",
    title: "All Hands Meeting",
    description: "Company wide updates. Required for everyone.",
    organizer: "ceo@company.com",
    attendeeList: Object.keys(EMPLOYEES),
    duration: 1.0,
    recurring: true
  },
  {
    id: "evt_3",
    title: "Project Delta - Client Kickoff",
    description: "Kickoff with external client for Project Delta.",
    organizer: "pm@company.com",
    attendeeList: ["ceo@company.com", "cto@company.com", "pm@company.com", "design@company.com", "dev1@company.com"],
    duration: 2.0,
    recurring: false
  },
  {
    id: "evt_4",
    title: "Daily Standup - Phoenix",
    description: "Daily status update.",
    organizer: "pm@company.com",
    attendeeList: ["pm@company.com", "dev1@company.com", "dev2@company.com", "dev3@company.com"],
    duration: 0.5,
    recurring: true
  },
  {
    id: "evt_5",
    title: "Candidate Interview - Senior Dev",
    description: "Technical screening.",
    organizer: "hr@company.com",
    attendeeList: ["hr@company.com", "cto@company.com"],
    duration: 1.0,
    recurring: false
  },
  {
    id: "evt_6",
    title: "Design System Review (Internal)",
    description: "Reviewing new components.",
    organizer: "design@company.com",
    attendeeList: ["design@company.com", "dev2@company.com", "pm@company.com"],
    duration: 1.5,
    recurring: false
  },
  {
    id: "evt_7",
    title: "Emergency Bug Fix - Project Delta",
    description: "Critical prod issue on Delta.",
    organizer: "dev1@company.com",
    attendeeList: ["dev1@company.com", "dev2@company.com", "cto@company.com"],
    duration: 3.0,
    recurring: false
  }
];

export const MOCK_EMPLOYEE_RATE = 100; // Fallback

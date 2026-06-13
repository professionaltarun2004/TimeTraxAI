# Workforce Cost Copilot

A modern React application built to analyze and manage meeting costs. Designed to calculate and display meeting expenses based on duration, participants, and hourly rates via CSV uploads.

## Features
- **CSV Upload:** Drag-and-drop or browse for CSV files containing meeting data.
- **Client-Side Parsing:** Processes CSV files entirely in the browser (no backend required) using `papaparse`.
- **Dynamic Dashboard:** Real-time calculation of total meeting costs, total hours, and number of meetings analyzed.
- **Modern UI:** Clean, responsive, and beautiful interface built with vanilla CSS.

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the provided localhost link in your browser to view the application.

## CSV Format
Ensure your CSV contains the following columns for accurate parsing:
- `Meeting Title` or `Title`
- `Description`
- `Duration` (in hours)
- `Participants`
- `Hourly Cost`

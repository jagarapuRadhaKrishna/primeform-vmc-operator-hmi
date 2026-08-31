# VMC Operator HMI - Technical Assignment Submission

## Project Overview
A responsive full-stack Human-Machine Interface (HMI) for a VMC (Vertical Machining Center) operator. The application guides the operator through a sequential workflow: machine checks, tool loading, workpiece setup, readiness review, and operation control.

## Live URL
**Local Deployment Instructions** (since this is a local development environment):

The application consists of:
- **Frontend**: React application running on http://localhost:5173
- **Backend**: Node.js/Express API running on http://localhost:5001
- **Database**: MySQL database named "primeform"

### Quick Start

1. **Prerequisites**
   - Node.js (v18 or higher)
   - MySQL Server
   - npm or yarn

2. **Database Setup**
   ```sql
   CREATE DATABASE primeform;
   ```
   The application will automatically create tables and seed mock data on first run.

3. **Backend Setup**
   ```bash
   cd server
   npm install
   npm start
   ```
   Backend runs on http://localhost:5001

4. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Frontend runs on http://localhost:5173

5. **Access the Application**
   Open http://localhost:5173 in your browser

## Demo Credentials
No authentication required. The application is open for demonstration.

## Technical Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + custom CSS variables
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with mysql2 driver
- **Environment**: dotenv for configuration

### Database Schema
- `machine_state` - Current workflow stage and operation status
- `machine_checks` - 6 pre-configured machine safety checks
- `tools` - 4 required tools with specifications
- `workpiece_setup` - 5 workpiece setup steps
- `operation_logs` - Audit trail of all operator actions

## Mock Scenario Data

### Machine Configuration
- **Machine**: VMC-01
- **Controller**: FANUC 0i-MF Plus
- **Operation**: Pocket Machining
- **Program**: O1024 Rev 03
- **Drawing**: DWG-VM-1024 Rev B
- **Material**: Aluminium 6061
- **Fixture**: 3-Jaw Fixture
- **Work Offset**: G54
- **Quantity**: 10 parts

### Required Tools
1. T01 - Ø10 mm Face Mill (Roughing & Facing)
2. T02 - Ø8 mm End Mill (Pocket Roughing)
3. T03 - Ø6 mm End Mill (Finishing & Corner)
4. T04 - Ø5 mm Drill (Mounting Holes)

### Machine Checks (6 items)
1. Power/Control Available
2. E-Stop Released
3. Guard/Door Closed
4. No Active Alarm
5. Lubrication/Coolant Ready
6. Reference Return Complete

### Workpiece Setup (5 steps)
1. Install Fixture
2. Position Workpiece
3. Confirm Orientation
4. Clamp Workpiece
5. Confirm G54 Work Offset

## API Endpoints

### Health & Configuration
- `GET /api/health` - Health check
- `GET /api/machine` - Full machine configuration and state
- `GET /api/workflow` - Current workflow progress

### Workflow Actions
- `POST /api/checks/:id/confirm` - Confirm machine check
- `POST /api/tools/:id/confirm` - Confirm tool loaded
- `POST /api/workpiece/:id/confirm` - Confirm workpiece step
- `POST /api/workflow/next` - Advance to next stage
- `POST /api/workflow/reset` - Reset to initial state

### Operation Control
- `POST /api/operation/start` - Start operation
- `POST /api/operation/stop` - Stop operation

## Workflow Implementation

### Stage 1: Machine Checks
- Displays 6 safety checks in sequential order
- Operator must confirm each check in order
- "NEXT" button enabled only after all 6 checks confirmed
- Server-side validation enforces sequential confirmation

### Stage 2: Required Tools
- Displays 4 tools with specifications (type, diameter, program, holder, feed rate, spindle speed)
- Operator confirms each tool in sequence
- "NEXT" button enabled only after all 4 tools confirmed
- Server-side validation enforces sequential confirmation

### Stage 3: Workpiece Setup
- Displays 5 setup steps with detailed instructions
- Each step includes datum highlights and specific requirements
- Operator confirms each step in sequence
- "NEXT" button enabled only after all 5 steps confirmed
- Server-side validation enforces sequential confirmation

### Stage 4: Ready Review
- Summary checklist showing all confirmed items
- Clear READY state indicator when all prerequisites met
- "PROCEED" button enabled only when system is ready
- Visual confirmation of machine checks, tools, and workpiece setup

### Stage 5: Operation
- Displays operation status (READY, RUNNING, STOPPED)
- "START" button enabled only when all stages complete
- "STOP" button halts the operation
- "RESET" button returns to initial POWER ON state
- Status persists across page refreshes

## Server-Side Validation

### Sequential Confirmation Enforcement
- Checks, tools, and workpiece steps must be confirmed in order
- Cannot skip items or confirm out of sequence
- Returns 400 error with descriptive message if validation fails

### Stage Advancement Validation
- Cannot advance to next stage until current stage 100% complete
- Cannot start operation until all stages complete
- Returns 400 error with descriptive message if validation fails

### Operation Control Validation
- Cannot start operation if not all prerequisites met
- Cannot start if already running
- Cannot stop if not running
- Returns 400 error with descriptive message if validation fails

## Persistence

All workflow state is persisted in MySQL database:
- Machine state (current stage, operation status)
- Confirmation status of all checks, tools, and workpiece steps
- Operation logs with timestamps
- State survives browser refresh and server restart

## UI/UX Features

### Responsive Design
- Optimized for desktop and tablet viewing
- Large, clear status indicators
- High-contrast colors for industrial environment
- Touch-friendly button sizes

### Visual Feedback
- Progress stepper showing all 5 stages
- Color-coded status (cyan for active, emerald for complete, gray for locked)
- Toast notifications for errors and success messages
- Loading states during API calls

### Accessibility
- Clear typography with high contrast
- Logical tab order
- Descriptive labels and instructions
- Error messages in plain language

## Error Handling

### API Errors
- 400 Bad Request - Validation failures with descriptive messages
- 404 Not Found - Resource not found
- 500 Internal Server Error - Unexpected errors

### Client-Side Errors
- Network error handling with offline mode indicator
- User-friendly error messages in toast notifications
- Graceful degradation when backend unavailable

## Security Considerations

- Parameterized SQL queries to prevent SQL injection
- CORS configuration for frontend-backend communication
- Environment variables for sensitive configuration
- No authentication (as per assignment requirements)

## Testing Recommendations

### Manual Test Flow
1. Start application - should be at Stage 1 (Machine Checks)
2. Confirm all 6 machine checks in sequence
3. Click NEXT - should advance to Stage 2 (Tools)
4. Confirm all 4 tools in sequence
5. Click NEXT - should advance to Stage 3 (Workpiece Setup)
6. Confirm all 5 workpiece steps in sequence
7. Click NEXT - should advance to Stage 4 (Ready Review)
8. Verify READY state is shown
9. Click PROCEED - should advance to Stage 5 (Operation)
10. Click START - status should change to RUNNING
11. Click STOP - status should change to STOPPED
12. Click RESET - should return to Stage 1 with all items unconfirmed
13. Refresh browser - state should persist

### Validation Testing
- Try confirming items out of order - should fail with error
- Try advancing stage before completing items - should fail with error
- Try starting operation before completing all stages - should fail with error

## Project Structure

```
primeform-vmc-operator-hmi/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── stages/              # Stage-specific components
│   │   ├── services/            # API client
│   │   ├── data/                # Mock configuration
│   │   ├── App.jsx              # Main application
│   │   └── index.css            # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                      # Node.js backend
│   ├── src/
│   │   ├── db/                  # Database connection & schema
│   │   ├── routes/              # API route handlers
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Express middleware
│   │   ├── app.js               # Express app setup
│   │   └── server.js            # Server entry point
│   ├── .env                     # Environment variables
│   └── package.json
└── SUBMISSION.md                # This document
```

## Assignment Requirements Checklist

- ✅ One mock scenario with preloaded values
- ✅ Sequential operator workflow (5 stages)
- ✅ One stage displayed at a time
- ✅ Large, clear status and action controls
- ✅ No unrelated menus or features
- ✅ Machine checks with confirmation
- ✅ Required tools with confirmation
- ✅ Workpiece setup with confirmation
- ✅ Ready review with clear READY state
- ✅ Operation status (READY/RUNNING/STOPPED)
- ✅ Confirm control for each item
- ✅ Next control for stage advancement
- ✅ Start/Stop operation controls
- ✅ Responsive HMI
- ✅ Mock data
- ✅ REST API
- ✅ Simple persistence (MySQL)
- ✅ Only active instruction, progress, status, and essential controls

## Notes for Reviewers

- The backend runs on port 5001, frontend on port 5173
- MySQL database "primeform" must exist before first run
- All data is seeded automatically on first startup
- The application uses server-side validation for all workflow actions
- State persists in MySQL database across sessions
- No authentication is implemented (not required by assignment)

## Contact

For any questions about this submission, please refer to the assignment email thread.

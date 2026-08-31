import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'vmc_hmi.db');

export const db = new Database(dbPath);

// Enable WAL mode for better concurrency and fast writes
db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS machine_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      machine_name TEXT DEFAULT 'VMC-01',
      controller TEXT DEFAULT 'FANUC 0i-MF Plus',
      operation_title TEXT DEFAULT 'Pocket Machining',
      program_code TEXT DEFAULT 'O1024',
      program_revision TEXT DEFAULT 'Rev 03',
      drawing_no TEXT DEFAULT 'DWG-VM-1024',
      drawing_revision TEXT DEFAULT 'Rev B',
      material TEXT DEFAULT 'Aluminium 6061',
      fixture TEXT DEFAULT '3-Jaw Fixture',
      work_offset TEXT DEFAULT 'G54',
      current_stage TEXT DEFAULT 'MACHINE_CHECKS',
      operation_status TEXT DEFAULT 'READY',
      active_part INTEGER DEFAULT 1,
      total_parts INTEGER DEFAULT 10,
      cycle_seconds INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS machine_checks (
      id INTEGER PRIMARY KEY,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT NOT NULL,
      details TEXT,
      sequence INTEGER NOT NULL,
      confirmed INTEGER DEFAULT 0,
      confirmed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS tools (
      id INTEGER PRIMARY KEY,
      tool_number TEXT NOT NULL,
      tool_name TEXT NOT NULL,
      tool_type TEXT NOT NULL,
      diameter TEXT NOT NULL,
      program TEXT NOT NULL,
      program_revision TEXT NOT NULL,
      holder TEXT DEFAULT 'BT40-ER32',
      feed_rate TEXT DEFAULT '1200 mm/min',
      spindle_speed TEXT DEFAULT '8000 RPM',
      sequence INTEGER NOT NULL,
      confirmed INTEGER DEFAULT 0,
      confirmed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS workpiece_setup (
      id INTEGER PRIMARY KEY,
      step_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      instruction TEXT NOT NULL,
      details TEXT NOT NULL,
      highlight_datum TEXT,
      sequence INTEGER NOT NULL,
      confirmed INTEGER DEFAULT 0,
      confirmed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure default state exists
  const state = db.prepare('SELECT * FROM machine_state WHERE id = 1').get();
  if (!state) {
    db.prepare(`
      INSERT INTO machine_state (
        id, machine_name, controller, operation_title, program_code, 
        program_revision, drawing_no, drawing_revision, material, fixture, 
        work_offset, current_stage, operation_status, active_part, total_parts, cycle_seconds
      ) VALUES (
        1, 'VMC-01', 'FANUC 0i-MF Plus', 'Pocket Machining', 'O1024',
        'Rev 03', 'DWG-VM-1024', 'Rev B', 'Aluminium 6061', '3-Jaw Fixture',
        'G54', 'MACHINE_CHECKS', 'READY', 1, 10, 0
      )
    `).run();
  }

  // Populate checks if empty
  const checkCount = db.prepare('SELECT count(*) as count FROM machine_checks').get();
  if (checkCount.count === 0) {
    seedDatabase();
  }
}

export function seedDatabase(resetToInitial = false) {
  const insertCheck = db.prepare(`
    INSERT OR REPLACE INTO machine_checks (id, code, title, subtitle, description, details, sequence, confirmed, confirmed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTool = db.prepare(`
    INSERT OR REPLACE INTO tools (id, tool_number, tool_name, tool_type, diameter, program, program_revision, holder, feed_rate, spindle_speed, sequence, confirmed, confirmed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertWorkpiece = db.prepare(`
    INSERT OR REPLACE INTO workpiece_setup (id, step_number, title, instruction, details, highlight_datum, sequence, confirmed, confirmed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    // Reset state
    db.prepare(`
      UPDATE machine_state SET
        current_stage = 'MACHINE_CHECKS',
        operation_status = 'READY',
        active_part = 1,
        total_parts = 10,
        cycle_seconds = 0,
        last_updated = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run();

    // 6 Machine Checks
    const checks = [
      {
        id: 1,
        code: 'CHK-01',
        title: 'POWER / CONTROL AVAILABLE',
        subtitle: 'Main 415V 3-Phase & 24V DC Bus',
        description: 'Main incoming power and CNC controller ready. Auxiliary pneumatic pressure stable at 6.2 bar.',
        details: 'Verify system bus voltage indicators green and hydraulics active.',
        sequence: 1
      },
      {
        id: 2,
        code: 'CHK-02',
        title: 'E-STOP RELEASED',
        subtitle: 'Emergency Stop Circuit Healthy',
        description: 'Emergency stop pushbuttons on operator pendant and chip conveyor are pulled out and released.',
        details: 'Safety relay status: CLOSED (Channel 1 & 2 active).',
        sequence: 2
      },
      {
        id: 3,
        code: 'CHK-03',
        title: 'GUARD / DOOR CLOSED',
        subtitle: 'Enclosure Interlock Engaged',
        description: 'Safety enclosure sliding doors closed and mechanical interlocking switch firmly engaged.',
        details: 'Front door sensor OK. Automatic door lock armed.',
        sequence: 3
      },
      {
        id: 4,
        code: 'CHK-04',
        title: 'NO ACTIVE ALARM',
        subtitle: 'CNC Diagnostic Clear',
        description: 'No active servo, spindle, ATC, or system alarms present on the FANUC diagnostic panel.',
        details: 'Alarm status code 0000 (System Normal).',
        sequence: 4
      },
      {
        id: 5,
        code: 'CHK-05',
        title: 'LUBRICATION / COOLANT READY',
        subtitle: 'Way Lube & Flood Coolant Primed',
        description: 'Slideway central lubrication tank above minimum level. Flood coolant reservoir filled and delivery pump primed.',
        details: 'Coolant pressure 15 bar, Lube tank level 85%.',
        sequence: 5
      },
      {
        id: 6,
        code: 'CHK-06',
        title: 'REFERENCE RETURN COMPLETE',
        subtitle: 'All Axes Homed (X, Y, Z)',
        description: 'All machine linear axes returned to machine zero (G28 X0 Y0 Z0) reference position successfully.',
        details: 'Absolute encoders synchronized. Grid zero verified.',
        sequence: 6
      }
    ];

    checks.forEach(c => {
      insertCheck.run(c.id, c.code, c.title, c.subtitle, c.description, c.details, c.sequence, 0, null);
    });

    // 4 Tools
    const tools = [
      {
        id: 1,
        tool_number: 'T01',
        tool_name: 'Ø10 mm Face Mill',
        tool_type: 'Face Mill (Roughing & Facing)',
        diameter: 'Ø10 mm',
        program: 'O1024',
        program_revision: 'Rev 03',
        holder: 'BT40-FMA25.4',
        feed_rate: '1500 mm/min',
        spindle_speed: '6500 RPM',
        sequence: 1
      },
      {
        id: 2,
        tool_number: 'T02',
        tool_name: 'Ø8 mm End Mill',
        tool_type: 'End Mill (Pocket Roughing)',
        diameter: 'Ø8 mm',
        program: 'O1024',
        program_revision: 'Rev 03',
        holder: 'BT40-ER32-70',
        feed_rate: '1200 mm/min',
        spindle_speed: '7200 RPM',
        sequence: 2
      },
      {
        id: 3,
        tool_number: 'T03',
        tool_name: 'Ø6 mm End Mill',
        tool_type: 'End Mill (Finishing & Corner)',
        diameter: 'Ø6 mm',
        program: 'O1024',
        program_revision: 'Rev 03',
        holder: 'BT40-ER32-70',
        feed_rate: '950 mm/min',
        spindle_speed: '8000 RPM',
        sequence: 3
      },
      {
        id: 4,
        tool_number: 'T04',
        tool_name: 'Ø5 mm Drill',
        tool_type: 'Twist Drill (Mounting Holes)',
        diameter: 'Ø5 mm',
        program: 'O1024',
        program_revision: 'Rev 03',
        holder: 'BT40-ER25-60',
        feed_rate: '450 mm/min',
        spindle_speed: '3800 RPM',
        sequence: 4
      }
    ];

    tools.forEach(t => {
      insertTool.run(t.id, t.tool_number, t.tool_name, t.tool_type, t.diameter, t.program, t.program_revision, t.holder, t.feed_rate, t.spindle_speed, t.sequence, 0, null);
    });

    // 5 Workpiece Setup Steps
    const workpieceSteps = [
      {
        id: 1,
        step_number: 1,
        title: 'INSTALL FIXTURE',
        instruction: 'Install 3-jaw self-centering fixture on the machine table and secure T-slot bolts.',
        details: 'Verify fixture base alignment and torque clamping studs to 65 Nm.',
        highlight_datum: 'Fixture Table Alignment',
        sequence: 1
      },
      {
        id: 2,
        step_number: 2,
        title: 'POSITION WORKPIECE',
        instruction: 'Load Aluminium 6061 stock into 3-jaw fixture against backstop.',
        details: 'Material: Aluminium 6061-T6 | Drawing: DWG-VM-1024 Rev B.',
        highlight_datum: 'Stock Seating',
        sequence: 2
      },
      {
        id: 3,
        step_number: 3,
        title: 'CONFIRM ORIENTATION',
        instruction: 'Confirm workpiece orientation with Datum A facing operator.',
        details: 'Datum A facing operator; Datum B aligned with primary locator.',
        highlight_datum: 'Datum A Facing Front',
        sequence: 3
      },
      {
        id: 4,
        step_number: 4,
        title: 'CLAMP WORKPIECE',
        instruction: 'Secure the workpiece firmly in the fixture. Confirm correct orientation and datum position.',
        details: 'Apply uniform torque to 3-jaw chuck. Check zero play in stock.',
        highlight_datum: 'Fixture Clamping Verified',
        sequence: 4
      },
      {
        id: 5,
        step_number: 5,
        title: 'CONFIRM G54 WORK OFFSET',
        instruction: 'Set and verify G54 work coordinate offset against top-center datum of workpiece.',
        details: 'Coordinate Offset: G54 (X: 0.000, Y: 0.000, Z: +5.000 mm top face).',
        highlight_datum: 'G54 Active',
        sequence: 5
      }
    ];

    workpieceSteps.forEach(w => {
      insertWorkpiece.run(w.id, w.step_number, w.title, w.instruction, w.details, w.highlight_datum, w.sequence, 0, null);
    });

    // Log initialization
    db.prepare(`
      INSERT INTO operation_logs (event_type, message)
      VALUES ('SYSTEM_INIT', 'Database initialized and scenario loaded: VMC-01 Pocket Machining')
    `).run();
  });

  transaction();
}

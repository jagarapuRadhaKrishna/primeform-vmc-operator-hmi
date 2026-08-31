import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'primeform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = pool;

export async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS machine_state (
        id INT PRIMARY KEY,
        machine_name VARCHAR(100) DEFAULT 'VMC-01',
        controller VARCHAR(100) DEFAULT 'FANUC 0i-MF Plus',
        operation_title VARCHAR(100) DEFAULT 'Pocket Machining',
        program_code VARCHAR(50) DEFAULT 'O1024',
        program_revision VARCHAR(20) DEFAULT 'Rev 03',
        drawing_no VARCHAR(50) DEFAULT 'DWG-VM-1024',
        drawing_revision VARCHAR(20) DEFAULT 'Rev B',
        material VARCHAR(100) DEFAULT 'Aluminium 6061',
        fixture VARCHAR(100) DEFAULT '3-Jaw Fixture',
        work_offset VARCHAR(20) DEFAULT 'G54',
        current_stage VARCHAR(50) DEFAULT 'MACHINE_CHECKS',
        operation_status VARCHAR(50) DEFAULT 'READY',
        active_part INT DEFAULT 1,
        total_parts INT DEFAULT 10,
        cycle_seconds INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS machine_checks (
        id INT PRIMARY KEY,
        code VARCHAR(20) NOT NULL,
        title VARCHAR(100) NOT NULL,
        subtitle VARCHAR(100),
        description TEXT NOT NULL,
        details TEXT,
        sequence INT NOT NULL,
        confirmed TINYINT DEFAULT 0,
        confirmed_at TIMESTAMP NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tools (
        id INT PRIMARY KEY,
        tool_number VARCHAR(10) NOT NULL,
        tool_name VARCHAR(100) NOT NULL,
        tool_type VARCHAR(100) NOT NULL,
        diameter VARCHAR(20) NOT NULL,
        program VARCHAR(50) NOT NULL,
        program_revision VARCHAR(20) NOT NULL,
        holder VARCHAR(50) DEFAULT 'BT40-ER32',
        feed_rate VARCHAR(50) DEFAULT '1200 mm/min',
        spindle_speed VARCHAR(50) DEFAULT '8000 RPM',
        sequence INT NOT NULL,
        confirmed TINYINT DEFAULT 0,
        confirmed_at TIMESTAMP NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS workpiece_setup (
        id INT PRIMARY KEY,
        step_number INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        instruction TEXT NOT NULL,
        details TEXT NOT NULL,
        highlight_datum VARCHAR(100),
        sequence INT NOT NULL,
        confirmed TINYINT DEFAULT 0,
        confirmed_at TIMESTAMP NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS operation_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure default state exists
    const [states] = await connection.query('SELECT * FROM machine_state WHERE id = 1');
    if (states.length === 0) {
      await connection.query(`
        INSERT INTO machine_state (
          id, machine_name, controller, operation_title, program_code, 
          program_revision, drawing_no, drawing_revision, material, fixture, 
          work_offset, current_stage, operation_status, active_part, total_parts, cycle_seconds
        ) VALUES (
          1, 'VMC-01', 'FANUC 0i-MF Plus', 'Pocket Machining', 'O1024',
          'Rev 03', 'DWG-VM-1024', 'Rev B', 'Aluminium 6061', '3-Jaw Fixture',
          'G54', 'MACHINE_CHECKS', 'READY', 1, 10, 0
        )
      `);
    }

    // Populate checks if empty
    const [checkCounts] = await connection.query('SELECT COUNT(*) as count FROM machine_checks');
    if (checkCounts[0].count === 0) {
      await seedDatabase();
    }
  } finally {
    connection.release();
  }
}

export async function seedDatabase(resetToInitial = false) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Reset state
    await connection.query(`
      UPDATE machine_state SET
        current_stage = 'MACHINE_CHECKS',
        operation_status = 'READY',
        active_part = 1,
        total_parts = 10,
        cycle_seconds = 0
      WHERE id = 1
    `);

    // Clear existing data if resetting
    if (resetToInitial) {
      await connection.query('DELETE FROM machine_checks');
      await connection.query('DELETE FROM tools');
      await connection.query('DELETE FROM workpiece_setup');
      await connection.query('DELETE FROM operation_logs');
    }

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

    for (const c of checks) {
      await connection.query(
        'INSERT IGNORE INTO machine_checks (id, code, title, subtitle, description, details, sequence, confirmed, confirmed_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL)',
        [c.id, c.code, c.title, c.subtitle, c.description, c.details, c.sequence]
      );
    }

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

    for (const t of tools) {
      await connection.query(
        'INSERT IGNORE INTO tools (id, tool_number, tool_name, tool_type, diameter, program, program_revision, holder, feed_rate, spindle_speed, sequence, confirmed, confirmed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)',
        [t.id, t.tool_number, t.tool_name, t.tool_type, t.diameter, t.program, t.program_revision, t.holder, t.feed_rate, t.spindle_speed, t.sequence]
      );
    }

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

    for (const w of workpieceSteps) {
      await connection.query(
        'INSERT IGNORE INTO workpiece_setup (id, step_number, title, instruction, details, highlight_datum, sequence, confirmed, confirmed_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL)',
        [w.id, w.step_number, w.title, w.instruction, w.details, w.highlight_datum, w.sequence]
      );
    }

    // Log initialization
    await connection.query(
      'INSERT INTO operation_logs (event_type, message) VALUES (?, ?)',
      ['SYSTEM_INIT', 'Database initialized and scenario loaded: VMC-01 Pocket Machining']
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

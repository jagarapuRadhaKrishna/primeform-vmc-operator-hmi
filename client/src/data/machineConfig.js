// Centralized mock machine configuration for VMC Operator HMI
// This contains all static/preloaded machine data that would normally come from backend

export const machineConfig = {
  // Machine identity and controller info
  machine: {
    id: "VMC-01",
    name: "VMC-01",
    controller: "FANUC 0i-MF Plus",
    powerStatus: "POWER ON",
    connectionStatus: "ONLINE",
    program: "O1024",
    programRevision: "Rev 03",
    workOffset: "G54"
  },

  // Operation details
  operation: {
    name: "Pocket Milling",
    quantity: 10,
    material: "Aluminium 6061",
    drawingNumber: "DWG-VM-1024",
    drawingRevision: "Rev B",
    cncProgram: "O1024",
    programRevision: "Rev 03",
    fixture: "3-Jaw Fixture",
    workOffset: "G54"
  },

  // Machine checks - all start unconfirmed
  machineChecks: [
    {
      id: "CHK-01",
      sequence: 1,
      code: "CHK-01",
      title: "POWER / CONTROL AVAILABLE",
      description: "Main incoming power and CNC controller are ready.",
      confirmed: false
    },
    {
      id: "CHK-02",
      sequence: 2,
      code: "CHK-02",
      title: "E-STOP RELEASED",
      description: "Emergency stop is released and the machine can operate normally.",
      confirmed: false
    },
    {
      id: "CHK-03",
      sequence: 3,
      code: "CHK-03",
      title: "GUARD / DOOR CLOSED",
      description: "Machine guard and access doors are securely closed.",
      confirmed: false
    },
    {
      id: "CHK-04",
      sequence: 4,
      code: "CHK-04",
      title: "NO ACTIVE ALARM",
      description: "CNC control shows no active machine alarm.",
      confirmed: false
    },
    {
      id: "CHK-05",
      sequence: 5,
      code: "CHK-05",
      title: "LUBRICATION / COOLANT READY",
      description: "Required lubrication and coolant systems are ready.",
      confirmed: false
    },
    {
      id: "CHK-06",
      sequence: 6,
      code: "CHK-06",
      title: "REFERENCE RETURN COMPLETE",
      description: "Machine axes have completed reference return.",
      confirmed: false
    }
  ],

  // Required tools - all start unconfirmed
  tools: [
    {
      id: "TOL-01",
      toolNumber: "T01",
      type: "Ø10 mm Face Mill",
      program: "O1024",
      programRevision: "Rev 03",
      confirmed: false
    },
    {
      id: "TOL-02",
      toolNumber: "T02",
      type: "Ø8 mm End Mill",
      program: "O1024",
      programRevision: "Rev 03",
      confirmed: false
    },
    {
      id: "TOL-03",
      toolNumber: "T03",
      type: "Ø6 mm End Mill",
      program: "O1024",
      programRevision: "Rev 03",
      confirmed: false
    },
    {
      id: "TOL-04",
      toolNumber: "T04",
      type: "Ø5 mm Drill",
      program: "O1024",
      programRevision: "Rev 03",
      confirmed: false
    }
  ],

  // Workpiece setup instructions - all start unconfirmed
  workpieceSetup: [
    {
      id: "WRK-01",
      sequence: 1,
      title: "INSTALL FIXTURE",
      description: "Install and secure the 3-jaw fixture on the machine table.",
      confirmed: false
    },
    {
      id: "WRK-02",
      sequence: 2,
      title: "POSITION WORKPIECE",
      description: "Place the Aluminium 6061 workpiece securely into the fixture.",
      confirmed: false
    },
    {
      id: "WRK-03",
      sequence: 3,
      title: "CONFIRM ORIENTATION",
      description: "Orient the workpiece with Datum A facing the operator.",
      confirmed: false
    },
    {
      id: "WRK-04",
      sequence: 4,
      title: "CLAMP WORKPIECE",
      description: "Secure the workpiece firmly and verify that it cannot move.",
      confirmed: false
    },
    {
      id: "WRK-05",
      sequence: 5,
      title: "CONFIRM G54 WORK OFFSET",
      description: "Verify the programmed work offset is set to G54.",
      confirmed: false
    }
  ]
};

// Helper function to get initial operator state (all confirmations reset to false)
export const getInitialOperatorState = () => ({
  currentStage: 'MACHINE_CHECKS',
  operationStatus: 'READY',
  currentPart: 1,
  // Deep copy the config arrays with confirmed set to false
  checks: machineConfig.machineChecks.map(c => ({ ...c, confirmed: false })),
  tools: machineConfig.tools.map(t => ({ ...t, confirmed: false })),
  workpiece: machineConfig.workpieceSetup.map(w => ({ ...w, confirmed: false }))
});

import app from './app.js';

const PORT = process.env.PORT || 5000;
const MYSQLHOST = process.env.MYSQLHOST;

app.listen(PORT, MYSQLHOST, () => {
  console.log(`🚀 VMC Operator HMI Backend running on port ${PORT}`);
  console.log(`📡 API Health Check: http://${MYSQLHOST}:${PORT}/api/health`);
});

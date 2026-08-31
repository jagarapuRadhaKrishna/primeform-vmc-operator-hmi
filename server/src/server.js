import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 VMC Operator HMI Backend running on port ${PORT}`);
  console.log(`📡 API Health Check: http://0.0.0.0:${PORT}/api/health`);
});

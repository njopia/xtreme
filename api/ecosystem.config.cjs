module.exports = {
  apps: [{
    name: 'xtreme-api',
    script: 'server.js',
    restart_delay: 3000,
    max_restarts: 10,
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};

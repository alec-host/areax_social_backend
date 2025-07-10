module.exports = {
  apps: [
    {
      name: 'AREAX_SOCIAL_APP',
      script: 'app/app.js',
      exec_mode: 'cluster',
      instances: '3',
      interpreter: 'node',
      max_memory_restart: '180M',
      merge_logs: true,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};

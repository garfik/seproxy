module.exports = {
  apps : [
    {
      name      : 'se-proxy-app',
      script    : 'index.js',
      max_memory_restart: '768M',
      env: {
        "NODE_ENV": "production",
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};

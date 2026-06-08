module.exports = {
  apps: [{
    name: 'bahroz',
    script: './node_modules/.bin/next',
    args: ['start', '-p', '3002'],
    cwd: '/var/www/bahroz',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production'
    }
  }]
};

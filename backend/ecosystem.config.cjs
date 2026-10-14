module.exports = {
  apps: [
    {
      name: "ingetanime-api",
      script: "dist/src/main.js",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "500M",
      autorestart: true,
      watch: false,
    },
  ],
};
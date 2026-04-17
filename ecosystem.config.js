module.exports = {
  apps: [
    {
      name: "portofolio",
      script: "./server.js",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      watch: false,
      max_memory_restart: "700M",
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,

      node_args: "--max-old-space-size=512",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },

      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};

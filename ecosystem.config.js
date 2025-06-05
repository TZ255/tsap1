module.exports = {
  apps: [
    {
      name: "tsap1",
      script: "bot.js",
      instances: 1, // Change to 'max' for max instances based on CPU cores
      autorestart: true,
      watch: true,
      ignore_watch: ["public", "private", "storage", "node_modules", "*.log"],
      max_memory_restart: "1G", // Restart if memory usage exceeds 1GB
    }
  ]
};
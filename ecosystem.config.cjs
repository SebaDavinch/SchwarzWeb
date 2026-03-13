// PM2 ecosystem — управляет API-сервером и Telegram-ботом как отдельными сервисами
// Запуск:   npx pm2 start ecosystem.config.cjs
// Стоп:     npx pm2 stop all
// Логи:     npx pm2 logs
// Статус:   npx pm2 status
// Авторестарт при перезагрузке: npx pm2 startup && npx pm2 save

module.exports = {
  apps: [
    {
      name: "schwarz-api",
      script: "server/api-server.mjs",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
      },
      error_file: ".logs/api-error.log",
      out_file: ".logs/api-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
    {
      name: "schwarz-bot",
      script: "bot/bot.mjs",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "128M",
      // Перезапускать при падении, но с задержкой (чтобы не flood Telegram API)
      restart_delay: 5000,
      env: {
        NODE_ENV: "production",
      },
      error_file: ".logs/bot-error.log",
      out_file: ".logs/bot-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const express = require('express');
const app = express();
const token = '7125865296:AAHI_w7KGa152kCOVPNgsavTNIfatUR0hX8';
const bot = new TelegramBot(token, {polling: true});

let tasks = {};

// Load tasks from file
if (fs.existsSync('tasks.json')) {
  const tasksJson = fs.readFileSync('tasks.json', 'utf8');
  tasks = JSON.parse(tasksJson);
}

const watermark = "\n\nMADE BY @GAJARBOTOL";

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to Task Management Bot! You can use the following commands:\n\n/add <task> - Add a new task\n/list - List all tasks\n/delete <task number> - Delete a task by its number' + watermark);
});

bot.onText(/\/add (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const task = match[1];

  if (!tasks[chatId]) {
    tasks[chatId] = [];
  }

  tasks[chatId].push(task);
  fs.writeFileSync('tasks.json', JSON.stringify(tasks));
  bot.sendMessage(chatId, 'Task added successfully' + watermark);
});

bot.onText(/\/list/, (msg) => {
  const chatId = msg.chat.id;

  if (!tasks[chatId] || tasks[chatId].length === 0) {
    bot.sendMessage(chatId, 'No tasks found' + watermark);
    return;
  }

  let message = 'Tasks:\n';
  tasks[chatId].forEach((task, index) => {
    message += `${index + 1}. ${task}\n`;
  });

  bot.sendMessage(chatId, message + watermark);
});

bot.onText(/\/delete (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const taskIndex = Number(match[1]);

  if (!tasks[chatId] || tasks[chatId].length < taskIndex) {
    bot.sendMessage(chatId, 'Invalid task number' + watermark);
    return;
  }

  tasks[chatId].splice(taskIndex - 1, 1);
  fs.writeFileSync('tasks.json', JSON.stringify(tasks));
  bot.sendMessage(chatId, 'Task deleted successfully' + watermark);
});

// Express server for Render
app.get('/', (req, res) => {
  res.send('Task Management Bot is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

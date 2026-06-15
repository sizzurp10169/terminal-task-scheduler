#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'tasks.json')

async function readTasks() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}


async function writeTasks(tasks) {
  await fs.writeFile(DB_PATH, JSON.stringify(tasks, null, 2))
}

async function addTask(title) {
  if (!title) return console.log('Error: Reduce task title.')
  const tasks = await readTasks()
  const newTask = {
    id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
    title,
    status: 'in progress',
    createdAt: new Date().toLocaleDateString()
  };
  tasks.push(newTask)
  await writeTasks(tasks)
  console.log(`Task "${title}" added successful! (ID: ${newTask.id})`)
}

async function listTasks() {
  const tasks = await readTasks()
  if (tasks.length === 0) 
    return 
console.log('List is empty.')
  
  console.log('\n=== YOUR TASK LIST ===')
  tasks.forEach(t => {
    const icon = t.status === 'passed' ? '🟢' : '🟡'
    console.log(`[${t.id}] ${icon} ${t.title} (${t.status}) — ${t.createdAt}`)
  })
  console.log('========================\n')
}

async function completeTask(id) {
  const taskId = parseInt(id)
  if (isNaN(taskId)) 
    return 
console.log('Error: Indicate correct ID.')
  
  const tasks = await readTasks()
  const task = tasks.find(t => t.id === taskId)
  
  if (!task) 
    return 
console.log(`Error: ID Task ${taskId} not found.`)
  
  task.status = 'success'
  await writeTasks(tasks)
  console.log(`Task "${task.title}" marked as completed!`)
}

async function deleteTask(id) {
  const taskId = parseInt(id)
  if (isNaN(taskId)) return console.log('Error: Indicate correct ID.')
  
  let tasks = await readTasks()
  const initialLength = tasks.length
  tasks = tasks.filter(t => t.id !== taskId)
  
  if (tasks.length === initialLength) {
    return console.log(`Error: ID Task ${taskId} not found.`)
  }
  
  await writeTasks(tasks)
  console.log(`ID Task ${taskId} deleted successful.`)
}

const [,, command, ...args] = process.argv

switch (command) {
  case 'add':
    addTask(args.join(' '))
    break
  case 'list':
    listTasks()
    break
  case 'done':
    completeTask(args[0])
    break
  case 'del':
    deleteTask(args[0])
    break
  default:
    console.log(`
Using:
  node index.js add <title>            - Display
  node index.js list                   - Show all
  node index.js done <id>              - Mark as completed
  node index.js del <id>               - Delete
    `)
}

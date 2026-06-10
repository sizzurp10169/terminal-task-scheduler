import fs from 'fs/promises'
import path from 'path'

const FILE_PATH = path.resolve('./tasks.json')


export async function loadTasks() {
  try {
    const data = await fs.readFile(FILE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [] 
    }
    console.error('Ошибка при чтении файла задач, загружен пустой список.')
    return []
  }
}


export async function saveTasks(tasks) {
  try {
    await fs.writeFile(FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8')
  } catch (error) {
    console.error('Не удалось сохранить изменения в файл:', error.message)
  }
}


export function isValidDate(dateStr) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/
  if (!dateStr.match(regEx)) return false
  const d = new Date(dateStr)
  const dNum = d.getTime()
  if (!dNum && dNum !== 0) return false
  return d.toISOString().slice(0, 10) === dateStr
}

export function filterAndSortTasks(tasks, filters = {}) {
  let result = [...tasks]

  if (filters.category) {
    result = result.filter(t => t.category.toLowerCase() === filters.category.toLowerCase())
  }
  if (filters.urgent !== undefined) {
    result = result.filter(t => t.isUrgent === filters.urgent)
  }
  if (filters.status !== undefined) {
    result = result.filter(t => t.completed === (filters.status === 'completed'))
  }

  result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  return result
}

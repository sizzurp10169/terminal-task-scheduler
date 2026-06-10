import readline from 'readline'
import { loadTasks, saveTasks, isValidDate, filterAndSortTasks } from './storage.js'

let tasks = []

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Обертка над readline для использования async/await
const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve))

// Инициализация приложения
async function init() {
  tasks = await loadTasks()
  console.clear()
  console.log('=========================================')
  console.log('   ДОБРО ПОЖАЛОВАТЬ В ТЕРМИНАЛЬНЫЙ ТДО-ЛИСТ!   ')
  console.log('=========================================')
  showHelp()
  mainMenu()
}

function showHelp() {
  console.log('\nДоступные команды:')
  console.log('  1 — Показать все задачи (отсортированы по дате)')
  console.log('  2 — Добавить новую задачу')
  console.log('  3 — Редактировать задачу')
  console.log('  4 — Удалить задачу')
  console.log('  5 — Фильтровать задачи')
  console.log('  6 — Показать справку')
  console.log('  0 — Выход')
}

// Главный цикл меню
async function mainMenu() {
  while (true) {
    const choice = (await askQuestion('\nВыберите действие (0-6): ')).trim()
    
    switch (choice) {
      case '1':
        displayTasks(tasks)
        break
      case '2':
        await addTask()
        break
      case '3':
        await editTask()
        break
      case '4':
        await deleteTask()
        break
      case '5':
        await handleFiltering()
        break
      case '6':
        showHelp()
        break
      case '0':
        console.log('До свидания!')
        rl.close()
        return
      default:
        console.log('Неверный ввод. Введите цифру от 0 до 6.')
    }
  }
}

// Вывод задач на экран
function displayTasks(tasksList) {
  if (tasksList.length === 0) {
    console.log('\n[Список задач пуст]')
    return;
  }
  
  // Форматируем данные для красивого вывода в console.table
  const tableData = tasksList.map(t => ({
    ID: t.id,
    Название: t.title,
    Категория: t.category,
    Срок: t.dueDate,
    Срочно: t.isUrgent ? ' Да' : 'Нет',
    Статус: t.completed ? ' Выполнено' : ' В процессе'
  }));
  
  console.log('\n--- Список задач ---')
  console.table(tableData)
}

// Добавление задачи
async function addTask() {
  console.log('\n--- Создание новой задачи ---')
  
  const title = (await askQuestion('Название: ')).trim()
  if (!title) return console.log(' Название не может быть пустым.')

  const description = (await askQuestion('Описание: ')).trim()
  const category = (await askQuestion('Категория (например: Дом, Учёба): ')).trim() || 'Общее'
  
  let dueDate = ''
  while (true) {
    dueDate = (await askQuestion('Срок выполнения (ГГГГ-ММ-ДД): ')).trim()
    if (isValidDate(dueDate)) break
    console.log(' Неверный формат даты. Используйте ГГГГ-ММ-ДД.')
  }

  const urgentInput = (await askQuestion('Срочная задача? (y/n): ')).trim().toLowerCase()
  const isUrgent = urgentInput === 'y' || urgentInput === 'yes'

  const newTask = {
    id: Date.now().toString().slice(-6), // Простая генерация короткого уникального ID
    title,
    description,
    category,
    dueDate,
    isUrgent,
    completed: false
  };

  tasks.push(newTask)
  await saveTasks(tasks)
  console.log(`\n Задача "${title}" успешно добавлена! ID: ${newTask.id}`)
}

// Редактирование задачи
async function editTask() {
  console.log('\n--- Редактирование задачи ---')
  const id = (await askQuestion('Введите ID задачи для редактирования: ')).trim()
  
  const task = tasks.find(t => t.id === id)
  if (!task) return console.log(' Задача с таким ID не найдена.')

  console.log(`\nРедактируем: [${task.title}]. Оставьте поле пустым, если не хотите его менять.`)

  const title = (await askQuestion(`Новое название (${task.title}): `)).trim()
  if (title) task.title = title

  const description = (await askQuestion(`Новое описание (${task.description}): `)).trim()
  if (description) task.description = description

  const category = (await askQuestion(`Новая категория (${task.category}): `)).trim()
  if (category) task.category = category

  while (true) {
    const dueDate = (await askQuestion(`Новый срок (${task.dueDate}): `)).trim()
    if (!dueDate) break
    if (isValidDate(dueDate)) {
      task.dueDate = dueDate
      break
    }
    console.log(' Неверный формат даты. Используйте ГГГГ-ММ-ДД.')
  }

  const urgentInput = (await askQuestion(`Срочная? (текущий статус: ${task.isUrgent ? 'да' : 'нет'}) (y/n): `)).trim().toLowerCase()
  if (urgentInput) task.isUrgent = (urgentInput === 'y' || urgentInput === 'yes')

  const statusInput = (await askQuestion(`Выполнена? (текущий статус: ${task.completed ? 'да' : 'нет'}) (y/n): `)).trim().toLowerCase()
  if (statusInput) task.completed = (statusInput === 'y' || statusInput === 'yes')

  await saveTasks(tasks)
  console.log('\n Задача успешно обновлена!')
}

// Удаление задачи
async function deleteTask() {
  console.log('\n--- Удаление задачи ---')
  const id = (await askQuestion('Введите ID задачи для удаления: ')).trim()
  
  const taskIndex = tasks.findIndex(t => t.id === id)
  if (taskIndex === -1) return console.log(' Задача с таким ID не найдена.')

  tasks.splice(taskIndex, 1)
  await saveTasks(tasks)
  console.log('\n Задача успешно удалена!')
}

// Меню фильтрации
async function handleFiltering() {
  console.log('\n--- Настройка фильтров ---')
  console.log('1 — По категории')
  console.log('2 — Только срочные')
  console.log('3 — Только невыполненные (Pending)')
  console.log('4 — Только выполненные (Completed)')
  
  const filterChoice = (await askQuestion('Выберите вариант фильтрации (1-4): ')).trim();
  let filters = {}

  switch (filterChoice) {
    case '1':
      const category = (await askQuestion('Введите название категории: ')).trim()
      filters.category = category
      break
    case '2':
      filters.urgent = true
      break
    case '3':
      filters.status = 'pending'
      break
    case '4':
      filters.status = 'completed'
      break
    default:
      console.log('Фильтр не выбран.')
      return
  }

  const filtered = filterAndSortTasks(tasks, filters)
  displayTasks(filtered)
}

// Запуск программы
init().catch(err => console.error('Критическая ошибка приложения:', err))

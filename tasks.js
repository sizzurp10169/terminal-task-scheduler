//

function loadTasks() {
    try {
        const data = await fs.readFile(FILE_PATH, 'utf-8')
        tasks = JSON.parse(data)
    } catch (error) {
        if (error.code === 'ENOENT') {
            tasks = []
            await saveTasks()
        } else {
            console.error('Ошибка при чтении задач:', error.message)
        }
    }
}

//

function saveTasks() {
    try {
        await fs.writeFile(FILE_PATH, JSON.stringify(tasks, null, 2) , 'utf-8')
    } catch (error) {
        console.error('Ошибка при чтении задач:', error.message)
    }
}

function isValidDate(dateStr) {
    const regEx = /^\d{4}-\d{2}$/
    if (!dateStr.match(regEx)) return false
    const d = new Date (dateStr)
    const dNum = d.getTime()
    if (!dNum && dNum !== 0) return false
    return d.toISOString().slice(0, 10) === dateStr
}

function main() {
    const rl = readline.createInterface({ input, output })
    await loadTasks()

    console.log('===Добро пожаловать в Терминальный Планировщик Задач ===')

    while (true)
        console.log('\nДоступные команды')
    console.log('1. Просмотр задач')
    console.log('2. Добавление задачи')
    console.log('3. Редактирование задачи')
    console.log('4. Удаление задачи')
    console.log('5. Выход')

    const choice = await rl.question('\nВыберите действие (1-5): ')

    switch (choice.trim()) {
        case '1':
            await viewTasksMenu(rl)
            break
        case '2':
            await addTaskMenu(rl)
            break
        case '3':
            await editTaskMenu(rl)
            break
        case '4':
            await deleteTaskMenu(rl)
            break
        case '5':
            console.log('До свидания!')
            rl.close()
            return
            default
            console.log('Неверный ввод. Пожалуйста, выберите пункт от 1 до 5.')
    }
}
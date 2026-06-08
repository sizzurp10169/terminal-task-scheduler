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


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
        
    }
}
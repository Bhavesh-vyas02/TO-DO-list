class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.initializeTheme();
        this.initializeEventListeners(); 
        this.initializeDragAndDrop();
        this.renderTasks();
        this.updateTaskStats();
    }

    initializeDragAndDrop() {
        const taskList = document.getElementById('taskList');
        
        taskList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
            }
        });

        taskList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.remove('dragging');
            }
        });

        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(taskList, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterElement == null) {
                taskList.appendChild(draggable);
            } else {
                taskList.insertBefore(draggable, afterElement);
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    
    initializeEventListeners() {
        try {
            const addButton = document.getElementById('addButton');
            const searchInput = document.getElementById('searchInput');
            const filterPriority = document.getElementById('filterPriority');
            const filterCategory = document.getElementById('filterCategory');
            const filterStatus = document.getElementById('filterStatus');

            if (addButton) {
                addButton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await this.addTask();
                });
            }

            if (searchInput) {
                searchInput.addEventListener('input', this.debounce(() => this.filterTasks(), 300));
            }

            filterPriority?.addEventListener('change', () => this.filterTasks());
            filterCategory?.addEventListener('change', () => this.filterTasks());
            filterStatus?.addEventListener('change', () => this.filterTasks());

            
            document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
            
            // Add theme toggle
            const themeToggle = document.getElementById('themeToggle');
            themeToggle?.addEventListener('click', () => this.toggleTheme());

            
            document.getElementById('exportBtn')?.addEventListener('click', () => this.exportTasks());
            document.getElementById('importBtn')?.addEventListener('change', (e) => this.importTasks(e.target.files[0]));
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    async addTask() {
        try {
            const input = document.getElementById('taskInput');
            const title = input?.value.trim();
            if (!title) return;

            const task = {
                id: Date.now(),
                title,
                description: document.getElementById('taskDescription')?.value || '',
                priority: document.getElementById('prioritySelect')?.value || 'low',
                dueDate: document.getElementById('dueDate')?.value || '',
                category: document.getElementById('categorySelect')?.value || 'other',
                completed: false,
                createdAt: new Date().toISOString(),
                subtasks: [],
                comments: [],
                timeTracking: {
                    started: null,
                    elapsed: 0
                }
            };

            this.tasks.push(task);
            await this.saveTasks();
            this.renderTasks();
            if (input) input.value = '';
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    filterTasks() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const priorityFilter = document.getElementById('filterPriority').value;
        const categoryFilter = document.getElementById('filterCategory').value;
        const statusFilter = document.getElementById('filterStatus').value;

        const filteredTasks = this.tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm);
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'completed' ? task.completed : !task.completed);

            return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
        });

        this.renderTaskList(filteredTasks);
    }

    renderTasks() {
        this.renderTaskList(this.tasks);
        this.updateTaskStats();
    }

    renderTaskList(tasks) {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';

        tasks.forEach(task => {
            this.renderTask(task);
        });
    }

    renderTask(task) {
        const taskElement = document.createElement('li');
        taskElement.className = 'task-item';
        taskElement.draggable = true;
        taskElement.dataset.taskId = task.id;
        
        taskElement.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-details">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    <span>${task.category}</span>
                    ${task.dueDate ? `<span>Due: ${task.dueDate}</span>` : ''}
                </div>
            </div>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        `;

        taskElement.querySelector('input[type="checkbox"]').addEventListener('change', 
            () => this.toggleTask(task.id));
        taskElement.querySelector('.delete-btn').addEventListener('click', 
            () => this.deleteTask(task.id));

        document.getElementById('taskList').appendChild(taskElement);
    }

    updateTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = `Total: ${total}`;
        document.getElementById('completedTasks').textContent = `Completed: ${completed}`;
        document.getElementById('pendingTasks').textContent = `Pending: ${pending}`;
    }

    async saveTasks() {
        try {
            await localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

    initializeTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        
        document.body.classList.toggle('dark-mode', isDarkMode);
        
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
        });
    }

    
    addSubtask(parentId, title) {
        const parent = this.tasks.find(t => t.id === parentId);
        if (parent) {
            parent.subtasks.push({
                id: Date.now(),
                title,
                completed: false,
                createdAt: new Date().toISOString()
            });
            this.saveTasks();
            this.renderTasks();
        }
    }

    
    toggleTimeTracking(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            if (task.timeTracking.started) {
                task.timeTracking.elapsed += Date.now() - task.timeTracking.started;
                task.timeTracking.started = null;
            } else {
                task.timeTracking.started = Date.now();
            }
            this.saveTasks();
            this.renderTasks();
        }
    }

    
    saveAsTemplate(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const templates = JSON.parse(localStorage.getItem('taskTemplates') || '[]');
            templates.push({ ...task, isTemplate: true });
            localStorage.setItem('taskTemplates', JSON.stringify(templates));
        }
    }

    
    exportTasks(format = 'json') {
        const data = JSON.stringify(this.tasks, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks_${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async importTasks(file) {
        try {
            const text = await file.text();
            const importedTasks = JSON.parse(text);
            this.tasks = [...this.tasks, ...importedTasks];
            await this.saveTasks();
            this.renderTasks();
        } catch (error) {
            console.error('Error importing tasks:', error);
        }
    }

    
    handleKeyboardShortcuts(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.addTask();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.toggleTheme();
        }
    }
}


window.addEventListener('DOMContentLoaded', () => {
    try {
        window.taskManager = new TaskManager();
    } catch (error) {
        console.error('Error initializing TaskManager:', error);
    }
});


window.addEventListener('unload', () => {
    if (window.taskManager) {
        window.taskManager.saveTasks().catch(console.error);
    }
});
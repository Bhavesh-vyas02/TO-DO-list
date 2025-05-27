interface Task {
    id: number;
    title: string;
    completed: boolean;
}

interface TaskList {
    tasks: Task[];
    addTask(title: string): void;
    removeTask(id: number): void;
    toggleTaskCompletion(id: number): void;
}
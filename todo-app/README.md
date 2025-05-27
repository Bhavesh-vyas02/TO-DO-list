# README.md

# ✨ Task Master

A modern, feature-rich task management application built with HTML, CSS, and JavaScript.

## 🚀 Features

- **Task Management**
  - Create, edit, and delete tasks
  - Set priority levels (High 🔴, Medium 🟡, Low 🟢)
  - Add due dates
  - Categorize tasks (Personal, Work, Shopping, Other)
  - Mark tasks as complete/incomplete

- **Organization**
  - Drag and drop to reorder tasks
  - Filter tasks by:
    - Priority
    - Category
    - Status (Completed/Pending)
  - Search tasks
  - Task statistics

- **Data Management**
  - Local storage persistence
  - Import/Export tasks (JSON format)

- **User Interface**
  - Clean, modern design
  - Dark/Light theme toggle
  - Responsive layout
  - Smooth animations
  - Accessibility features

## 🛠️ Technical Details

### Technologies Used
- HTML5
- CSS3
- JavaScript (ES6+)
- Font Awesome Icons
- Local Storage API

### Project Structure
```
todo-app/
├── src/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
└── README.md
```

## 🚦 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Bhavesh-vyas02/TO-DO-list.git
cd todo-app
```

2. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

## 💡 Usage

1. **Adding Tasks**
   - Enter task description
   - Select priority level
   - Set due date
   - Choose category
   - Click "Add Task" or press Enter

2. **Managing Tasks**
   - Click checkbox to mark as complete
   - Drag tasks to reorder
   - Use filters to sort and find tasks
   - Use search to find specific tasks

3. **Data Management**
   - Tasks are automatically saved to local storage
   - Use Export/Import buttons to backup or transfer tasks

## 🎨 Customization

The app uses CSS variables for easy theme customization. Main colors and styles can be modified in `style.css`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
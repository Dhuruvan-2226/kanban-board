import React, { useState } from 'react';
import './KanbanBoard.css';

const initialTasks = {
  todo: ['Task 1', 'Task 2'],
  inprogress: ['Task 3'],
  done: ['Task 4'],
  trash: []
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingTask, setEditingTask] = useState({ key: '', index: null });
  const [editedText, setEditedText] = useState('');

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => ({
      ...prev,
      todo: [...prev.todo, newTask.trim()]
    }));
    setNewTask('');
  };

  const handleDragStart = (task, from) => {
    setDraggedTask(task);
    setDraggedFrom(from);
  };

  const handleDrop = (to, index = null) => {
    if (draggedFrom === null || draggedTask === null) return;
    setTasks(prev => {
      const newTasks = { ...prev };
      newTasks[draggedFrom] = newTasks[draggedFrom].filter(t => t !== draggedTask);
      if (to === 'trash') {
        if (window.confirm(`Do you want to delete "${draggedTask}"?`)) {
          return newTasks;
        } else {
          if (!newTasks[draggedFrom].includes(draggedTask)) {
            newTasks[draggedFrom].push(draggedTask);
          }
          return newTasks;
        }
      }

      if (to === draggedFrom) {
        const list = [...newTasks[to]];
        list.splice(index, 0, draggedTask);
        newTasks[to] = [...new Set(list)]; 
      } else {
        if (!newTasks[to].includes(draggedTask)) {
          newTasks[to].splice(index !== null ? index : newTasks[to].length, 0, draggedTask);
        }
      }

      return newTasks;
    });

    setDraggedTask(null);
    setDraggedFrom(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };

  const handleEditStart = (key, index, text) => {
    setEditingTask({ key, index });
    setEditedText(text);
  };

  const handleEditSave = () => {
    const { key, index } = editingTask;
    if (!editedText.trim()) return;
    setTasks(prev => {
      const updated = [...prev[key]];
      updated[index] = editedText.trim();
      return { ...prev, [key]: updated };
    });
    setEditingTask({ key: '', index: null });
    setEditedText('');
  };

  const renderColumn = (title, key, className) => (
    <div
      className={`column ${className}`}
      onDragOver={(e) => handleDragOver(e, tasks[key].length)}
      onDrop={() => handleDrop(key)}
    >
      <h3>{title}</h3>
      {tasks[key].map((task, idx) => {
        const isEditing = editingTask.key === key && editingTask.index === idx;
        return (
          <div
            key={task + idx}
            className="task"
            draggable={!isEditing}
            onDragStart={() => handleDragStart(task, key)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(key, idx)}
            onDoubleClick={() => handleEditStart(key, idx, task)}
          >
            {isEditing ? (
              <div className="edit-box">
                <input
                  type="text"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave();
                  }}
                  autoFocus
                />
                <button onClick={handleEditSave}>Save</button>
              </div>
            ) : (
              task
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="kanban-wrapper">
      <h1 className="main-heading">Kanban Board</h1>
      <div className="input-section">
        <input
          type="text"
          placeholder="Add a task to To-Do"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={handleAddTask}>Add</button>
      </div>

      <div className="kanban-container">
        {renderColumn('To-Do', 'todo', 'todo')}
        {renderColumn('In Progress', 'inprogress', 'inprogress')}
        {renderColumn('Done', 'done', 'done')}
        {renderColumn('Trash Bin', 'trash', 'trash')}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { List, Checkbox, Button, Modal, Card, Typography, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  useGetTodosQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  type Todo
} from './store/api';
import { TodoForm } from './TodoForm';

const { Title } = Typography;

function App() {
  // RTK Query хуки
  const { data: todos, isLoading, isError } = useGetTodosQuery();
  const [addTodo, { isLoading: isAdding }] = useAddTodoMutation();
  const [updateTodo] = useUpdateTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  // Состояние для редактирования
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Обработчики
  const handleCreate = async (data: { title: string }) => {
    try {
      await addTodo({ title: data.title, completed: false }).unwrap();
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
    }
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (data: { title: string }) => {
    if (editingTodo) {
      try {
        await updateTodo({ ...editingTodo, title: data.title }).unwrap();
        setIsModalOpen(false);
        setEditingTodo(null);
      } catch (error) {
        console.error('Ошибка при обновлении задачи:', error);
      }
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      await updateTodo({ ...todo, completed: !todo.completed }).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса задачи:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTodo(id).unwrap();
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
    }
  };

  if (isLoading) return <Spin indicator={<LoadingOutlined spin />} size="large" style={{ display: 'block', margin: '50px auto' }} />;
  if (isError) return <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: 'darkblue' }}>500 — Internal Server Error</div>;

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: '0 20px' }}>
      <Card>
        <Title level={1} style={{ textAlign: 'center' }}>todos</Title>
        
        {/* Форма создания */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <TodoForm onSubmit={handleCreate} isLoading={isAdding} btnText="Добавить" />
        </div>

        {/* Список задач */}
        <List
          bordered
          dataSource={todos || []}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  key="edit"
                  icon={<EditOutlined />} 
                  onClick={() => handleEditClick(item)} 
                />,
                <Button 
                  key="delete"
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDelete(item.id)} 
                />
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Checkbox 
                    checked={item.completed} 
                    onChange={() => handleToggle(item)} 
                  />
                }
                title={
                  <span style={{ 
                    textDecoration: item.completed ? 'line-through' : 'none',
                    color: item.completed ? '#999' : 'inherit'
                  }}>
                    {item.title}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Модалка для редактирования */}
      <Modal
        title="Редактировать задачу"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingTodo(null);
        }}
        footer={null}
      >
        {editingTodo && (
          <TodoForm 
            initialValues={editingTodo} 
            onSubmit={handleUpdateSubmit} 
            btnText="Сохранить" 
          />
        )}
      </Modal>
    </div>
  );
}

export default App;

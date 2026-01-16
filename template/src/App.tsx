import React, { useState } from 'react'
import { List, Checkbox, Button, Modal, Card, Typography, Spin } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  useGetTodosQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  Todo
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
    await addTodo({ title: data.title, completed: false });
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (data: { title: string }) => {
    if (editingTodo) {
      await updateTodo({ ...editingTodo, title: data.title });
      setIsModalOpen(false);
      setEditingTodo(null);
    }
  };

  const handleToggle = (todo: Todo) => {
    updateTodo({ ...todo, completed: !todo.completed });
  };

  const handleDelete = (id: number) => {
    deleteTodo(id);
  };

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  if (isError) return <div>Ошибка загрузки данных :( Проверь, запущен ли json-server</div>;

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: '0 20px' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center' }}>TODO LIST (RTK + Antd)</Title>
        
        {/* Форма создания */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <TodoForm onSubmit={handleCreate} isLoading={isAdding} btnText="Добавить" />
        </div>

        {/* Список задач */}
        <List
          bordered
          dataSource={todos}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => handleEditClick(item)} 
                />,
                <Button 
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
        onCancel={() => setIsModalOpen(false)}
        footer={null} // Скрываем стандартный футер, используем кнопку формы
        destroyOnClose
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

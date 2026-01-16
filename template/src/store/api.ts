import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  deleted?: boolean;
}

export const todoApi = createApi({
  reducerPath: 'todoApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3001' }),
  tagTypes: ['Todos'], // Теги нужны для авто-обновления списка
  endpoints: (builder) => ({
    // 1. Получить задачи
    getTodos: builder.query<Todo[], void>({
      query: () => 'todos',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Todos' as const, id })),
              { type: 'Todos', id: 'LIST' },
            ]
          : [{ type: 'Todos', id: 'LIST' }],
    }),
    // 2. Добавить задачу
    addTodo: builder.mutation<Todo, Partial<Todo>>({
      query: (body) => ({
        url: 'todos',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Todos', id: 'LIST' }],
    }),
    // 3. Обновить задачу (редактирование или галочка)
    updateTodo: builder.mutation<Todo, Todo>({
      query: (body) => ({
        url: `todos/${body.id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Todos', id }],
    }),
    // 4. Удалить задачу (помечаем как deleted вместо реального удаления)
    deleteTodo: builder.mutation<Todo, Todo>({
      query: (body) => ({
        url: `todos/${body.id}`,
        method: 'PUT',
        body: { ...body, deleted: true },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Todos', id }],
    }),
    // 5. Физически удалить задачу (для очистки удаленных)
    permanentlyDeleteTodo: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `todos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Todos', id }, { type: 'Todos', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  usePermanentlyDeleteTodoMutation,
} = todoApi;

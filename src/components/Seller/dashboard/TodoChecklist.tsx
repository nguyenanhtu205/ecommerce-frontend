import { type TodoItem } from '@/types';
import { Link } from 'react-router-dom';

type TodoChecklistProps = {
  todos: TodoItem[];
};

export default function TodoChecklist({ todos }: TodoChecklistProps) {
  return (
    <div className='bg-white p-6 shadow-sm'>
      <h2 className='text-base font-medium text-slate-800'>Danh sách cần làm</h2>
      <p className='mt-1 text-sm text-slate-400'>Những việc bạn sẽ phải làm</p>

      {todos.length === 0 ? (
        <div className='mt-6 space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='h-4 w-full animate-pulse bg-slate-100' />
          ))}
        </div>
      ) : (
        <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
          {todos.map((todo) => (
            <div
              key={todo.id}
              className='flex items-center justify-between border border-slate-100 px-4 py-3'
            >
              <div>
                <p className='text-sm text-slate-600'>{todo.label}</p>
                <p className='mt-1 text-xl font-medium text-[#EE4D2D]'>{todo.count}</p>
              </div>
              <Link to={todo.link} className='text-xs text-sky-600 hover:underline'>
                {todo.actionLabel}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

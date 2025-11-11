import React, { ReactNode } from 'react';
import { Plus} from 'lucide-react';

interface CardProps {
  children: ReactNode;
  title?: string | ReactNode;
  className?: string;
  onAdd?: () => void;
}

const Card: React.FC<CardProps> = ({ children, title, className = '', onAdd }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      {(title || onAdd) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          {title && (
            typeof title === 'string' ? (
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
            ) : title
          )}
          {onAdd && (
            <button
              onClick={onAdd}
              className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1"
              title="Ajouter"
            >
              <Plus className="w-5 h-5" /> ajouter
            </button>
          )}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default Card;

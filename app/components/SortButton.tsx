import { ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';

interface SortButtonProps {
  onClick: () => void;
  isActive: boolean;
  label: string;
}

export default function SortButton({ onClick, isActive, label }: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800',
        {
          'text-gray-900 dark:text-gray-100': isActive,
          'text-gray-500 dark:text-gray-400': !isActive
        }
      )}
    >
      {label}
      <ArrowUpDown className="h-4 w-4" />
    </button>
  );
} 
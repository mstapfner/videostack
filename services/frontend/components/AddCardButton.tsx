import { Plus } from 'lucide-react';

interface AddCardButtonProps {
  onAdd: () => void;
}

export function AddCardButton({ onAdd }: AddCardButtonProps) {
  return (
    <div className="flex items-center">
      <button
        onClick={onAdd}
        className="
          w-6 h-32
          bg-neutral-800 border border-neutral-700 rounded-lg
          flex items-center justify-center
          transition-all duration-200
          hover:bg-neutral-700 hover:border-blue-500/50 hover:shadow-lg
          group
        "
      >
        <Plus className="w-5 h-5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
      </button>
    </div>
  );
}


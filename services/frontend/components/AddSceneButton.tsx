import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddSceneButtonProps {
  onAdd: () => void;
}

export function AddSceneButton({ onAdd }: AddSceneButtonProps) {
  return (
    <div className="flex justify-center mb-6">
      <Button
        variant="outline"
        onClick={onAdd}
        className="
          h-20 w-40 border-2 border-dashed border-neutral-700
          hover:border-blue-500 hover:bg-blue-500/5
          transition-all duration-200
          flex flex-col items-center justify-center space-y-2
        "
      >
        <Plus className="w-6 h-6 text-neutral-400" />
        <span className="text-sm text-neutral-400">Add Scene</span>
      </Button>
    </div>
  );
}


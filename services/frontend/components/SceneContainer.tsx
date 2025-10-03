"use client"

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Scene, StoryboardCard } from '@/store/storyboard';
import { VideoCard } from '@/components/VideoCard';
import { AddCardButton } from '@/components/AddCardButton';
import { GripVertical, Plus, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

interface SceneContainerProps {
  scene: Scene;
  sceneIndex: number;
  onEditShot: (shot: StoryboardCard) => void;
  onDeleteShot: (sceneId: string, shotId: string) => void;
  onAddShot: (sceneId: string, index: number) => void;
  onAddScene: (index: number) => void;
  onDeleteScene: (sceneId: string) => void;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onReorderShotsInScene: (sceneId: string, activeId: string, overId: string) => void;
  pixelsPerSecond?: number;
  disableDragAndDrop?: boolean;
}

export function SceneContainer({ 
  scene,
  sceneIndex,
  onEditShot, 
  onDeleteShot, 
  onAddShot, 
  onAddScene,
  onDeleteScene, 
  onUpdateScene,
  onReorderShotsInScene,
  pixelsPerSecond = 60,
  disableDragAndDrop = false
}: SceneContainerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(scene.name);

  const sortableProps = !disableDragAndDrop ? useSortable({ id: scene.id }) : null;
  
  const {
    attributes = {},
    listeners = {},
    setNodeRef = () => {},
    transform = null,
    transition = undefined,
    isDragging = false,
  } = sortableProps || {};

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorderShotsInScene(scene.id, active.id as string, over.id as string);
    }
  };

  const handleTitleSave = () => {
    if (titleValue.trim() && titleValue !== scene.name) {
      onUpdateScene(scene.id, { name: titleValue.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTitleValue(scene.name);
    setIsEditingTitle(false);
  };

  // Calculate total width based on all shots
  const totalWidth = scene.shots.reduce((acc, shot) => acc + (shot.duration_in_seconds || 5) * pixelsPerSecond, 0);
  const minWidth = Math.max(totalWidth + 100, 300); // Minimum width for empty scenes

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group mb-6
        transition-all duration-300
        ${isDragging ? 'opacity-50 scale-105' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Scene Header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center space-x-2">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className={`
              w-8 h-6 bg-blue-600 border border-neutral-700 rounded-md
              flex items-center justify-center cursor-grab active:cursor-grabbing
              transition-opacity duration-200
              ${isHovered ? 'opacity-100' : 'opacity-40'}
            `}
          >
            <GripVertical className="w-3 h-3 text-white" />
          </div>

          {/* Scene Title */}
          {isEditingTitle ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                className="px-2 py-1 text-sm bg-neutral-800 border border-neutral-700 rounded text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') handleTitleCancel();
                }}
                onBlur={handleTitleSave}
              />
            </div>
          ) : (
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setIsEditingTitle(true)}
            >
              <h3 className="text-sm font-medium text-white">{scene.name}</h3>
              <Edit3 className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          <span className="text-xs text-neutral-400">
            {scene.shots.length} shot{scene.shots.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Scene Actions */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddScene(sceneIndex)} // Add before current scene
            className="h-6 px-2 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Scene Container */}
      <div 
        className="
          relative bg-neutral-900/30 border border-neutral-800 rounded-lg p-3
          min-h-[180px] flex flex-col overflow-hidden
        "
        style={{ minWidth }}
      >
        {/* Delete Scene Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteScene(scene.id)}
          className="
            absolute top-2 right-2 z-10
            w-6 h-6 p-0 rounded-full
            bg-red-600 text-white 
            hover:bg-red-700
            transition-all duration-200
            flex items-center justify-center
          "
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        {scene.shots.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-8">
              <div className="text-neutral-400 text-sm mb-2">No shots in this scene</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddShot(scene.id, 0)}
                className="border-neutral-700 text-white hover:bg-neutral-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Shot
              </Button>
            </div>
          </div>
        ) : disableDragAndDrop ? (
          <ScrollArea className="w-full">
            <div className="flex items-center space-x-2 py-2">
              <AddCardButton onAdd={() => onAddShot(scene.id, 0)} />
              {scene.shots.map((shot, index) => (
                <div key={shot.id} className="flex items-center space-x-2">
                  <VideoCard
                    card={shot}
                    onEdit={onEditShot}
                    onDelete={(shotId) => onDeleteShot(scene.id, shotId)}
                    pixelsPerSecond={pixelsPerSecond}
                    disableDragAndDrop={true}
                  />
                  <AddCardButton onAdd={() => onAddShot(scene.id, index + 1)} />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <ScrollArea className="w-full">
              <div className="flex items-center space-x-2 py-2">
                <SortableContext items={scene.shots.map(s => s.id)} strategy={horizontalListSortingStrategy}>
                  <AddCardButton onAdd={() => onAddShot(scene.id, 0)} />
                  {scene.shots.map((shot, index) => (
                    <div key={shot.id} className="flex items-center space-x-2">
                      <VideoCard
                        card={shot}
                        onEdit={onEditShot}
                        onDelete={(shotId) => onDeleteShot(scene.id, shotId)}
                        pixelsPerSecond={pixelsPerSecond}
                      />
                      <AddCardButton onAdd={() => onAddShot(scene.id, index + 1)} />
                    </div>
                  ))}
                </SortableContext>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DndContext>
        )}
      </div>
    </div>
  );
}


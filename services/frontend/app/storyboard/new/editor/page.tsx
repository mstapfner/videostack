"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useStoryboardStore } from '@/store/storyboard';
import { SceneContainer } from '@/components/SceneContainer';
import { EditCardModal } from '@/components/EditCardModal';
import { VideoGenerationModal } from '@/components/VideoGenerationModal';
import { StoryboardCard } from '@/store/storyboard';
import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Video, Download, Play, Plus, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function StoryboardEditor() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    storyboardId,
    originalPrompt,
    title,
    scenes,
    isLoading, 
    loadStoryboard,
    addScene,
    deleteScene,
    updateScene,
    addShotToScene, 
    deleteShot,
    updateShot,
    reorderScenes,
    reorderShotsInScene,
    pollStoryboard,
    startPolling,
    stopPolling
  } = useStoryboardStore();
  
  const [selectedCard, setSelectedCard] = useState<StoryboardCard | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoGenerationModalOpen, setIsVideoGenerationModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const lastLoadedIdRef = useRef<string | null>(null);

  // Prevent hydration mismatch by only rendering DnD components after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load storyboard when we have an ID (loads new storyboard if ID changes)
  useEffect(() => {
    if (storyboardId && storyboardId !== lastLoadedIdRef.current && !isLoading) {
      lastLoadedIdRef.current = storyboardId;
      loadStoryboard(storyboardId);
    }
  }, [storyboardId, isLoading, loadStoryboard]);

  // Polling is disabled by default since we make real-time updates
  // Only enable polling if you need to check for async operations (like video generation)
  // Uncomment the code below if you need polling:
  /*
  useEffect(() => {
    if (!pathname.includes('/storyboard/new/editor') || !storyboardId) {
      stopPolling();
      return;
    }

    startPolling();
    const pollInterval = setInterval(() => {
      pollStoryboard();
    }, 10000); // Poll every 10 seconds instead of 2

    return () => {
      clearInterval(pollInterval);
      stopPolling();
    };
  }, [pollStoryboard, startPolling, stopPolling, pathname, storyboardId]);
  */

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderScenes(active.id as string, over.id as string);
    }
  };

  const handleEditShot = (shot: StoryboardCard) => {
    // Find which scene this shot belongs to
    const sceneId = scenes.find(scene => 
      scene.shots.some(s => s.id === shot.id)
    )?.id;
    
    setSelectedCard(shot);
    setSelectedSceneId(sceneId || null);
    setIsModalOpen(true);
  };

  const handleAddScene = (index: number) => {
    addScene(index);
  };

  const handleUpdateShot = (sceneId: string, shotId: string, updates: Partial<StoryboardCard>) => {
    updateShot(sceneId, shotId, updates);
  };

  const handleUpdateShotFromModal = (shotId: string, updates: Partial<StoryboardCard>) => {
    if (selectedSceneId) {
      handleUpdateShot(selectedSceneId, shotId, updates);
    }
  };

  // Calculate total shots and duration
  const totalShots = scenes.reduce((acc, scene) => acc + scene.shots.length, 0);
  const totalDuration = scenes.reduce((acc, scene) => 
    acc + scene.shots.reduce((sceneAcc, shot) => sceneAcc + (shot.duration_in_seconds || 5), 0), 0
  );

  const handleProductionQualityGenerate = () => {
    setIsVideoGenerationModalOpen(true);
  };

  const handleExport = () => {
    // Mock export functionality
    const storyboardData = {
      originalPrompt,
      scenes,
      totalShots,
      totalDuration,
    };
    
    const dataStr = JSON.stringify(storyboardData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'storyboard.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Generating your storyboard...</h2>
            <p className="text-neutral-400">Our AI is creating amazing scenes for you</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image src="/blue-gradient-v-logo.jpg" alt="Video Stack AI" fill className="object-contain" />
              </div>
            </Link>
            <div className="h-8 w-px bg-neutral-700" />
            <Link href="/storyboard/new/storyline" className="flex items-center gap-2 text-white hover:text-neutral-300">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">{title || 'Untitled Storyboard'}</span>
            </Link>
            <div className="flex items-center gap-2 ml-4 text-sm">
              <Link href="/storyboard/new/concept" className="text-neutral-400 hover:text-white">Concept</Link>
              <span className="text-neutral-400">&gt;</span>
              <Link href="/storyboard/new/storyline" className="text-neutral-400 hover:text-white">Storyline</Link>
              <span className="text-neutral-400">&gt;</span>
              <span className="text-white">Breakdown</span>
            </div>
            <div className="text-sm text-neutral-400">
              {scenes.length} scenes • {totalShots} shots • {totalDuration}s
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
              className="border-neutral-700 hover:bg-neutral-800 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleProductionQualityGenerate}
            >
              <Play className="w-4 h-4 mr-2" />
              Generate production-quality
            </Button>
          </div>
        </div>
      </header>

      {/* Storyboard Content */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Main content area */}
        {scenes.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-12">
              <div className="text-neutral-400">No scenes generated yet</div>
            </div>
          </div>
        )}

        {/* Scenes and Timeline */}
        {scenes.length > 0 && (
          <div className="flex-1 border-t border-neutral-800 bg-neutral-900/50 flex flex-col h-full min-h-0">
            <div className="flex-1 overflow-auto p-6">
              {!isMounted ? (
                <div className="space-y-4">
                  {scenes.map((scene, index) => (
                    <div key={scene.id}>
                      <SceneContainer
                        scene={scene}
                        sceneIndex={index}
                        onEditShot={handleEditShot}
                        onDeleteShot={deleteShot}
                        onAddShot={addShotToScene}
                        onAddScene={handleAddScene}
                        onDeleteScene={deleteScene}
                        onUpdateScene={updateScene}
                        onReorderShotsInScene={reorderShotsInScene}
                        pixelsPerSecond={60}
                        disableDragAndDrop={true}
                      />
                    </div>
                  ))}
                  <div className="flex justify-end px-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddScene(scenes.length)}
                      className="h-6 px-2 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <div className="space-y-4">
                    <SortableContext items={scenes.map(s => s.id)} strategy={horizontalListSortingStrategy}>
                      {scenes.map((scene, index) => (
                        <div key={scene.id}>
                          <SceneContainer
                            scene={scene}
                            sceneIndex={index}
                            onEditShot={handleEditShot}
                            onDeleteShot={deleteShot}
                            onAddShot={addShotToScene}
                            onAddScene={handleAddScene}
                            onDeleteScene={deleteScene}
                            onUpdateScene={updateScene}
                            onReorderShotsInScene={reorderShotsInScene}
                            pixelsPerSecond={60}
                          />
                        </div>
                      ))}
                    </SortableContext>
                    
                    {/* Add Scene Button at the end */}
                    <div className="flex justify-end px-2 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddScene(scenes.length)}
                        className="h-6 px-2 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </DndContext>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditCardModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCard(null);
          setSelectedSceneId(null);
        }}
        onUpdateShot={handleUpdateShotFromModal}
      />

      {/* Video Generation Modal */}
      <VideoGenerationModal
        isOpen={isVideoGenerationModalOpen}
        onClose={() => setIsVideoGenerationModalOpen(false)}
      />
    </div>
    </AuthGuard>
  );
}


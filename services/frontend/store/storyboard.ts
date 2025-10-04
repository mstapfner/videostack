import { create } from 'zustand';
import * as api from '@/lib/api-client';

export interface StoryboardCard {
  id: string;
  prompt: string;
  image_url?: string;
  video_url?: string;
  duration_in_seconds?: number;
}

export interface Scene {
  id: string;
  name: string;
  shots: StoryboardCard[];
}

interface StoryboardState {
  storyboardId: string | null;
  originalPrompt: string;
  storyline: string | null;
  title: string | null;
  scenes: Scene[];
  isLoading: boolean;
  isPolling: boolean;
  
  // Actions
  setStoryboardId: (id: string) => void;
  setOriginalPrompt: (prompt: string) => void;
  setStoryline: (storyline: string) => void;
  setTitle: (title: string) => void;
  loadStoryboard: (storyboardId: string) => Promise<void>;
  initializeFromLLM: (storyboardId: string, llmData: api.StoryBoardFromLLM) => Promise<void>;
  
  addScene: (index: number) => Promise<void>;
  deleteScene: (sceneId: string) => Promise<void>;
  updateScene: (sceneId: string, updates: Partial<Scene>) => Promise<void>;
  
  addShotToScene: (sceneId: string, index: number) => Promise<void>;
  deleteShot: (sceneId: string, shotId: string) => Promise<void>;
  updateShot: (sceneId: string, shotId: string, updates: Partial<StoryboardCard>) => Promise<void>;
  
  reorderScenes: (activeId: string, overId: string) => void;
  reorderShotsInScene: (sceneId: string, activeId: string, overId: string) => void;
  
  generateShot: (prompt: string, shotId: string) => Promise<void>;
  generateVideo: () => void;
  generateAllImages: (storyboardId: string) => Promise<void>;
  pollStoryboard: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  resetStoryboard: () => void;
}

// Mock data generator
const generateMockShot = (index: number): StoryboardCard => ({
  id: `shot-${Date.now()}-${index}`,
  prompt: `A cinematic shot of a beautiful landscape with mountains and sunset`,
  image_url: '/placeholder.jpg',
  duration_in_seconds: 5,
});

const generateMockScene = (index: number): Scene => ({
  id: `scene-${Date.now()}-${index}`,
  name: `Scene ${index + 1}`,
  shots: [
    generateMockShot(0),
    generateMockShot(1),
    generateMockShot(2),
  ],
});

// Initial mock data
const initialScenes: Scene[] = [
  {
    id: 'scene-1',
    name: 'Opening Scene',
    shots: [
      {
        id: 'shot-1',
        prompt: 'A wide establishing shot of a futuristic cityscape at dawn',
        image_url: '/placeholder.jpg',
        duration_in_seconds: 5,
      },
      {
        id: 'shot-2',
        prompt: 'Close-up of a person looking out the window contemplatively',
        image_url: '/placeholder.jpg',
        duration_in_seconds: 4,
      },
      {
        id: 'shot-3',
        prompt: 'Medium shot of the protagonist walking through busy streets',
        image_url: '/placeholder.jpg',
        duration_in_seconds: 6,
      },
    ],
  },
  {
    id: 'scene-2',
    name: 'Discovery',
    shots: [
      {
        id: 'shot-4',
        prompt: 'Over-the-shoulder shot of protagonist finding mysterious object',
        image_url: '/placeholder.jpg',
        duration_in_seconds: 5,
      },
      {
        id: 'shot-5',
        prompt: 'Extreme close-up of the glowing artifact',
        image_url: '/placeholder.jpg',
        duration_in_seconds: 3,
      },
    ],
  },
  {
    id: 'scene-3',
    name: 'The Chase',
    shots: [
      {
        id: 'shot-6',
        prompt: 'Dynamic tracking shot of protagonist running through alleyways',
        image_url: '/placeholder.jpg',
        duration_in_seconds: 7,
      },
      {
        id: 'shot-7',
        prompt: 'Low angle shot of pursuers following behind',
        image_url: '/placeholder.jpg',
        duration_in_seconds: 4,
      },
      {
        id: 'shot-8',
        prompt: 'Bird\'s eye view of the chase through the city',
        image_url: '/placeholder.jpg',
        duration_in_seconds: 6,
      },
      {
        id: 'shot-9',
        prompt: 'Close-up of protagonist\'s determined face',
        image_url: '/placeholder.jpg',
        duration_in_seconds: 3,
      },
    ],
  },
];

export const useStoryboardStore = create<StoryboardState>((set, get) => ({
  storyboardId: null,
  originalPrompt: '',
  storyline: null,
  title: null,
  scenes: [],
  isLoading: false,
  isPolling: false,

  setStoryboardId: (id) => {
    set({ storyboardId: id });
  },

  setOriginalPrompt: (prompt) => {
    set({ originalPrompt: prompt });
  },

  setStoryline: (storyline) => {
    set({ storyline });
  },

  setTitle: (title) => {
    set({ title });
  },

  loadStoryboard: async (storyboardId) => {
    const { isPolling } = get();
    try {
      if (!isPolling) {
        set({ isLoading: true });
      }
      const storyboard = await api.getStoryboard(storyboardId);
      
      // Convert backend format to frontend format
      const scenes: Scene[] = storyboard.scenes.map((scene) => ({
        id: scene.id,
        name: scene.description || `Scene ${scene.scene_number}`,
        shots: scene.shots.map((shot) => ({
          id: shot.id,
          prompt: shot.user_prompt,
          image_url: shot.start_image_url,
          video_url: shot.video_url,
          duration_in_seconds: 5, // Default duration
        })),
      }));

      set({
        storyboardId,
        originalPrompt: storyboard.initial_line,
        storyline: storyboard.storyline || null,
        title: storyboard.title || null,
        scenes,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load storyboard:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  initializeFromLLM: async (storyboardId, llmData) => {
    try {
      set({ isLoading: true, storyboardId });

      // Add scenes and shots to the backend storyboard
      for (const llmScene of llmData.scenes) {
        const backendScene = await api.addSceneToStoryboard(
          storyboardId,
          llmScene.position + 1,
          llmScene.name,
          llmScene.shots.reduce((acc, shot) => acc + (shot.duration_in_seconds || 5), 0)
        );

        // Add shots to this scene
        for (const llmShot of llmScene.shots) {
          await api.addShotToScene(
            storyboardId,
            backendScene.id,
            llmShot.position + 1,
            llmShot.prompt,
            llmShot.image_url,
            undefined
          );
        }
      }

      // Reload the storyboard to get the full updated data
      await get().loadStoryboard(storyboardId);
    } catch (error) {
      console.error('Failed to initialize storyboard from LLM:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  addScene: async (index) => {
    const { storyboardId } = get();
    if (!storyboardId) {
      console.error('No storyboard ID set');
      return;
    }

    try {
      const sceneNumber = index + 1;
      await api.addSceneToStoryboard(storyboardId, sceneNumber, `Scene ${sceneNumber}`, 15);
      
      // Reload storyboard
      await get().loadStoryboard(storyboardId);
    } catch (error) {
      console.error('Failed to add scene:', error);
    }
  },

  deleteScene: async (sceneId) => {
    const { storyboardId } = get();
    if (!storyboardId) {
      console.error('No storyboard ID set');
      return;
    }

    try {
      await api.deleteScene(storyboardId, sceneId);
      
      // Update local state immediately
      set((state) => ({
        scenes: state.scenes.filter((scene) => scene.id !== sceneId),
      }));
    } catch (error) {
      console.error('Failed to delete scene:', error);
    }
  },

  updateScene: async (sceneId, updates) => {
    const { storyboardId } = get();
    if (!storyboardId) {
      console.error('No storyboard ID set');
      return;
    }

    try {
      await api.updateScene(storyboardId, sceneId, {
        description: updates.name,
      });
      
      // Update local state immediately
      set((state) => ({
        scenes: state.scenes.map((scene) =>
          scene.id === sceneId ? { ...scene, ...updates } : scene
        ),
      }));
    } catch (error) {
      console.error('Failed to update scene:', error);
    }
  },

  addShotToScene: async (sceneId, index) => {
    const { storyboardId } = get();
    if (!storyboardId) {
      console.error('No storyboard ID set');
      return;
    }

    try {
      const shotNumber = index + 1;
      await api.addShotToScene(
        storyboardId,
        sceneId,
        shotNumber,
        'A cinematic shot',
        undefined,
        undefined
      );
      
      // Reload storyboard
      await get().loadStoryboard(storyboardId);
    } catch (error) {
      console.error('Failed to add shot:', error);
    }
  },

  deleteShot: async (sceneId, shotId) => {
    const { storyboardId } = get();
    if (!storyboardId) {
      console.error('No storyboard ID set');
      return;
    }

    try {
      await api.deleteShot(storyboardId, sceneId, shotId);
      
      // Update local state immediately
      set((state) => ({
        scenes: state.scenes.map((scene) => {
          if (scene.id === sceneId) {
            return {
              ...scene,
              shots: scene.shots.filter((shot) => shot.id !== shotId),
            };
          }
          return scene;
        }),
      }));
    } catch (error) {
      console.error('Failed to delete shot:', error);
    }
  },

  updateShot: async (sceneId, shotId, updates) => {
    const { storyboardId } = get();
    if (!storyboardId) {
      console.error('No storyboard ID set');
      return;
    }

    try {
      await api.updateShot(storyboardId, sceneId, shotId, {
        user_prompt: updates.prompt,
        start_image_url: updates.image_url,
        video_url: updates.video_url,
      });
      
      // Update local state immediately
      set((state) => ({
        scenes: state.scenes.map((scene) => {
          if (scene.id === sceneId) {
            return {
              ...scene,
              shots: scene.shots.map((shot) =>
                shot.id === shotId ? { ...shot, ...updates } : shot
              ),
            };
          }
          return scene;
        }),
      }));
    } catch (error) {
      console.error('Failed to update shot:', error);
    }
  },

  reorderScenes: (activeId, overId) => {
    set((state) => {
      const oldIndex = state.scenes.findIndex((scene) => scene.id === activeId);
      const newIndex = state.scenes.findIndex((scene) => scene.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return state;
      
      const newScenes = [...state.scenes];
      const [movedScene] = newScenes.splice(oldIndex, 1);
      newScenes.splice(newIndex, 0, movedScene);
      
      return { scenes: newScenes };
    });
    
    // TODO: Persist reordering to backend
  },

  reorderShotsInScene: (sceneId, activeId, overId) => {
    set((state) => ({
      scenes: state.scenes.map((scene) => {
        if (scene.id === sceneId) {
          const oldIndex = scene.shots.findIndex((shot) => shot.id === activeId);
          const newIndex = scene.shots.findIndex((shot) => shot.id === overId);
          
          if (oldIndex === -1 || newIndex === -1) return scene;
          
          const newShots = [...scene.shots];
          const [movedShot] = newShots.splice(oldIndex, 1);
          newShots.splice(newIndex, 0, movedShot);
          
          return { ...scene, shots: newShots };
        }
        return scene;
      }),
    }));
    
    // TODO: Persist reordering to backend
  },

  generateShot: async (prompt, shotId) => {
    const sceneId = get().scenes.find(scene => 
      scene.shots.some(shot => shot.id === shotId)
    )?.id;
    
    if (sceneId) {
      await get().updateShot(sceneId, shotId, {
        prompt,
      });
    }
  },

  generateVideo: () => {
    console.log('Generating video from storyboard');
    // TODO: Implement video generation
  },

  generateAllImages: async (storyboardId) => {
    try {
      console.log('Starting image generation for all shots in storyboard:', storyboardId);
      
      // Call the backend to generate images (this is non-blocking on frontend)
      await api.generateStoryboardImages(storyboardId);
      
      console.log('Image generation initiated successfully');
    } catch (error) {
      console.error('Failed to generate images:', error);
    }
  },

  pollStoryboard: async () => {
    const { isPolling, storyboardId } = get();
    if (!isPolling || !storyboardId) return;
    
    try {
      await get().loadStoryboard(storyboardId);
    } catch (error) {
      console.error('Failed to poll storyboard:', error);
    }
  },

  startPolling: () => {
    set({ isPolling: true });
  },

  stopPolling: () => {
    set({ isPolling: false });
  },

  resetStoryboard: () => {
    set({
      storyboardId: null,
      originalPrompt: '',
      storyline: null,
      title: null,
      scenes: [],
      isLoading: false,
      isPolling: false,
    });
  },
}));


import { create } from 'zustand';

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
  originalPrompt: string;
  scenes: Scene[];
  isLoading: boolean;
  isPolling: boolean;
  
  // Actions
  addScene: (index: number) => void;
  deleteScene: (sceneId: string) => void;
  updateScene: (sceneId: string, updates: Partial<Scene>) => void;
  
  addShotToScene: (sceneId: string, index: number) => void;
  deleteShot: (sceneId: string, shotId: string) => void;
  updateShot: (sceneId: string, shotId: string, updates: Partial<StoryboardCard>) => void;
  
  reorderScenes: (activeId: string, overId: string) => void;
  reorderShotsInScene: (sceneId: string, activeId: string, overId: string) => void;
  
  generateShot: (prompt: string, shotId: string) => Promise<void>;
  generateVideo: () => void;
  pollStoryboard: () => void;
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
  originalPrompt: 'A thrilling sci-fi adventure in a futuristic city',
  scenes: initialScenes,
  isLoading: false,
  isPolling: false,

  addScene: (index) => {
    const newScene = generateMockScene(get().scenes.length);
    set((state) => {
      const newScenes = [...state.scenes];
      newScenes.splice(index, 0, newScene);
      return { scenes: newScenes };
    });
  },

  deleteScene: (sceneId) => {
    set((state) => ({
      scenes: state.scenes.filter((scene) => scene.id !== sceneId),
    }));
  },

  updateScene: (sceneId, updates) => {
    set((state) => ({
      scenes: state.scenes.map((scene) =>
        scene.id === sceneId ? { ...scene, ...updates } : scene
      ),
    }));
  },

  addShotToScene: (sceneId, index) => {
    const newShot = generateMockShot(Date.now());
    set((state) => ({
      scenes: state.scenes.map((scene) => {
        if (scene.id === sceneId) {
          const newShots = [...scene.shots];
          newShots.splice(index, 0, newShot);
          return { ...scene, shots: newShots };
        }
        return scene;
      }),
    }));
  },

  deleteShot: (sceneId, shotId) => {
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
  },

  updateShot: (sceneId, shotId, updates) => {
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
  },

  generateShot: async (prompt, shotId) => {
    // Mock implementation - in real app, this would call the API
    console.log('Generating shot:', prompt, shotId);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Update the shot with new image
    const sceneId = get().scenes.find(scene => 
      scene.shots.some(shot => shot.id === shotId)
    )?.id;
    
    if (sceneId) {
      get().updateShot(sceneId, shotId, {
        prompt,
        image_url: '/placeholder.jpg',
      });
    }
  },

  generateVideo: () => {
    console.log('Generating video from storyboard');
    // Mock implementation - in real app, this would call the API
  },

  pollStoryboard: () => {
    // Mock implementation - in real app, this would poll for updates
    if (!get().isPolling) return;
    console.log('Polling storyboard for updates');
  },

  startPolling: () => {
    set({ isPolling: true });
  },

  stopPolling: () => {
    set({ isPolling: false });
  },

  resetStoryboard: () => {
    set({
      originalPrompt: '',
      scenes: [],
      isLoading: false,
      isPolling: false,
    });
  },
}));


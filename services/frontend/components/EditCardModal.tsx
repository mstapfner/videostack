"use client"

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StoryboardCard, useStoryboardStore } from '@/store/storyboard';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface EditCardModalProps {
  card: StoryboardCard | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateShot?: (shotId: string, updates: Partial<StoryboardCard>) => void;
}

export function EditCardModal({ card, isOpen, onClose, onUpdateShot }: EditCardModalProps) {
  const generateShot = useStoryboardStore(state => state.generateShot);
  const generateVideo = useStoryboardStore(state => state.generateVideo);
  const scenes = useStoryboardStore(state => state.scenes);
  const [localPrompt, setLocalPrompt] = useState('');
  const [localDuration, setLocalDuration] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [lastImageUrl, setLastImageUrl] = useState('');
  const [selectedModel, setSelectedModel] = useState<'google_veo_3' | 'seedance'>('google_veo_3');
  
  useEffect(() => {
    if (card) {
      setLocalPrompt(card.prompt);
      setLocalDuration(card.duration_in_seconds || 3);
      setOriginalPrompt(card.prompt);
      setLastImageUrl(card.image_url || '');
    }
  }, [card]);

  // Reset generating state when image updates
  useEffect(() => {
    const currentCard = getCurrentCard();
    if (currentCard?.image_url && currentCard.image_url !== lastImageUrl && isGenerating) {
      setIsGenerating(false);
      setLastImageUrl(currentCard.image_url);
    }
  }, [scenes, isGenerating, lastImageUrl]);

  // Get the current card from the store to reflect real-time updates
  const getCurrentCard = () => {
    if (!card) return null;
    for (const scene of scenes) {
      const foundShot = scene.shots.find(shot => shot.id === card.id);
      if (foundShot) return foundShot;
    }
    return card; // fallback to original card if not found
  };

  const currentCard = getCurrentCard();
  
  // Check if generate button should be disabled
  const hasImage = currentCard?.image_url || currentCard?.video_url;
  const promptUnchanged = localPrompt === originalPrompt;
  const shouldDisableGenerate = hasImage && promptUnchanged;

  if (!currentCard) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && onUpdateShot && currentCard) {
        // Save changes when modal is closed
        onUpdateShot(currentCard.id, { 
          prompt: localPrompt,
          duration_in_seconds: localDuration 
        });
      }
      onClose();
    }}>
      <DialogContent 
        className="max-w-6xl w-[90vw] h-[85vh] bg-neutral-900 border-neutral-800 p-0 overflow-hidden"
      >
        <DialogTitle className="sr-only">Edit Shot</DialogTitle>
        {/* Close Button - Top Right */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-neutral-800/80 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-800/90 shadow-lg"
        >
          <X className="w-4 h-4 text-white" />
        </Button>

        {/* Video Preview */}
        <div className="aspect-video bg-neutral-950 rounded-lg overflow-hidden relative">
          {currentCard.image_url || currentCard.video_url ? (
            <div className="relative w-full h-full">
              {/* Show video if available, otherwise show image */}
              {currentCard.video_url ? (
                <video
                  src={currentCard.video_url}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-300",
                    isGenerating && "blur-sm"
                  )}
                  autoPlay
                  loop
                  muted
                  controls
                />
              ) : (
                <Image
                  src={currentCard.image_url || '/placeholder.jpg'}
                  alt={currentCard.prompt}
                  fill
                  className={cn(
                    "object-cover transition-all duration-300",
                    isGenerating && "blur-sm"
                  )}
                />
              )}
              {/* Spinning wheel overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <div className="text-sm text-white font-medium">Generating...</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={cn(
              "w-full h-full bg-gradient-to-br from-neutral-900 to-neutral-950 flex items-center justify-center transition-all duration-300",
              isGenerating && "blur-sm"
            )}>
              <div className="text-neutral-500">Video Preview</div>
              {/* Loading Overlay for no image case */}
              {isGenerating && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <div className="text-sm text-white font-medium">Generating...</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Prompt Controls */}
        <div className="p-6 space-y-4">
          {/* Prompt Input */}
          <div className="relative">
            <textarea
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              placeholder="Describe your shot..."
              className="w-full min-h-[120px] p-4 bg-neutral-800/80 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-end gap-3">
            {/* Duration Control */}
            <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-full px-4 py-2">
              <span className="text-sm text-neutral-400">Duration:</span>
              <input
                type="number"
                value={localDuration}
                min="1"
                max="30"
                onChange={(e) => {
                  const newDuration = parseInt(e.target.value);
                  if (!isNaN(newDuration)) {
                    setLocalDuration(newDuration);
                    if (onUpdateShot && currentCard) {
                      onUpdateShot(currentCard.id, { duration_in_seconds: newDuration });
                    }
                  }
                }}
                className="w-12 bg-transparent text-white text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-sm text-neutral-400">sec</span>
            </div>

            {/* Model Select */}
            <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-full px-3 py-2">
              <span className="text-sm text-neutral-400">Model:</span>
              <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as 'google_veo_3' | 'seedance')}>
                <SelectTrigger className="w-[170px] h-8 bg-transparent border-0 shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-neutral-400 text-white">
                  <SelectValue placeholder="Choose model" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  <SelectItem value="google_veo_3" className="text-white hover:bg-neutral-700">Google Veo 3</SelectItem>
                  <SelectItem value="seedance" className="text-white hover:bg-neutral-700">Seedance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sketch Button */}
            <Button
              variant="outline"
              onClick={() => {
                console.log('Sketch feature coming soon...');
              }}
              className="border-neutral-700 hover:bg-neutral-800 text-white rounded-full px-4 py-2"
            >
              ✏️ Sketch
            </Button>

            {/* Generate Button */}
            <Button
              onClick={async () => {
                if (!currentCard) return;
                // Update shot with current prompt and duration before generating
                if (onUpdateShot) {
                  onUpdateShot(currentCard.id, { 
                    prompt: localPrompt,
                    duration_in_seconds: localDuration 
                  });
                }
                setIsGenerating(true);
                try {
                  await generateShot(localPrompt, currentCard.id);
                  generateVideo();
                  // Keep modal open to see the updated shot
                } catch (error) {
                  console.error('Failed to generate shot:', error);
                } finally {
                  setIsGenerating(false);
                }
              }}
              disabled={isGenerating || shouldDisableGenerate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


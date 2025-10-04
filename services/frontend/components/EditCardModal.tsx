"use client"

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StoryboardCard, useStoryboardStore } from '@/store/storyboard';
import { X, Loader2, Star, Clock, Pencil, RotateCcw } from 'lucide-react';
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
  const shouldDisableGenerate = Boolean(hasImage && promptUnchanged);

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
        className="!max-w-[90vw] !w-[90vw] sm:!max-w-[90vw] md:!max-w-[1200px] !h-auto max-h-[90vh] bg-neutral-900 border-neutral-800 !p-0 !gap-0 overflow-hidden rounded-lg"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Edit Shot</DialogTitle>
        
        {/* Close Button - Top Right */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 p-0 rounded-sm bg-transparent hover:bg-neutral-800/80 border-0"
        >
          <X className="w-4 h-4 text-white" />
        </Button>

        {/* Main Content Container */}
        <div className="flex flex-col w-full h-full">
          {/* Large Image/Video Preview */}
          <div className="relative w-full aspect-video bg-neutral-950 overflow-hidden">
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
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-white animate-spin" />
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
                <div className="text-neutral-500 text-lg">No preview available</div>
                {/* Loading Overlay for no image case */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-white animate-spin" />
                      <div className="text-sm text-white font-medium">Generating...</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description Text - Editable */}
          <div className="px-6 py-4 bg-neutral-950/50">
            <textarea
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              placeholder="Describe your shot..."
              className="w-full min-h-[80px] p-0 bg-transparent border-0 text-sm text-neutral-300 leading-relaxed placeholder-neutral-500 resize-none focus:outline-none focus:ring-0"
            />
          </div>

          {/* Controls Bar */}
          <div className="px-6 py-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Model Select */}
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-white">Model</span>
                <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as 'google_veo_3' | 'seedance')}>
                  <SelectTrigger className="w-[140px] h-9 bg-transparent border-neutral-700 focus:ring-0 focus:ring-offset-0 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="google_veo_3" className="text-white hover:bg-neutral-700">Google Veo 3</SelectItem>
                    <SelectItem value="seedance" className="text-white hover:bg-neutral-700">Seedance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Select */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-white">Duration</span>
                <Select 
                  value={localDuration.toString()} 
                  onValueChange={(v) => {
                    const newDuration = parseInt(v);
                    setLocalDuration(newDuration);
                    if (onUpdateShot && currentCard) {
                      onUpdateShot(currentCard.id, { duration_in_seconds: newDuration });
                    }
                  }}
                >
                  <SelectTrigger className="w-[90px] h-9 bg-transparent border-neutral-700 focus:ring-0 focus:ring-offset-0 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="3" className="text-white hover:bg-neutral-700">3 Sec</SelectItem>
                    <SelectItem value="5" className="text-white hover:bg-neutral-700">5 Sec</SelectItem>
                    <SelectItem value="8" className="text-white hover:bg-neutral-700">8 Sec</SelectItem>
                    <SelectItem value="10" className="text-white hover:bg-neutral-700">10 Sec</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Draw Button */}
              <Button
                variant="ghost"
                size="sm"
                disabled
                onClick={() => {
                  console.log('Draw feature coming soon...');
                }}
                className="h-9 text-neutral-500 hover:bg-neutral-800 flex items-center gap-2 cursor-not-allowed opacity-50"
              >
                <Pencil className="w-4 h-4" />
                <span>Draw</span>
              </Button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Discard Changes Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLocalPrompt(originalPrompt);
                  setLocalDuration(card?.duration_in_seconds || 3);
                }}
                className="h-9 border-neutral-700 hover:bg-neutral-800 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Discard changes
              </Button>

              {/* Re-generate Video Button */}
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
                  } catch (error) {
                    console.error('Failed to generate shot:', error);
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                disabled={isGenerating || shouldDisableGenerate}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white px-4 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Re-generate Video'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


"use client"

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StoryboardCard } from '@/store/storyboard';
import { GripVertical, Trash2, Loader2 } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';

interface VideoCardProps {
  card: StoryboardCard;
  onEdit: (card: StoryboardCard) => void;
  onDelete: (id: string) => void;
  pixelsPerSecond?: number;
  disableDragAndDrop?: boolean;
}

export function VideoCard({ card, onEdit, onDelete, pixelsPerSecond = 60, disableDragAndDrop = false }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const sortableProps = !disableDragAndDrop ? useSortable({ id: card.id }) : null;
  
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

  // Fixed width for all cards
  const cardWidth = 240; // Fixed width in pixels

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, width: cardWidth }}
      className={`
        relative group cursor-pointer h-full
        transition-all duration-300
        ${isDragging ? 'opacity-50 scale-105 shadow-xl' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit(card)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`
          absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
          w-16 h-6 bg-blue-600 border border-neutral-700 rounded-md
          flex items-center justify-center cursor-grab active:cursor-grabbing
          transition-all duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <GripVertical className="w-4 h-3 text-white" />
      </div>

      {/* Card Content */}
      <AspectRatio ratio={16/9} className="w-full">
        <div 
          className="
            h-full bg-neutral-900 rounded-lg border border-neutral-800
            overflow-hidden shadow-lg flex flex-col
            transition-all duration-300
            hover:shadow-blue-500/20 hover:shadow-xl relative
          "
        >
          {/* Video/Image Preview */}
          <div className="flex-1 relative">
            {/* Base layer: Image (shows when available) */}
            {card.image_url && (
              <Image
                src={card.image_url}
                alt="Shot preview"
                fill
                className="object-cover"
                onLoad={() => setImageLoading(false)}
                onLoadStart={() => setImageLoading(true)}
              />
            )}

            {/* Video layer: Video (only shows when fully loaded) */}
            {card.video_url && videoLoaded && (
              <video
                src={card.video_url}
                className="w-full h-full object-cover absolute inset-0"
                autoPlay
                loop
                muted
              />
            )}

            {/* Hidden video for loading detection */}
            {card.video_url && (
              <video
                src={card.video_url}
                className="hidden"
                onLoadedData={() => setVideoLoaded(true)}
                onError={() => setVideoLoaded(false)}
                preload="auto"
              />
            )}

            {/* Overlay layer: Spinner */}
            {card.prompt && ((card.video_url && !videoLoaded) || (!card.video_url && imageLoading)) ? (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            ) : null}
          </div>

          {/* Delete button */}
          <div className={`
            absolute top-2 right-2 z-30
            transition-opacity duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card.id);
              }}
              className="w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-200"
            >
              <Trash2 className="w-3 h-3 text-white" />
            </button>
          </div>

          {/* Prompt overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="text-xs text-white line-clamp-2 leading-tight mb-1">
              {card.prompt}
            </p>
            <div className="text-xs text-white/80">
              {card.duration_in_seconds || 5}s
            </div>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
}


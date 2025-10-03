"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface VideoGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoGenerationModal({ isOpen, onClose }: VideoGenerationModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    setStatus('generating');
    setDownloadUrl(null);

    try {
      // Mock API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // In real implementation, call the export-storyboard endpoint
      // const response = await fetch('https://p01--backend--m76sx6zv2hhj.code.run/export-storyboard', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });
      
      setDownloadUrl('/mock-video.mp4');
      setStatus('success');
    } catch (error) {
      setStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setStatus('idle');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Play className="w-5 h-5 text-blue-500" />
            Generate Production Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {status === 'idle' && (
            <div className="text-center space-y-4">
              <p className="text-neutral-300">
                Ready to generate your professional-quality video from the storyboard?
              </p>
              <p className="text-sm text-neutral-400">
                This process may take several minutes to complete.
              </p>
            </div>
          )}

          {status === 'generating' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
              <p className="font-medium text-white">Generating your video...</p>
              <p className="text-sm text-neutral-400">
                Please don&apos;t close this window
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <div>
                <p className="font-medium text-white">Video generated successfully!</p>
                {downloadUrl && (
                  <div className="mt-4">
                    <a 
                      href={downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 hover:underline"
                    >
                      Download Video
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <p className="font-medium text-white">Generation failed</p>
                <p className="text-sm text-neutral-400">
                  Please try again or contact support if the issue persists.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {status === 'idle' && (
              <>
                <Button variant="outline" onClick={handleClose} className="border-neutral-700 text-white hover:bg-neutral-800">
                  Cancel
                </Button>
                <Button onClick={handleGenerateVideo} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Play className="w-4 h-4 mr-2" />
                  Generate Video
                </Button>
              </>
            )}

            {(status === 'success' || status === 'error') && (
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700 text-white">
                Close
              </Button>
            )}

            {status === 'generating' && (
              <Button variant="outline" disabled className="border-neutral-700 text-neutral-400">
                Generating...
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


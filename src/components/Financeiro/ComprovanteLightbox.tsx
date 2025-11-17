import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface ComprovanteLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: { url: string; nome?: string }[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function ComprovanteLightbox({ open, onOpenChange, files, currentIndex, onIndexChange }: ComprovanteLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const current = files[currentIndex];

  const handlePrev = () => onIndexChange(Math.max(0, currentIndex - 1));
  const handleNext = () => onIndexChange(Math.min(files.length - 1, currentIndex + 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-lg h-[90vh] p-0">
        <div className="relative w-full h-full flex flex-col bg-black">
          <div className="absolute top-0 right-0 z-10 p-4 flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}><ZoomOut className="w-4 h-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => setZoom(z => Math.min(3, z + 0.25))}><ZoomIn className="w-4 h-4" /></Button>
            <Button size="sm" variant="ghost" asChild><a href={current?.url} download><Download className="w-4 h-4" /></a></Button>
            <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}><X className="w-4 h-4" /></Button>
          </div>
          
          <div className="flex-1 flex items-center justify-center overflow-auto p-8">
            <img src={current?.url} alt={current?.nome} style={{ transform: `scale(${zoom})` }} className="max-w-full max-h-full object-contain transition-transform" />
          </div>
          
          {files.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
              <Button size="sm" variant="ghost" onClick={handlePrev} disabled={currentIndex === 0}><ChevronLeft /></Button>
              <span className="text-white text-sm">{currentIndex + 1} / {files.length}</span>
              <Button size="sm" variant="ghost" onClick={handleNext} disabled={currentIndex === files.length - 1}><ChevronRight /></Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

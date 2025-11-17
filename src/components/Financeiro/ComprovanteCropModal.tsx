import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCw, ZoomIn } from "lucide-react";
import Cropper from "react-easy-crop";

type Point = { x: number; y: number };
type Area = { width: number; height: number; x: number; y: number };

interface ComprovanteCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  fileName: string;
  onCropComplete: (croppedBlob: Blob) => void;
}

export function ComprovanteCropModal({
  open,
  onOpenChange,
  imageUrl,
  fileName,
  onCropComplete,
}: ComprovanteCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteInternal = (_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    
    image.src = imageUrl;
    await new Promise(resolve => { image.onload = resolve; });
    
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    
    ctx?.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
    
    canvas.toBlob((blob) => {
      if (blob) onCropComplete(blob);
      onOpenChange(false);
    }, 'image/jpeg', 0.95);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Imagem - {fileName}</DialogTitle>
        </DialogHeader>
        
        <div className="relative h-96 bg-black rounded">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteInternal}
          />
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-2">
              <ZoomIn className="w-4 h-4" /> Zoom
            </label>
            <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={1} max={3} step={0.1} />
          </div>
          
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-2">
              <RotateCw className="w-4 h-4" /> Rotação
            </label>
            <Slider value={[rotation]} onValueChange={([v]) => setRotation(v)} min={0} max={360} step={1} />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleApply}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

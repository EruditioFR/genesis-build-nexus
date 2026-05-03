import { useState, useCallback, useEffect } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  aspect?: number;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  // Cap output to 1600px max width for storage friendliness
  const maxW = 1600;
  const scale = Math.min(1, maxW / pixelCrop.width);
  canvas.width = Math.round(pixelCrop.width * scale);
  canvas.height = Math.round(pixelCrop.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no ctx");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL("image/jpeg", 0.85);
}

export const ImageCropDialog = ({
  open,
  imageSrc,
  aspect = 16 / 10,
  onCancel,
  onConfirm,
}: ImageCropDialogProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    try {
      const url = await getCroppedImg(imageSrc, croppedAreaPixels);
      onConfirm(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#0f0f1e] text-white border-white/10">
        <div className="px-5 pt-5">
          <DialogTitle className="font-display text-lg">Cadrer la photo</DialogTitle>
          <DialogDescription className="text-white/60 text-sm">
            Ajustez le cadrage et le zoom avant de confier votre souvenir.
          </DialogDescription>
        </div>

        <div className="relative w-full h-72 bg-black mt-4">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid
            />
          )}
        </div>

        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="text-xs text-white/70 uppercase tracking-wide">Zoom</label>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={(v) => setZoom(v[0])}
              className="mt-2"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              className="flex-1 text-white/80 hover:text-white hover:bg-white/10"
              onClick={onCancel}
              disabled={busy}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={handleConfirm}
              disabled={busy || !croppedAreaPixels}
            >
              {busy ? "Préparation…" : "Valider"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropDialog;

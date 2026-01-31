"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, UploadCloud, X } from "lucide-react";
import { useState, useRef } from "react";

interface ServiceFeaturedPhotoUploadProps {
  currentImageUrl?: string | null;
  onImageSelect: (file: File | null) => void;
  isSaving: boolean;
}

export function ServiceFeaturedPhotoUpload({
  currentImageUrl,
  onImageSelect,
  isSaving,
}: ServiceFeaturedPhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    } else {
      setPreviewUrl(null);
      onImageSelect(null);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const effectiveImageUrl = previewUrl || currentImageUrl;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <Label className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
            <Camera className="w-4 h-4" /> Imagem de Capa
          </Label>

          <div className="aspect-video relative rounded-md overflow-hidden bg-slate-100 border group">
            {effectiveImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={effectiveImageUrl}
                alt="Capa"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Camera className="w-10 h-10" />
                <span className="text-sm mt-2">Nenhuma imagem</span>
              </div>
            )}
          </div>

          {previewUrl && (
            <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800/50">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Nova imagem selecionada. Salve para aplicar.</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveImage}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
             <Button asChild variant="outline" disabled={isSaving}>
              <label htmlFor="featured-photo-file-input" className="cursor-pointer flex items-center justify-center w-full h-full">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                {currentImageUrl ? "Trocar Imagem" : "Enviar Imagem"}
              </label>
            </Button>
            <Input
              ref={fileInputRef}
              id="featured-photo-file-input"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              disabled={isSaving}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type ColorPickerProps = {
  imageUrl: string;
  onColorPick: (color: { hex: string; rgb: { r: number; g: number; b: number } }) => void;
};

export default function ColorPicker({ imageUrl, onColorPick }: ColorPickerProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageUrl && canvasRef.current && imgRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imgRef.current;

      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx?.drawImage(img, 0, 0);
      };
    }
  }, [imageUrl]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || !canvasRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCursorPosition({ x: e.clientX, y: e.clientY });

    const canvas = canvasRef.current;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = Math.floor(x * scaleX);
    const canvasY = Math.floor(y * scaleY);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
      const hex = `#${[pixel[0], pixel[1], pixel[2]].map(x => x.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
      setCurrentColor(hex);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || !currentColor || !canvasRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const canvas = canvasRef.current;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = Math.floor(x * scaleX);
    const canvasY = Math.floor(y * scaleY);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
      const color = {
        hex: currentColor,
        rgb: { r: pixel[0], g: pixel[1], b: pixel[2] }
      };
      
      onColorPick(color);
      setIsActive(false);
      toast.success(`Цвет выбран: ${currentColor}`);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Icon name="Pipette" size={20} className="text-primary" />
          Пипетка
        </h3>
        
        <Button
          onClick={() => setIsActive(!isActive)}
          variant={isActive ? 'default' : 'outline'}
          size="sm"
        >
          <Icon name={isActive ? 'X' : 'Pipette'} size={18} className="mr-2" />
          {isActive ? 'Отменить' : 'Активировать'}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {isActive 
          ? 'Наведите курсор на изображение и кликните для выбора цвета' 
          : 'Активируйте инструмент для точного выбора цвета из изображения'
        }
      </p>

      <div className="relative">
        <canvas ref={canvasRef} className="hidden" />
        <img ref={imgRef} src={imageUrl} alt="Source" className="hidden" />
        
        <div
          className={`relative rounded-lg overflow-hidden ${isActive ? 'cursor-crosshair' : ''}`}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        >
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="w-full h-auto"
          />
          
          {isActive && currentColor && (
            <>
              <div
                className="fixed pointer-events-none z-50 flex items-center gap-2 bg-white border-2 border-primary shadow-lg rounded-lg px-3 py-2"
                style={{
                  left: cursorPosition.x + 20,
                  top: cursorPosition.y + 20,
                }}
              >
                <div
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: currentColor }}
                />
                <span className="text-sm font-mono font-bold">{currentColor}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {currentColor && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
              style={{ backgroundColor: currentColor }}
            />
            <div>
              <p className="text-sm font-bold">{currentColor}</p>
              <p className="text-xs text-muted-foreground">Текущий цвет</p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(currentColor);
              toast.success('Цвет скопирован!');
            }}
          >
            <Icon name="Copy" size={16} />
          </Button>
        </div>
      )}
    </Card>
  );
}

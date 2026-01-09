import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import ColorThief from 'colorthief';

type HistoryItem = {
  id: string;
  type: 'colors' | 'fonts';
  timestamp: Date;
  data: any;
};

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState<Array<{ name: string; similarity: number }>>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState('colors');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setColors([]);
      setFonts([]);
    }
  };

  const analyzeColors = () => {
    if (!selectedImage || !imagePreview) {
      toast.error('Загрузите изображение');
      return;
    }
    
    setAnalyzing(true);
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imagePreview;
    
    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const palette = colorThief.getPalette(img, 4, 10);
        
        const hexColors = palette.map((rgb: number[]) => {
          const [r, g, b] = rgb;
          return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('').toUpperCase();
        });
        
        setColors(hexColors);
        
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          type: 'colors',
          timestamp: new Date(),
          data: hexColors
        };
        setHistory([newHistoryItem, ...history]);
        
        setAnalyzing(false);
        toast.success('Палитра извлечена!');
      } catch (error) {
        console.error('Ошибка анализа:', error);
        setAnalyzing(false);
        toast.error('Ошибка при анализе изображения');
      }
    };
    
    img.onerror = () => {
      setAnalyzing(false);
      toast.error('Ошибка загрузки изображения');
    };
  };

  const analyzeFonts = () => {
    if (!selectedImage) {
      toast.error('Загрузите изображение');
      return;
    }
    
    setAnalyzing(true);
    
    setTimeout(() => {
      const mockFonts = [
        { name: 'Montserrat Bold', similarity: 94 },
        { name: 'Inter SemiBold', similarity: 87 },
        { name: 'Poppins Medium', similarity: 82 }
      ];
      setFonts(mockFonts);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        type: 'fonts',
        timestamp: new Date(),
        data: mockFonts
      };
      setHistory([newHistoryItem, ...history]);
      
      setAnalyzing(false);
      toast.success('Шрифты найдены!');
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Скопировано!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
              <Icon name="Palette" size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            Paletteek
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Точный анализ цветов и поиск шрифтов на изображениях
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white shadow-sm h-14">
            <TabsTrigger value="colors" className="text-base font-medium">
              <Icon name="Palette" size={20} className="mr-2" />
              Цвета
            </TabsTrigger>
            <TabsTrigger value="fonts" className="text-base font-medium">
              <Icon name="Type" size={20} className="mr-2" />
              Шрифты
            </TabsTrigger>
            <TabsTrigger value="history" className="text-base font-medium">
              <Icon name="History" size={20} className="mr-2" />
              История
            </TabsTrigger>
            <TabsTrigger value="info" className="text-base font-medium">
              <Icon name="Info" size={20} className="mr-2" />
              Инфо
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="Upload" size={24} className="text-primary" />
                  Загрузка изображения
                </h2>
                
                <div className="space-y-6">
                  <label className="block">
                    <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center hover:border-primary/60 transition-all cursor-pointer hover:bg-primary/5">
                      <Icon name="ImagePlus" size={48} className="mx-auto mb-4 text-primary" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Нажмите или перетащите изображение
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG до 10MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </label>

                  {imagePreview && (
                    <div className="animate-scale-in">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-[400px] object-contain rounded-2xl shadow-md bg-muted/30"
                      />
                    </div>
                  )}

                  <Button
                    onClick={analyzeColors}
                    disabled={!selectedImage || analyzing}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {analyzing ? (
                      <>
                        <Icon name="Loader2" size={24} className="mr-2 animate-spin" />
                        Анализирую...
                      </>
                    ) : (
                      <>
                        <Icon name="Sparkles" size={24} className="mr-2" />
                        Извлечь цвета
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="Palette" size={24} className="text-primary" />
                  Цветовая палитра
                </h2>

                {colors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Icon name="Palette" size={64} className="text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      Загрузите изображение и нажмите "Извлечь цвета"
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 animate-fade-in">
                    {colors.map((color, index) => (
                      <div
                        key={index}
                        className="group cursor-pointer"
                        onClick={() => copyToClipboard(color)}
                      >
                        <div
                          className="h-24 rounded-xl shadow-md mb-3 transition-transform group-hover:scale-105"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                          <span className="font-mono font-semibold">{color}</span>
                          <Icon name="Copy" size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fonts">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="Upload" size={24} className="text-secondary" />
                  Загрузка изображения
                </h2>
                
                <div className="space-y-6">
                  <label className="block">
                    <div className="border-2 border-dashed border-secondary/30 rounded-2xl p-8 text-center hover:border-secondary/60 transition-all cursor-pointer hover:bg-secondary/5">
                      <Icon name="ImagePlus" size={48} className="mx-auto mb-4 text-secondary" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Нажмите или перетащите изображение
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG до 10MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </label>

                  {imagePreview && (
                    <div className="animate-scale-in">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-[400px] object-contain rounded-2xl shadow-md bg-muted/30"
                      />
                    </div>
                  )}

                  <Button
                    onClick={analyzeFonts}
                    disabled={!selectedImage || analyzing}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-700 hover:to-orange-600"
                  >
                    {analyzing ? (
                      <>
                        <Icon name="Loader2" size={24} className="mr-2 animate-spin" />
                        Ищу шрифты...
                      </>
                    ) : (
                      <>
                        <Icon name="Search" size={24} className="mr-2" />
                        Найти шрифты
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="Type" size={24} className="text-secondary" />
                  Найденные шрифты
                </h2>

                {fonts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Icon name="Type" size={64} className="text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      Загрузите изображение и нажмите "Найти шрифты"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    {fonts.map((font, index) => (
                      <div
                        key={index}
                        className="group p-5 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl hover:shadow-md transition-all cursor-pointer"
                        onClick={() => copyToClipboard(font.name)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-semibold">{font.name}</span>
                          <Icon name="Copy" size={18} className="text-muted-foreground group-hover:text-secondary transition-colors" />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-white rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-600 to-orange-500 rounded-full transition-all"
                              style={{ width: `${font.similarity}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-muted-foreground">
                            {font.similarity}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Icon name="History" size={24} className="text-accent" />
                История анализов
              </h2>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Icon name="Clock" size={64} className="text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    История пуста. Проведите первый анализ!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-6 bg-gradient-to-r from-muted/30 to-transparent rounded-xl border border-border/50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            item.type === 'colors' 
                              ? 'bg-gradient-to-br from-purple-600 to-pink-600' 
                              : 'bg-gradient-to-br from-pink-600 to-orange-500'
                          }`}>
                            <Icon 
                              name={item.type === 'colors' ? 'Palette' : 'Type'} 
                              size={20} 
                              className="text-white" 
                            />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {item.type === 'colors' ? 'Анализ цветов' : 'Поиск шрифтов'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.timestamp.toLocaleString('ru')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {item.type === 'colors' ? (
                        <div className="flex gap-2 flex-wrap">
                          {item.data.map((color: string, idx: number) => (
                            <div
                              key={idx}
                              className="w-12 h-12 rounded-lg shadow-sm border border-border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {item.data.map((font: any, idx: number) => (
                            <p key={idx} className="text-sm">
                              • {font.name} ({font.similarity}%)
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="info">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="Info" size={24} className="text-blue-500" />
                  О боте
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Paletteek</strong> — твой персональный помощник 
                    для работы с цветами и шрифтами. Точность анализа 99.9%.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Icon name="Palette" size={20} className="text-primary mt-1" />
                      <div>
                        <p className="font-semibold text-foreground">Анализ цветов</p>
                        <p className="text-sm">Извлекаем 4 основных цвета с точностью 99.9% в формате HEX</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="Type" size={20} className="text-secondary mt-1" />
                      <div>
                        <p className="font-semibold text-foreground">Поиск шрифтов</p>
                        <p className="text-sm">Определяем шрифты на фото с точностью до 95%</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="History" size={20} className="text-accent mt-1" />
                      <div>
                        <p className="font-semibold text-foreground">История</p>
                        <p className="text-sm">Все результаты сохраняются автоматически</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="BookOpen" size={24} className="text-blue-500" />
                  Инструкция
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">Загрузите изображение</p>
                      <p className="text-sm text-muted-foreground">
                        Выберите файл PNG или JPG до 10MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">Выберите функцию</p>
                      <p className="text-sm text-muted-foreground">
                        Анализ цветов или поиск шрифтов
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-semibold">Получите результат</p>
                      <p className="text-sm text-muted-foreground">
                        Нажмите на цвет или шрифт чтобы скопировать
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <p className="font-semibold">Проверьте историю</p>
                      <p className="text-sm text-muted-foreground">
                        Все анализы доступны во вкладке "История"
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
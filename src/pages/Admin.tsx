import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type LayoutBlock = {
  id: string;
  type: 'header' | 'upload' | 'results' | 'history';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
};

export default function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [blocks, setBlocks] = useState<LayoutBlock[]>([
    { id: '1', type: 'header', title: 'Шапка сайта', position: { x: 0, y: 0 }, size: { width: 100, height: 20 }, visible: true },
    { id: '2', type: 'upload', title: 'Загрузка изображения', position: { x: 0, y: 20 }, size: { width: 50, height: 60 }, visible: true },
    { id: '3', type: 'results', title: 'Результаты анализа', position: { x: 50, y: 20 }, size: { width: 50, height: 60 }, visible: true },
    { id: '4', type: 'history', title: 'История', position: { x: 0, y: 80 }, size: { width: 100, height: 20 }, visible: true },
  ]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#9333ea');
  const [secondaryColor, setSecondaryColor] = useState('#ec4899');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      toast.success('Вход выполнен!');
    } else {
      toast.error('Неверный пароль');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
    navigate('/');
    toast.success('Выход выполнен');
  };

  const updateBlockPosition = (id: string, position: { x: number; y: number }) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, position } : block
    ));
  };

  const updateBlockSize = (id: string, size: { width: number; height: number }) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, size } : block
    ));
  };

  const toggleBlockVisibility = (id: string) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, visible: !block.visible } : block
    ));
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/6ef814a9-0636-4234-abff-89c4e198ce64');
      const data = await response.json();
      
      if (data.settings) {
        setPrimaryColor(data.settings.primary_color || '#9333ea');
        setSecondaryColor(data.settings.secondary_color || '#ec4899');
        setBackgroundColor(data.settings.background_color || '#ffffff');
      }
      
      if (data.blocks) {
        setBlocks(data.blocks);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/6ef814a9-0636-4234-abff-89c4e198ce64', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks,
          colors: { primary: primaryColor, secondary: secondaryColor, background: backgroundColor }
        })
      });
      
      if (response.ok) {
        toast.success('Настройки сохранены!');
      }
    } catch (error) {
      toast.error('Ошибка при сохранении');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <Icon name="Lock" size={48} className="mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold">Админ-панель</h1>
            <p className="text-muted-foreground mt-2">Введите пароль для доступа</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Введите пароль"
                className="mt-2"
              />
            </div>
            
            <Button onClick={handleLogin} className="w-full">
              <Icon name="LogIn" size={20} className="mr-2" />
              Войти
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const selectedBlockData = blocks.find(b => b.id === selectedBlock);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Панель управления
            </h1>
            <p className="text-muted-foreground mt-2">Настройка дизайна и расположения блоков</p>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={() => navigate('/')} variant="outline">
              <Icon name="Home" size={20} className="mr-2" />
              На главную
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              <Icon name="LogOut" size={20} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>

        <Tabs defaultValue="layout" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="layout">
              <Icon name="Layout" size={20} className="mr-2" />
              Конструктор
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Icon name="Palette" size={20} className="mr-2" />
              Цвета
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Settings" size={20} className="mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6">
                <h2 className="text-xl font-bold mb-4">Предпросмотр макета</h2>
                <div className="relative w-full h-[600px] bg-white rounded-lg border-2 border-dashed border-muted overflow-hidden">
                  {blocks.filter(b => b.visible).map(block => (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlock(block.id)}
                      className={`absolute cursor-pointer transition-all ${
                        selectedBlock === block.id ? 'ring-4 ring-primary' : 'hover:ring-2 hover:ring-primary/50'
                      }`}
                      style={{
                        left: `${block.position.x}%`,
                        top: `${block.position.y}%`,
                        width: `${block.size.width}%`,
                        height: `${block.size.height}%`,
                        backgroundColor: selectedBlock === block.id ? 'rgba(147, 51, 234, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        border: '2px solid rgba(147, 51, 234, 0.3)',
                      }}
                    >
                      <div className="p-4 h-full flex items-center justify-center text-sm font-medium text-center">
                        <div>
                          <Icon name={block.type === 'header' ? 'Heading' : block.type === 'upload' ? 'Upload' : block.type === 'results' ? 'CheckCircle' : 'History'} size={24} className="mx-auto mb-2" />
                          {block.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Управление блоками</h2>
                
                <div className="space-y-4 mb-6">
                  {blocks.map(block => (
                    <div key={block.id} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedBlock === block.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                    }`} onClick={() => setSelectedBlock(block.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon name={block.type === 'header' ? 'Heading' : block.type === 'upload' ? 'Upload' : block.type === 'results' ? 'CheckCircle' : 'History'} size={20} />
                          <span className="font-medium">{block.title}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBlockVisibility(block.id);
                          }}
                        >
                          <Icon name={block.visible ? 'Eye' : 'EyeOff'} size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedBlockData && (
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-bold">Параметры блока</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">X позиция (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={selectedBlockData.position.x}
                          onChange={(e) => updateBlockPosition(selectedBlock!, { ...selectedBlockData.position, x: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Y позиция (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={selectedBlockData.position.y}
                          onChange={(e) => updateBlockPosition(selectedBlock!, { ...selectedBlockData.position, y: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Ширина (%)</Label>
                        <Input
                          type="number"
                          min="10"
                          max="100"
                          value={selectedBlockData.size.width}
                          onChange={(e) => updateBlockSize(selectedBlock!, { ...selectedBlockData.size, width: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Высота (%)</Label>
                        <Input
                          type="number"
                          min="10"
                          max="100"
                          value={selectedBlockData.size.height}
                          onChange={(e) => updateBlockSize(selectedBlock!, { ...selectedBlockData.size, height: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="colors">
            <Card className="p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Настройка цветовой схемы</h2>
              
              <div className="space-y-6">
                <div>
                  <Label>Основной цвет</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Вторичный цвет</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Цвет фона</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-lg" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                  <p className="text-white font-bold text-lg">Предпросмотр градиента</p>
                  <p className="text-white/80 mt-1">Так будут выглядеть акцентные элементы</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Общие настройки</h2>
              
              <div className="space-y-6">
                <div>
                  <Label>Название сайта</Label>
                  <Input defaultValue="Paletteek" className="mt-2" />
                </div>
                
                <div>
                  <Label>Описание</Label>
                  <Input defaultValue="Точный анализ цветов и поиск шрифтов" className="mt-2" />
                </div>
                
                <div className="pt-4 space-y-3">
                  <Button onClick={saveSettings} className="w-full" size="lg">
                    <Icon name="Save" size={20} className="mr-2" />
                    Сохранить все изменения
                  </Button>
                  
                  <Button variant="outline" className="w-full" size="lg">
                    <Icon name="RotateCcw" size={20} className="mr-2" />
                    Сбросить к исходным
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
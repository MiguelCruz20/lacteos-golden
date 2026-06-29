import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, ChevronRight, CheckCircle, Phone, MapPin, Clock, 
  Settings, UploadCloud, LogOut, Trash2, Edit3, Plus, Minus, 
  Info, X, DollarSign, CreditCard, ArrowRight, PlusCircle, 
  RefreshCw, LayoutDashboard, Check, Search, Filter, Lock, Sparkles,
  ArrowUpRight, Eye, AlertTriangle, ChevronUp, ChevronDown,
  Download, Leaf
} from 'lucide-react';

// URL del backend en Render. En producción (GitHub Pages) usamos la URL completa de Render,
// porque GitHub Pages no puede correr el servidor Express. En desarrollo local o en Render
// mismo, usamos rutas relativas (vacío) ya que el backend está en el mismo dominio.
const API_BASE = window.location.hostname.includes('github.io')
  ? 'https://lacteos-golden-xpg4.onrender.com'
  : '';

// Types
interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precioLibra: number;
  precioMedia: number | null;
  imagen: string;
  activo: boolean;
  etiqueta: string;
  orden?: number;
}

interface OrderItem {
  id: string;
  nombre: string;
  cantidad: number;
  presentacion: 'Libra' | 'Media';
  precioUnitario: number;
  subtotal: number;
}

interface Order {
  id: string;
  fecha: string;
  hora: string;
  nombre: string;
  direccion: string;
  telefono: string;
  productos: OrderItem[];
  metodoPago: 'Efectivo' | 'Transferencia';
  comprobante: string | null;
  total: number;
  estado: 'Pendiente' | 'Preparando' | 'En camino' | 'Enviado' | 'Entregado' | 'Completado' | 'Cancelado';
}

interface ProductCardProps {
  key?: any;
  prod: Product;
  addToCart: (product: Product, size: 'Libra' | 'Media', qty: number) => void;
}

function ProductCard({ prod, addToCart }: ProductCardProps) {
  const [cardSize, setCardSize] = useState<'Libra' | 'Media'>('Libra');
  const [cardQty, setCardQty] = useState(1);
  const priceUnit = cardSize === 'Libra' ? prod.precioLibra : (prod.precioMedia || 0);
  const cardTotal = priceUnit * cardQty;

  return (
    <div 
      className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-amber-900/5 dark:border-slate-800 hover:shadow-2xl transition-all hover:-translate-y-1 flex flex-col group"
    >
      {/* Tag overlay */}
      <div className="relative">
        <img 
          src={prod.imagen} 
          alt={prod.nombre} 
          className="w-full aspect-square object-cover transition-transform group-hover:scale-105 duration-500"
          loading="lazy"
        />
        {prod.etiqueta && (
          <span className="absolute top-3 left-3 bg-[#FFD54F] text-[#8B5A2B] text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-md border border-white">
            {prod.etiqueta}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white group-hover:text-[#0B5ED7] transition-colors">
            {prod.nombre}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2rem]">
            {prod.descripcion}
          </p>
        </div>

        {/* Pricing & Presentation selection */}
        <div className="my-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Presentación:</span>
            
            {/* Presentation pill switchers */}
            <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700">
              <button 
                type="button"
                onClick={() => setCardSize('Libra')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all uppercase ${cardSize === 'Libra' ? 'bg-[#2E8B57] text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
              >
                LB (L {prod.precioLibra})
              </button>
              {prod.precioMedia && (
                <button 
                  type="button"
                  onClick={() => setCardSize('Media')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all uppercase ${cardSize === 'Media' ? 'bg-[#2E8B57] text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
                >
                  1/2 LB (L {prod.precioMedia})
                </button>
              )}
            </div>
          </div>

          {/* Quantity controller */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Cantidad:</span>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setCardQty(q => Math.max(1, q - 1))}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full flex items-center justify-center font-extrabold transition-colors animate-none"
              >
                <Minus size={12} />
              </button>
              <span className="text-sm font-extrabold w-6 text-center">{cardQty}</span>
              <button 
                type="button"
                onClick={() => setCardQty(q => q + 1)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full flex items-center justify-center font-extrabold transition-colors animate-none"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Multi-calculation display */}
          <div className="flex justify-between items-center bg-[#FAF6EE] dark:bg-slate-800/40 p-2 rounded-xl border border-amber-900/5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Total Parcial:</span>
            <span className="text-sm font-extrabold text-[#8B5A2B] dark:text-amber-400">
              L {cardTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Purchase Button */}
        <button 
          type="button"
          onClick={() => {
            addToCart(prod, cardSize, cardQty);
            setCardQty(1); // Reset
          }}
          className="w-full bg-[#0B5ED7] hover:bg-blue-700 text-white font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs transition-transform active:scale-95 cursor-pointer shadow-md"
        >
          <ShoppingBag size={14} /> Agregar al Pedido
        </button>
      </div>
    </div>
  );
}

export default function App() {
  // Theme & Navigation States
  const [darkMode] = useState(true);
  const [view, setView] = useState<'home' | 'admin'>('home');
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState({ 
    googleSheetsUrl: '', 
    adminUsername: 'admin',
    storeName: 'Lácteos Golden',
    storeSubtitle: 'La Casa del Queso'
  });
  const [loading, setLoading] = useState(true);

  // Cart & Checkout States
  const [cart, setCart] = useState<{ product: Product; quantity: number; size: 'Libra' | 'Media' }[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'success'>('form');
  const [newOrder, setNewOrder] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    metodoPago: 'Efectivo' as 'Efectivo' | 'Transferencia',
    comprobanteUrl: null as string | null,
    comprobanteBase64: null as string | null,
    comprobanteMimeType: null as string | null,
  });
  const [manualBlocks, setManualBlocks] = useState<{ productId: string; quantity: number; size: 'Libra' | 'Media' }[]>([]);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // File Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Admin States
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('adminToken'));
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminTab, setAdminTab] = useState<'orders' | 'products' | 'settings'>('orders');
  const [orderFilter, setOrderFilter] = useState('Todos');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<Order | null>(null);

  // Edit/Add Product Modal States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [generatingAIImage, setGeneratingAIImage] = useState(false);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);

  // Settings Edit State
  const [settingsForm, setSettingsForm] = useState({ 
    googleSheetsUrl: '', 
    adminUsername: '', 
    storeName: '', 
    storeSubtitle: '', 
    currentPassword: '', 
    newPassword: '' 
  });
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Initial Sync and Hash routing
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setView('admin');
      } else {
        setView('home');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    
    // Fetch initial products
    fetchProducts();
    fetchSettings();

    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders (only if token present)
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setSettingsForm(prev => ({
          ...prev,
          googleSheetsUrl: data.googleSheetsUrl || '',
          adminUsername: data.adminUsername || 'admin',
          storeName: data.storeName || 'Lácteos Golden',
          storeSubtitle: data.storeSubtitle || 'La Casa del Queso'
        }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // Watch token and load orders with automatic 5-second polling for real-time updates
  useEffect(() => {
    if (adminToken) {
      fetchOrders();
      const interval = setInterval(() => {
        fetchOrders();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [adminToken]);



  // Cart operations
  const addToCart = (product: Product, size: 'Libra' | 'Media', qty: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size === size);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id && item.size === size 
            ? { ...item, quantity: item.quantity + qty } 
            : item
        );
      }
      return [...prev, { product, size, quantity: qty }];
    });
    // Visual alert or smooth feedback
  };

  const updateCartQty = (productId: string, size: 'Libra' | 'Media', nextQty: number) => {
    if (nextQty <= 0) {
      setCart(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
    } else {
      setCart(prev => prev.map(item => 
        item.product.id === productId && item.size === size 
          ? { ...item, quantity: nextQty } 
          : item
      ));
    }
  };

  // Dynamic products builder inside order drawer
  const addManualBlock = () => {
    const available = products.filter(p => p.activo);
    if (available.length > 0) {
      setManualBlocks(prev => [...prev, { productId: available[0].id, quantity: 1, size: 'Libra' }]);
    }
  };

  const removeManualBlock = (index: number) => {
    setManualBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const updateManualBlock = (index: number, fields: Partial<{ productId: string; quantity: number; size: 'Libra' | 'Media' }>) => {
    setManualBlocks(prev => prev.map((block, i) => i === index ? { ...block, ...fields } : block));
  };

  // Calculate Subtotals & Totals
  const calculateCartTotal = () => {
    let sum = 0;
    // Main Catalog Cart Items
    cart.forEach(item => {
      const price = item.size === 'Libra' ? item.product.precioLibra : (item.product.precioMedia || 0);
      sum += price * item.quantity;
    });
    // Dynamic Manual Form Blocks
    manualBlocks.forEach(block => {
      const prod = products.find(p => p.id === block.productId);
      if (prod) {
        const price = block.size === 'Libra' ? prod.precioLibra : (prod.precioMedia || 0);
        sum += price * block.quantity;
      }
    });
    return sum;
  };

  // Compile final items list for submission
  const getCompiledOrderItems = (): OrderItem[] => {
    const list: OrderItem[] = [];
    cart.forEach(item => {
      const price = item.size === 'Libra' ? item.product.precioLibra : (item.product.precioMedia || 0);
      list.push({
        id: item.product.id,
        nombre: item.product.nombre,
        cantidad: item.quantity,
        presentacion: item.size,
        precioUnitario: price,
        subtotal: price * item.quantity
      });
    });
    manualBlocks.forEach(block => {
      const prod = products.find(p => p.id === block.productId);
      if (prod) {
        const price = block.size === 'Libra' ? prod.precioLibra : (prod.precioMedia || 0);
        list.push({
          id: block.productId,
          nombre: prod.nombre,
          cantidad: block.quantity,
          presentacion: block.size,
          precioUnitario: price,
          subtotal: price * block.quantity
        });
      }
    });
    return list;
  };

  // Handle Drag & Drop Receipt upload
  const handleFile = async (file: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'].includes(file.type)) {
      setUploadError('Formato inválido. Solo PNG, JPG, JPEG o PDF.');
      return;
    }
    setUploadError('');
    setUploadingFile(true);

    try {
      // Read base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          // Upload file via API
          const res = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Data: base64String, filename: file.name })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setNewOrder(prev => ({
              ...prev,
              comprobanteUrl: data.url,
              comprobanteBase64: base64String.replace(/^data:image\/\w+;base64,/, ''),
              comprobanteMimeType: file.type
            }));
          } else {
            setUploadError(data.error || 'Fallo al procesar imagen.');
          }
        } catch (e) {
          setUploadError('Error de red al subir archivo.');
        } finally {
          setUploadingFile(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError('Error de lectura de archivo.');
      setUploadingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Order Submission
  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = getCompiledOrderItems();
    if (items.length === 0) {
      alert('Por favor selecciona al menos un producto para tu pedido.');
      return;
    }
    if (!newOrder.nombre || !newOrder.direccion || !newOrder.telefono) {
      alert('Por favor completa todos tus datos personales.');
      return;
    }
    if (newOrder.metodoPago === 'Transferencia') {
      if (uploadingFile) {
        alert('El comprobante se está cargando. Por favor, espera a que finalice la subida.');
        return;
      }
      if (!newOrder.comprobanteUrl) {
        alert('Debes subir el comprobante de transferencia bancaria para poder confirmar tu pedido.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: newOrder.nombre,
          direccion: newOrder.direccion,
          telefono: newOrder.telefono,
          productos: items,
          metodoPago: newOrder.metodoPago,
          comprobante: newOrder.comprobanteUrl,
          comprobanteBase64: newOrder.comprobanteBase64,
          comprobanteMimeType: newOrder.comprobanteMimeType,
          total: calculateCartTotal()
        })
      });

      if (res.ok) {
        const placed = await res.json();
        setLastPlacedOrder(placed);
        setCheckoutStep('success');
        setCart([]);
        setManualBlocks([]);
        // Force refresh orders so they show up instantly in the administration orders list
        fetchOrders();
        // Reset form
        setNewOrder({
          nombre: '',
          direccion: '',
          telefono: '',
          metodoPago: 'Efectivo',
          comprobanteUrl: null,
          comprobanteBase64: null,
          comprobanteMimeType: null,
        });
      } else {
        alert('Error al registrar tu pedido. Intenta nuevamente.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp formatted summaries helper
  const openWhatsAppOrder = (order: Order) => {
    const productsText = order.productos
      .map(p => `• *${p.nombre}* (${p.cantidad} x ${p.presentacion}) - L. ${(p.subtotal).toFixed(2)}`)
      .join('%0A');
    
    const text = `*¡HOLA! QUIERO REALIZAR UN PEDIDO EN SE VENDE LÁCTEOS* 🧀🥛%0A%0A` +
      `*ID de Pedido:* ${order.id}%0A` +
      `*Cliente:* ${order.nombre}%0A` +
      `*Teléfono:* ${order.telefono}%0A` +
      `*Dirección:* ${order.direccion}%0A%0A` +
      `*PRODUCTOS:*%0A${productsText}%0A%0A` +
      `*Método de Pago:* ${order.metodoPago}%0A` +
      `*TOTAL:* *L. ${order.total.toFixed(2)}*%0A%0A` +
      `_Por favor confírmame el pedido para prepararlo. ¡Gracias!_`;

    window.open(`https://wa.me/50489261628?text=${text}`, '_blank');
  };

  // Admin login handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUser, password: adminPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminToken(data.token);
        sessionStorage.setItem('adminToken', data.token);
      } else {
        setAdminError(data.error || 'Credenciales inválidas.');
      }
    } catch (err) {
      setAdminError('Error de conexión con el servidor.');
    }
  };

  // Admin logout
  const handleAdminLogout = () => {
    setAdminToken(null);
    sessionStorage.removeItem('adminToken');
  };

  // Admin order state modifiers
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nextStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: nextStatus as any } : o));
        if (selectedAdminOrder && selectedAdminOrder.id === orderId) {
          setSelectedAdminOrder(prev => prev ? { ...prev, estado: nextStatus as any } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`¿Estás seguro de eliminar permanentemente el pedido ${orderId}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        setSelectedAdminOrder(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Product modal trigger
  const openProductForm = (prod: Product | null) => {
    if (prod) {
      setEditingProduct({ ...prod });
    } else {
      setEditingProduct({
        nombre: '',
        descripcion: '',
        precioLibra: 0,
        precioMedia: null,
        imagen: '',
        activo: true,
        etiqueta: 'Nuevo'
      });
    }
    setProductModalOpen(true);
  };

  // Generate Image with Gemini API
  const handleGenerateAIImage = async () => {
    if (!editingProduct?.nombre) {
      alert('Escribe el nombre del producto primero para guiar la generación de imagen.');
      return;
    }
    setGeneratingAIImage(true);
    try {
      const promptText = `A professional rustic farm catalog close-up food shot of high-end dairy product "${editingProduct.nombre}", sitting on a dark wood country kitchen table, garnished elegantly, warm natural daylight, highly photorealistic 4k.`;
      const res = await fetch(`${API_BASE}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: editingProduct.nombre, prompt: promptText })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditingProduct(prev => ({ ...prev, imagen: data.url }));
      } else {
        alert('Fallo la IA, se usará un enlace premium preestablecido de Unsplash.');
      }
    } catch (err) {
      alert('Error en conexión con la IA de Gemini.');
    } finally {
      setGeneratingAIImage(false);
    }
  };

  // Upload Custom Product Image automatically
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProductImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data,
              filename: file.name,
              prefix: 'product'
            })
          });
          const data = await res.json();
          if (res.ok && data.url) {
            setEditingProduct(prev => prev ? { ...prev, imagen: data.url } : null);
          } else {
            alert('Fallo la subida de la imagen.');
          }
        } catch (err) {
          alert('Error de conexión al subir la imagen.');
        } finally {
          setUploadingProductImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploadingProductImage(false);
    }
  };

  // Product submission (save or create)
  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.nombre || !editingProduct?.precioLibra) {
      alert('Nombre y Precio por Libra son requeridos.');
      return;
    }

    const isEdit = !!editingProduct.id;
    const url = isEdit ? `${API_BASE}/api/products/${editingProduct.id}` : `${API_BASE}/api/products`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        fetchProducts();
        setProductModalOpen(false);
        setEditingProduct(null);
      } else {
        alert('Error al guardar el producto.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Product deletion
  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm('¿Eliminar permanentemente este producto del catálogo?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${prodId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Product reordering helper (up/down list)
  const handleReorder = async (currentIndex: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= products.length) return;

    const listCopy = [...products];
    const temp = listCopy[currentIndex];
    listCopy[currentIndex] = listCopy[nextIndex];
    listCopy[nextIndex] = temp;

    // Fast state update
    setProducts(listCopy);

    try {
      await fetch(`${API_BASE}/api/products/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: listCopy.map(p => p.id) })
      });
    } catch (err) {
      console.error('Error sorting products:', err);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMessage('');
    setSettingsError('');
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMessage('Configuración actualizada con éxito.');
        fetchSettings();
      } else {
        setSettingsError(data.error || 'No se pudo guardar la configuración.');
      }
    } catch (err) {
      setSettingsError('Error de red al actualizar.');
    }
  };

  // Force sheet synchronization
  const handleForceSync = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/sync-all`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('¡Sincronización completa! Todos los pedidos han sido cargados en la hoja de Google Sheets.');
      } else {
        alert(data.error || 'No se pudo sincronizar. Verifica tu Apps Script URL.');
      }
    } catch (e) {
      alert('Error de conexión al sincronizar.');
    } finally {
      setLoading(false);
    }
  };

  // Export spreadsheet as simple CSV (Excel format)
  const exportCSV = () => {
    let headers = 'ID,Fecha,Hora,Cliente,Direccion,Telefono,Productos,Metodo Pago,Total,Estado\n';
    let rows = orders.map(o => {
      const items = o.productos.map(p => `${p.nombre}(${p.cantidad} ${p.presentacion})`).join(' | ');
      return `"${o.id}","${o.fecha}","${o.hora}","${o.nombre.replace(/"/g, '""')}","${o.direccion.replace(/"/g, '""')}","${o.telefono}","${items.replace(/"/g, '""')}","${o.metodoPago}",${o.total},"${o.estado}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `pedidos_lacteos_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dashboard Stats Calculations
  const getDashboardStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.fecha === today);
    const totalEarnings = orders.filter(o => o.estado !== 'Cancelado').reduce((sum, o) => sum + o.total, 0);
    
    // Most popular product
    const productCounts: Record<string, number> = {};
    orders.forEach(o => {
      if (o.estado !== 'Cancelado') {
        o.productos.forEach(p => {
          productCounts[p.nombre] = (productCounts[p.nombre] || 0) + p.cantidad;
        });
      }
    });
    let topProduct = 'N/A';
    let maxCount = 0;
    Object.entries(productCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topProduct = name;
      }
    });

    return {
      todayCount: todayOrders.length,
      todayRevenue: todayOrders.reduce((s, o) => s + o.total, 0),
      totalCount: orders.length,
      totalRevenue: totalEarnings,
      topProduct,
      activeClients: new Set(orders.map(o => o.telefono)).size
    };
  };

  const stats = getDashboardStats();

  return (
    <div 
      className={darkMode ? 'dark bg-slate-950 text-slate-100 min-h-screen font-sans' : 'bg-[#FAF6EE] text-slate-800 min-h-screen font-sans transition-colors duration-300'}
      style={view === 'home' ? {
        backgroundImage: darkMode 
          ? "linear-gradient(rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80')"
          : "linear-gradient(rgba(250, 246, 238, 0.90), rgba(250, 246, 238, 0.95)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80')",
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      } : undefined}
    >
      
      {/* ------------------ NAV BAR ------------------ */}
      <header id="nav-header" className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-amber-900/10 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('home'); window.location.hash = ''; }}>
            <div className="bg-[#2E8B57] text-[#FFD54F] w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shadow-md border-2 border-white">
              L
            </div>
            <div>
              <span className="font-serif font-extrabold text-lg sm:text-xl text-[#8B5A2B] dark:text-amber-500 tracking-tight block">
                {settings.storeName || "Lácteos Golden"}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#2E8B57] dark:text-emerald-400 block -mt-1">
                {settings.storeSubtitle || "La Casa del Queso"}
              </span>
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            <a href="#nav-catalog" className="hidden md:inline-block text-xs uppercase font-bold tracking-wider text-slate-600 hover:text-[#2E8B57] dark:text-slate-300 dark:hover:text-emerald-400 transition-colors">
              Catálogo
            </a>
            <a href="#nav-why" className="hidden md:inline-block text-xs uppercase font-bold tracking-wider text-slate-600 hover:text-[#2E8B57] dark:text-slate-300 dark:hover:text-emerald-400 transition-colors">
              ¿Por qué nosotros?
            </a>



            {/* Admin view toggle link */}
            {view === 'home' ? (
              <a 
                href="#admin" 
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Settings size={14} /> Panel Admin
              </a>
            ) : (
              <button 
                onClick={() => { setView('home'); window.location.hash = ''; }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-amber-100 dark:bg-amber-950/40 text-[#8B5A2B] dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
              >
                Volver a Tienda
              </button>
            )}

            {/* Cart Button */}
            {view === 'home' && (
              <button 
                id="cart-trigger"
                onClick={() => setCheckoutOpen(true)}
                className="bg-[#2E8B57] hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <ShoppingBag size={18} className="text-[#FFD54F]" />
                <span className="font-bold text-xs sm:text-sm">{cart.length + manualBlocks.length}</span>
                <span className="hidden sm:inline font-bold text-xs border-l border-white/20 pl-2">
                  L {calculateCartTotal().toFixed(2)}
                </span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------------------------- */}
      {/* PUBLIC CLIENT LANDING VIEW */}
      {/* ----------------------------------------------------------------------------- */}
      {view === 'home' && (
        <main>
          
          {/* HERO SECTION */}
          <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-amber-500/5 to-transparent pt-12 pb-16 sm:py-24">
            
            {/* Top background graphic */}
            <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-[radial-gradient(circle_at_top_right,_rgba(255,213,79,0.15),_transparent_70%)] pointer-events-none" />

            {/* Decorative organic leaf vectors */}
            <div className="absolute top-10 left-10 text-emerald-500/20 dark:text-emerald-400/10 pointer-events-none animate-pulse">
              <Leaf size={48} className="rotate-[15deg]" />
            </div>
            <div className="absolute bottom-20 right-1/3 text-emerald-500/10 dark:text-emerald-400/5 pointer-events-none animate-pulse delay-[1500ms]">
              <Leaf size={32} className="rotate-[-45deg]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Text column */}
              <div id="hero-text-container" className="lg:col-span-7 space-y-6">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFD54F]/20 dark:bg-amber-500/20 text-[#8B5A2B] dark:text-amber-300 rounded-full text-xs font-extrabold tracking-wider uppercase animate-bounce">
                  <Sparkles size={14} /> Calidad que te cuida ❤️
                </span>

                <h1 className="font-serif font-extrabold text-4xl sm:text-6xl text-slate-900 dark:text-white leading-tight">
                  Lácteos Frescos <br />
                  <span className="text-[#0B5ED7] dark:text-blue-400">{settings.storeName || "Lácteos Golden"}</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl">
                  Disfruta del verdadero sabor del campo. Productos lácteos 100% frescos, higiénicos y con el amor de la tradición familiar artesanal directo a su mesa.
                </p>

                {/* Hero Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    id="hero-order-btn"
                    onClick={() => {
                      document.getElementById('nav-catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#0B5ED7] hover:bg-blue-700 text-white text-base font-extrabold px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag size={20} /> 🛒 Realizar Pedido
                  </button>
                  
                  <a 
                    id="hero-whatsapp-btn"
                    href="https://wa.me/50489261628?text=Hola,%20quiero%20realizar%20un%20pedido%20de%20productos%20lácteos%20artesanales."
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#2E8B57] hover:bg-emerald-700 text-white text-base font-extrabold px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl hover:shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <Phone size={20} /> 💬 Pedir por WhatsApp
                  </a>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <CheckCircle size={16} className="text-[#2E8B57]" /> 100% Fresco del Día
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <CheckCircle size={16} className="text-[#2E8B57]" /> Elaboración Campestre
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <CheckCircle size={16} className="text-[#2E8B57]" /> Entregas Seguras
                  </span>
                </div>
              </div>

              {/* Stats & Visual column */}
              <div id="hero-graphic-container" className="lg:col-span-5 relative">
                
                {/* Visual Glass Box */}
                <div className="relative z-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                  
                  {/* Decorative Banner Image */}
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden relative shadow-inner">
                    <img 
                      src="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80" 
                      alt="Nuestra Finca Láctea" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                      <p className="text-white text-sm font-bold italic">
                        "Elaborados al amanecer con la mejor leche de la comarca."
                      </p>
                    </div>
                  </div>

                  {/* High-density grid statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl shadow-sm text-center border border-amber-900/5">
                      <span className="block text-2xl font-extrabold text-[#2E8B57]">+500</span>
                      <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Clientes Felices</span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl shadow-sm text-center border border-amber-900/5">
                      <span className="block text-2xl font-extrabold text-[#8B5A2B] dark:text-amber-500">100%</span>
                      <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Artesanal</span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl shadow-sm text-center border border-amber-900/5">
                      <span className="block text-2xl font-extrabold text-[#0B5ED7]">Entrega</span>
                      <span className="text-xs uppercase tracking-wider font-bold text-slate-500">A Domicilio</span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl shadow-sm text-center border border-amber-900/5">
                      <span className="block text-2xl font-extrabold text-emerald-600">Fresco</span>
                      <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Del Productor</span>
                    </div>
                  </div>

                </div>

                {/* Decorative glow behind card */}
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-3xl opacity-60 rounded-3xl pointer-events-none -z-10" />

              </div>

            </div>
          </section>

          {/* CATALOG SECTION */}
          <section id="nav-catalog" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-3">
                Nuestro Catálogo de Productos
              </h2>
              <div className="h-1 w-20 bg-[#2E8B57] mx-auto rounded mb-4" />
              <p className="text-slate-600 dark:text-slate-300">
                Lácteos puros, naturales y producidos bajo estrictas normas de higiene tradicional. Selecciona la presentación que prefieras y agrégalos a tu pedido.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <RefreshCw size={40} className="text-[#2E8B57] animate-spin" />
                <p className="text-slate-500 font-bold">Cargando productos del campo...</p>
              </div>
            ) : products.filter(p => p.activo).length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 font-bold text-lg mb-2">No hay productos activos en este momento.</p>
                <p className="text-sm text-slate-400">Vuelve más tarde o consulta con nuestro administrador.</p>
              </div>
            ) : (
              <div id="product-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products
                  .filter(p => p.activo)
                  .map(prod => (
                    <ProductCard key={prod.id} prod={prod} addToCart={addToCart} />
                  ))}
              </div>
            )}
          </section>

          {/* WHY CHOOSE US SECTION */}
          <section id="nav-why" className="py-16 bg-[#FAF6EE]/50 dark:bg-slate-900/30 border-y border-amber-900/5 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="font-serif font-extrabold text-3xl text-slate-900 dark:text-white mb-3">
                  ¿Por qué Elegir Nuestros Lácteos?
                </h2>
                <p className="text-slate-500 dark:text-slate-300">
                  Cuidamos cada detalle desde el ordeño de nuestras vacas hasta que el producto llega fresco a tu cocina.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-amber-900/5 text-center space-y-3">
                  <div className="w-12 h-12 bg-[#2E8B57]/10 text-[#2E8B57] rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">🌱</div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Fresco Diario</h3>
                  <p className="text-xs text-slate-500">Producido cada mañana para que experimentes la frescura campestre.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-amber-900/5 text-center space-y-3">
                  <div className="w-12 h-12 bg-amber-500/10 text-[#8B5A2B] rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">🐄</div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Directo del Campo</h3>
                  <p className="text-xs text-slate-500">Sin intermediarios comerciales. Directo de la comarca a tu hogar.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-amber-900/5 text-center space-y-3">
                  <div className="w-12 h-12 bg-[#0B5ED7]/10 text-[#0B5ED7] rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">⚡</div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Entrega Veloz</h3>
                  <p className="text-xs text-slate-500">Nuestra logística cuida la cadena de frío para un traslado oportuno.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-amber-900/5 text-center space-y-3">
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">⭐</div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Excelente Calidad</h3>
                  <p className="text-xs text-slate-500">Leche de primera clase e higiene rigurosa en todo el proceso.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-amber-900/5 text-center space-y-3">
                  <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">💰</div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Precio Justo</h3>
                  <p className="text-xs text-slate-500">Mantenemos tarifas justas para apoyar la economía de tu hogar.</p>
                </div>
              </div>
            </div>
          </section>

          {/* HOW TO ORDER SECTION */}
          <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-serif font-extrabold text-3xl text-slate-900 dark:text-white mb-2">
                ¿Cómo Hacer tu Pedido?
              </h2>
              <p className="text-slate-500">Sigue estos cuatro sencillos pasos para recibir frescura artesanal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              
              {/* Connector line */}
              <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-blue-500 -z-10" />

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-[#2E8B57] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto shadow-md border-4 border-white dark:border-slate-950">1</div>
                <h3 className="font-bold text-slate-900 dark:text-white">Elige Lácteos</h3>
                <p className="text-xs text-slate-500">Agrega tus quesos, mantequillas y cuajadas desde nuestro catálogo.</p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto shadow-md border-4 border-white dark:border-slate-950">2</div>
                <h3 className="font-bold text-slate-900 dark:text-white">Completa Datos</h3>
                <p className="text-xs text-slate-500">Ingresa tu dirección y teléfono para asegurar un despacho rápido.</p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-[#0B5ED7] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto shadow-md border-4 border-white dark:border-slate-950">3</div>
                <h3 className="font-bold text-slate-900 dark:text-white">Método de Pago</h3>
                <p className="text-xs text-slate-500">Paga en efectivo al recibir o por transferencia BAC Honduras.</p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-[#8B5A2B] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto shadow-md border-4 border-white dark:border-slate-950">4</div>
                <h3 className="font-bold text-slate-900 dark:text-white">¡Hasta tu Mesa!</h3>
                <p className="text-xs text-slate-500">Llevamos el pedido directo hasta tu puerta, garantizado fresco.</p>
              </div>
            </div>
          </section>

        </main>
      )}

      {/* ----------------------------------------------------------------------------- */}
      {/* ADMIN CONTROL PANEL VIEW */}
      {/* ----------------------------------------------------------------------------- */}
      {view === 'admin' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* LOGIN SCREEN */}
          {!adminToken ? (
            <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="text-center space-y-2 mb-6">
                <div className="bg-[#2E8B57]/10 text-[#2E8B57] w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-xl">
                  <Lock />
                </div>
                <h2 className="font-serif font-extrabold text-2xl text-slate-900 dark:text-white">Administración Privada</h2>
                <p className="text-xs text-slate-500">Ingresa las credenciales configuradas para acceder al panel.</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                {adminError && (
                  <div className="bg-red-500/15 border border-red-500/30 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertTriangle size={14} /> {adminError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Usuario</label>
                  <input 
                    type="text" 
                    value={adminUser}
                    onChange={e => setAdminUser(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-[#2E8B57] outline-none"
                    placeholder="Escribe tu usuario"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contraseña</label>
                  <input 
                    type="password" 
                    value={adminPass}
                    onChange={e => setAdminPass(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-[#2E8B57] outline-none"
                    placeholder="Escribe tu contraseña"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-[#2E8B57] hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-md transition-all uppercase text-xs tracking-wider"
                >
                  Entrar al Dashboard
                </button>
              </form>
            </div>
          ) : (
            
            // LOGGED-IN ADMINISTRATIVE DASHBOARD
            <div className="space-y-6">
              
              {/* Dashboard Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 gap-4">
                <div>
                  <span className="text-xs font-bold text-[#2E8B57] dark:text-emerald-400 uppercase tracking-widest">Panel de Control</span>
                  <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">Sincronización de Lácteos</h2>
                </div>
                
                <div className="flex gap-2">
                  {/* Google Sheets Sync Trigger */}
                  {settings.googleSheetsUrl && (
                    <button 
                      onClick={handleForceSync}
                      className="bg-[#2E8B57]/10 hover:bg-[#2E8B57]/20 text-[#2E8B57] dark:text-emerald-400 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors border border-[#2E8B57]/20"
                    >
                      <RefreshCw size={14} /> Forzar Sincronización Sheets
                    </button>
                  )}
                  
                  <button 
                    onClick={handleAdminLogout}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut size={14} /> Cerrar Sesión
                  </button>
                </div>
              </div>

              {/* STATS TILES BAR */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                  <span className="block text-2xl font-extrabold text-[#2E8B57]">{stats.todayCount}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pedidos Hoy</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                  <span className="block text-xl font-extrabold text-[#2E8B57]">L {stats.todayRevenue.toFixed(2)}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ventas Hoy</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                  <span className="block text-2xl font-extrabold text-[#0B5ED7]">{stats.totalCount}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Pedidos</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                  <span className="block text-xl font-extrabold text-[#0B5ED7]">L {stats.totalRevenue.toFixed(2)}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ingresos Totales</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                  <span className="block text-sm font-extrabold text-amber-600 truncate">{stats.topProduct}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Más Vendido</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                  <span className="block text-2xl font-extrabold text-purple-600">{stats.activeClients}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Clientes Únicos</span>
                </div>
              </div>

              {/* NAVIGATION TABS FOR ADMIN */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
                <button 
                  onClick={() => setAdminTab('orders')}
                  className={`pb-3 text-sm font-bold uppercase tracking-wider relative ${adminTab === 'orders' ? 'text-[#0B5ED7] border-b-2 border-[#0B5ED7]' : 'text-slate-400'}`}
                >
                  📋 Pedidos Recibidos ({orders.length})
                </button>
                <button 
                  onClick={() => setAdminTab('products')}
                  className={`pb-3 text-sm font-bold uppercase tracking-wider relative ${adminTab === 'products' ? 'text-[#0B5ED7] border-b-2 border-[#0B5ED7]' : 'text-slate-400'}`}
                >
                  🧀 Catálogo de Lácteos ({products.length})
                </button>
                <button 
                  onClick={() => setAdminTab('settings')}
                  className={`pb-3 text-sm font-bold uppercase tracking-wider relative ${adminTab === 'settings' ? 'text-[#0B5ED7] border-b-2 border-[#0B5ED7]' : 'text-slate-400'}`}
                >
                  ⚙ Integración & Ajustes
                </button>
              </div>

              {/* TAB 1: ORDERS SPREADSHEET MANAGER */}
              {adminTab === 'orders' && (
                <div className="space-y-4">
                  
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={orderSearch}
                        onChange={e => setOrderSearch(e.target.value)}
                        placeholder="Buscar por ID, nombre o teléfono..."
                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <select 
                        value={orderFilter}
                        onChange={e => setOrderFilter(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                      >
                        <option value="Todos" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">Todos los Estados</option>
                        <option value="Pendiente" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">Pendiente</option>
                        <option value="Preparando" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">Preparando</option>
                        <option value="En camino" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">En camino</option>
                        <option value="Enviado" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">Enviado</option>
                        <option value="Entregado" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">Entregado</option>
                        <option value="Completado" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">Completado</option>
                        <option value="Cancelado" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">Cancelado</option>
                      </select>

                      <button 
                        onClick={exportCSV}
                        className="bg-[#8B5A2B] hover:bg-[#724a23] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Download size={14} /> Exportar CSV (Excel)
                      </button>
                    </div>
                  </div>

                  {/* Orders Table spreadsheet layout */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                            <th className="p-4 text-center">ID Pedido</th>
                            <th className="p-4">Fecha / Hora</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Dirección</th>
                            <th className="p-4">Productos</th>
                            <th className="p-4">Método de Pago</th>
                            <th className="p-4 text-right">Total</th>
                            <th className="p-4 text-center">Estado</th>
                            <th className="p-4 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                          {orders
                            .filter(o => {
                              const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                                                    o.nombre.toLowerCase().includes(orderSearch.toLowerCase()) || 
                                                    o.telefono.includes(orderSearch);
                              const matchesFilter = orderFilter === 'Todos' || o.estado === orderFilter;
                              return matchesSearch && matchesFilter;
                            })
                            .map(order => (
                              <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                <td className="p-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                                  {order.id}
                                </td>
                                <td className="p-4 text-xs whitespace-nowrap">
                                  <div>{order.fecha}</div>
                                  <div className="text-slate-400 text-[10px]">{order.hora}</div>
                                </td>
                                <td className="p-4">
                                  <div className="font-bold">{order.nombre}</div>
                                  <div className="text-xs text-slate-400">{order.telefono}</div>
                                </td>
                                <td className="p-4 max-w-xs truncate text-xs" title={order.direccion}>
                                  {order.direccion}
                                </td>
                                <td className="p-4 max-w-md text-xs">
                                  <ul className="list-disc list-inside">
                                    {order.productos.map((p, idx) => (
                                      <li key={idx}>
                                        {p.nombre} ({p.cantidad} {p.presentacion === 'Libra' ? 'LB' : '1/2 LB'})
                                      </li>
                                    ))}
                                  </ul>
                                </td>
                                <td className="p-4 text-xs">
                                  <span className="flex items-center gap-1">
                                    {order.metodoPago === 'Transferencia' ? <CreditCard size={12} className="text-blue-500" /> : <DollarSign size={12} className="text-emerald-500" />}
                                    {order.metodoPago}
                                  </span>
                                </td>
                                <td className="p-4 text-right font-extrabold text-[#8B5A2B] dark:text-amber-400 whitespace-nowrap">
                                  L {order.total.toFixed(2)}
                                </td>
                                <td className="p-4 text-center">
                                  <select 
                                    value={order.estado}
                                    onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                                    className={`text-xs font-bold px-2.5 py-1.5 rounded-full border-none focus:ring-1 focus:ring-blue-500 outline-none ${
                                      order.estado === 'Entregado' || order.estado === 'Completado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                                      order.estado === 'Preparando' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' :
                                      order.estado === 'En camino' || order.estado === 'Enviado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' :
                                      order.estado === 'Cancelado' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400' :
                                      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                  >
                                    <option value="Pendiente" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">Pendiente</option>
                                    <option value="Preparando" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">Preparando</option>
                                    <option value="En camino" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">En camino</option>
                                    <option value="Enviado" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">Enviado</option>
                                    <option value="Entregado" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">Entregado</option>
                                    <option value="Completado" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">Completado</option>
                                    <option value="Cancelado" className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">Cancelado</option>
                                  </select>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    {order.comprobante && (
                                      <a 
                                        href={order.comprobante} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                        title="Ver comprobante de transferencia"
                                      >
                                        <Eye size={14} />
                                      </a>
                                    )}
                                    <button 
                                      onClick={() => openWhatsAppOrder(order)}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                      title="Enviar resumen por WhatsApp"
                                    >
                                      <Phone size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteOrder(order.id)}
                                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                      title="Eliminar pedido"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          {orders.length === 0 && (
                            <tr>
                              <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">
                                No se encontraron pedidos registrados.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: PRODUCTS CATALOG MANAGER */}
              {adminTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-400">
                      Arrastra y suelta u ordena tus productos usando las flechas para cambiar el orden de despliegue en la tienda.
                    </p>
                    <button 
                      onClick={() => openProductForm(null)}
                      className="bg-[#2E8B57] hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md"
                    >
                      <PlusCircle size={14} /> Agregar Nuevo Producto
                    </button>
                  </div>

                  {/* List of Products for Sorting and Editing */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {products.map((prod, index) => (
                        <div key={prod.id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <div className="flex items-center gap-4 flex-1">
                            
                            {/* Reordering indicators */}
                            <div className="flex flex-col gap-1">
                              <button 
                                disabled={index === 0}
                                onClick={() => handleReorder(index, 'up')}
                                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors"
                              >
                                <ChevronUp size={16} />
                              </button>
                              <button 
                                disabled={index === products.length - 1}
                                onClick={() => handleReorder(index, 'down')}
                                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors"
                              >
                                <ChevronDown size={16} />
                              </button>
                            </div>

                            <img 
                              src={prod.imagen} 
                              alt={prod.nombre} 
                              className="w-12 h-12 rounded-xl object-cover"
                            />

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-serif font-bold text-slate-900 dark:text-white">{prod.nombre}</span>
                                {prod.etiqueta && (
                                  <span className="bg-[#FFD54F]/20 text-[#8B5A2B] text-[8px] font-extrabold px-2 py-0.5 rounded-full">
                                    {prod.etiqueta}
                                  </span>
                                )}
                                {!prod.activo && (
                                  <span className="bg-red-500/10 text-red-600 text-[8px] font-extrabold px-2 py-0.5 rounded-full">
                                    Inactivo
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 line-clamp-1">{prod.descripcion || 'Sin descripción'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <span className="block text-sm font-extrabold text-[#8B5A2B] dark:text-amber-400">
                                LB: L {prod.precioLibra.toFixed(2)}
                              </span>
                              {prod.precioMedia && (
                                <span className="block text-[11px] text-slate-400">
                                  1/2 LB: L {prod.precioMedia.toFixed(2)}
                                </span>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button 
                                onClick={() => openProductForm(prod)}
                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-bold p-2.5 rounded-xl transition-colors"
                                title="Editar producto"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs font-bold p-2.5 rounded-xl transition-colors"
                                title="Eliminar del catálogo"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SETTINGS & INTEGRATIONS SCRIPT CODE */}
              {adminTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column: Form Settings */}
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                      <h3 className="font-serif font-extrabold text-lg text-slate-900 dark:text-white">Ajustes Generales del Sitio</h3>
                      
                      {settingsMessage && (
                        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 p-3 rounded-xl text-xs font-bold">
                          {settingsMessage}
                        </div>
                      )}
                      {settingsError && (
                        <div className="bg-red-500/15 border border-red-500/30 text-red-600 p-3 rounded-xl text-xs font-bold">
                          {settingsError}
                        </div>
                      )}

                      <form onSubmit={handleSaveSettings} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Google Apps Script Web App URL (Webhook)
                          </label>
                          <input 
                            type="url" 
                            value={settingsForm.googleSheetsUrl}
                            onChange={e => setSettingsForm(prev => ({ ...prev, googleSheetsUrl: e.target.value }))}
                            placeholder="https://script.google.com/macros/s/..."
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:border-[#2E8B57] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Nombre de la Tienda / Página
                          </label>
                          <input 
                            type="text" 
                            value={settingsForm.storeName}
                            onChange={e => setSettingsForm(prev => ({ ...prev, storeName: e.target.value }))}
                            placeholder="Ej. ¡Se Vende Lácteos!"
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold focus:border-[#2E8B57] outline-none mb-2"
                            required
                          />
                          <div className="flex flex-wrap gap-1.5 mt-1 mb-3">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold w-full mb-0.5">Sugerencias de nombres elegantes (Haz clic para aplicar):</span>
                            {['Lácteos El Prado', 'Lácteos Delicia Campestre', 'Finca El Milagro', 'Hacienda San José', 'Lácteos La Tradición'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setSettingsForm(prev => ({ ...prev, storeName: opt }))}
                                className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-[#2E8B57]/10 hover:text-[#2E8B57] dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 transition-all cursor-pointer font-medium"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Subtítulo de la Página
                          </label>
                          <input 
                            type="text" 
                            value={settingsForm.storeSubtitle}
                            onChange={e => setSettingsForm(prev => ({ ...prev, storeSubtitle: e.target.value }))}
                            placeholder="Ej. Se Vende Lácteos | FRESCOS Y ARTESANAL"
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:border-[#2E8B57] outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Usuario Administrador
                          </label>
                          <input 
                            type="text" 
                            value={settingsForm.adminUsername}
                            onChange={e => setSettingsForm(prev => ({ ...prev, adminUsername: e.target.value }))}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold focus:border-[#2E8B57] outline-none"
                            required
                          />
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                          <p className="text-xs font-bold text-slate-500">Cambiar Contraseña de Acceso</p>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contraseña Actual</label>
                            <input 
                              type="password" 
                              value={settingsForm.currentPassword}
                              onChange={e => setSettingsForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nueva Contraseña</label>
                            <input 
                              type="password" 
                              value={settingsForm.newPassword}
                              onChange={e => setSettingsForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs outline-none"
                            />
                          </div>
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-[#2E8B57] hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl uppercase transition-colors"
                        >
                          Guardar Configuraciones
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right Column: Google Sheets Code script */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Sparkles size={18} />
                      <h3 className="font-serif font-extrabold text-lg text-slate-900 dark:text-white">Conexión Google Sheets</h3>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Sigue estos pasos para sincronizar tus pedidos en tiempo real en tu propia hoja de cálculo de Google Drive de forma gratuita:
                    </p>

                    <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-1">
                      <li>Crea una nueva hoja de cálculo en Google Sheets.</li>
                      <li>Ve a la pestaña <b>Extensiones</b> y haz clic en <b>Apps Script</b>.</li>
                      <li>Copia y pega el código de abajo reemplazando todo el contenido por defecto.</li>
                      <li>Haz clic en el botón Implementar (botón azul) &gt; Nueva Implementación.</li>
                      <li>Tipo de implementación: <b>Aplicación Web</b>.</li>
                      <li>Ejecutar como: <b>Tú</b>. Quién tiene acceso: <b>Cualquiera</b>.</li>
                      <li>Haz clic en Implementar, aprueba los accesos, copia la <b>URL de Aplicación Web</b> resultante y pégala en el formulario de la izquierda.</li>
                    </ol>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold font-mono text-slate-500">GoogleAppsScript.js</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`function doPost(e) {
  try {
    var json = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha", "Hora", "ID Pedido", "Nombre Cliente", "Dirección", 
        "Teléfono", "Productos Seleccionados", "Método de Pago", 
        "Enlace Comprobante", "Total (Lps)", "Estado"
      ]);
    }

    if (json.action === "append_order") {
      var comprobanteUrl = json.comprobante;
      if (json.comprobanteBase64 && json.comprobanteMimeType) {
        try {
          var folderName = "Comprobantes Lácteos";
          var folders = DriveApp.getFoldersByName(folderName);
          var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
          var decoded = Utilities.base64Decode(json.comprobanteBase64);
          var blob = Utilities.newBlob(decoded, json.comprobanteMimeType, "comprobante_" + json.id);
          var file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
          comprobanteUrl = file.getUrl();
        } catch (err) {
          comprobanteUrl = "Error Drive: " + err.toString();
        }
      }
      var tel = json.telefono ? json.telefono.toString() : "";
      if (tel.indexOf("+") === 0 || tel.indexOf("=") === 0) {
        tel = "'" + tel;
      }
      sheet.appendRow([
        json.fecha, json.hora, json.id, json.nombre, json.direccion,
        tel, json.productos, json.metodoPago, comprobanteUrl,
        json.total, json.estado
      ]);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (json.action === "update_status") {
      var data = sheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < data.length; i++) {
        if (data[i][2] && data[i][2].toString().trim() === json.id.toString().trim()) {
          sheet.getRange(i + 1, 11).setValue(json.estado);
          found = true;
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: found }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (json.action === "delete_order") {
      var data = sheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < data.length; i++) {
        if (data[i][2] && data[i][2].toString().trim() === json.id.toString().trim()) {
          sheet.deleteRow(i + 1);
          found = true;
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: found }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (json.action === "sync_all_orders") {
      if (sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
      if (json.orders && json.orders.length > 0) {
        for (var k = 0; k < json.orders.length; k++) {
          var o = json.orders[k];
          var tel = o.telefono ? o.telefono.toString() : "";
          if (tel.indexOf("+") === 0 || tel.indexOf("=") === 0) {
            tel = "'" + tel;
          }
          sheet.appendRow([
            o.fecha, o.hora, o.id, o.nombre, o.direccion,
            tel, o.productos, o.metodoPago, o.comprobante || "N/A",
            o.total, o.estado
          ]);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`);
                            alert('¡Código copiado al portapapeles!');
                          }}
                          className="text-[10px] bg-[#2E8B57] text-white font-bold px-2.5 py-1 rounded hover:bg-emerald-700"
                        >
                          Copiar Código
                        </button>
                      </div>
                      <pre className="p-4 text-[9px] font-mono text-slate-400 dark:text-slate-500 overflow-x-auto max-h-56 bg-slate-900">
{`function doPost(e) {
  try {
    var json = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha", "Hora", "ID Pedido", "Nombre Cliente", "Dirección", 
        "Teléfono", "Productos Seleccionados", "Método de Pago", 
        "Enlace Comprobante", "Total (Lps)", "Estado"
      ]);
    }

    if (json.action === "append_order") {
      // ... (registra nuevos pedidos y archivos)
    }

    if (json.action === "update_status") {
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][2] && data[i][2].toString().trim() === json.id.toString().trim()) {
          sheet.getRange(i + 1, 11).setValue(json.estado);
          break;
        }
      }
    }

    if (json.action === "delete_order") {
      // ... (elimina pedidos de la hoja)
    }

    if (json.action === "sync_all_orders") {
      // ... (resincroniza todos los pedidos)
    }
  } catch(e) {
    // ...
  }
} `}
                      </pre>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ----------------------------------------------------------------------------- */}
      {/* CHECKOUT SUMMARY & ORDERING FORM DRAWER */}
      {/* ----------------------------------------------------------------------------- */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between border-l border-amber-900/10 dark:border-slate-800 animate-slide-left">
            
            <div>
              {/* Drawer Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-[#2E8B57]" />
                  <h3 className="font-serif font-extrabold text-xl text-slate-900 dark:text-white">Tu Pedido de Lácteos</h3>
                </div>
                <button 
                  onClick={() => { setCheckoutOpen(false); setCheckoutStep('form'); }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {checkoutStep === 'form' ? (
                <div className="py-4 space-y-6">
                  
                  {/* Selected items summary */}
                  <div className="space-y-3">
                    <p className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Productos en el Carrito</p>
                    
                    {cart.length === 0 && manualBlocks.length === 0 ? (
                      <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-400 font-bold">Aún no has agregado productos.</p>
                        <p className="text-[10px] text-slate-400 mt-1">Selecciona productos del catálogo o agrégalos abajo.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto pr-1">
                        {cart.map((item, idx) => {
                          const price = item.size === 'Libra' ? item.product.precioLibra : (item.product.precioMedia || 0);
                          return (
                            <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-bold gap-3">
                              <div className="flex items-center gap-2.5">
                                <img src={item.product.imagen} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                <div>
                                  <span className="text-slate-900 dark:text-white block">{item.product.nombre}</span>
                                  <span className="text-[10px] text-slate-400 uppercase">{item.size === 'Libra' ? 'Libra' : '1/2 Libra'}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => updateCartQty(item.product.id, item.size, item.quantity - 1)}
                                    className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center font-bold"
                                  >
                                    <Minus size={10} />
                                  </button>
                                  <span>{item.quantity}</span>
                                  <button 
                                    onClick={() => updateCartQty(item.product.id, item.size, item.quantity + 1)}
                                    className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center font-bold"
                                  >
                                    <Plus size={10} />
                                  </button>
                                </div>
                                <span className="text-right w-16 text-[#8B5A2B] dark:text-amber-400">
                                  L {(price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* CUSTOM DYNAMIC PRODUCT BLOCKS FORM (Adding from drawer) */}
                  <div className="bg-[#FAF6EE]/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-amber-900/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-xs uppercase font-extrabold tracking-wider text-slate-400">¿Deseas agregar más variedad?</p>
                      <button 
                        type="button"
                        onClick={addManualBlock}
                        className="text-[10px] bg-[#2E8B57] text-white px-2.5 py-1 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-1 transition-colors shadow-sm"
                      >
                        ➕ Agregar otro producto
                      </button>
                    </div>

                    {manualBlocks.length > 0 && (
                      <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                        {manualBlocks.map((block, idx) => {
                          const prod = products.find(p => p.id === block.productId);
                          return (
                            <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-sm relative">
                              <select 
                                value={block.productId}
                                onChange={e => updateManualBlock(idx, { productId: e.target.value })}
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg p-1.5 text-xs font-bold outline-none flex-1"
                              >
                                {products.filter(p => p.activo).map(p => (
                                  <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                              </select>

                              <select 
                                value={block.size}
                                onChange={e => updateManualBlock(idx, { size: e.target.value as any })}
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg p-1.5 text-xs font-bold outline-none w-20"
                              >
                                <option value="Libra">LB</option>
                                {prod?.precioMedia && <option value="Media">1/2 LB</option>}
                              </select>

                              <input 
                                type="number" 
                                min={1}
                                value={block.quantity}
                                onChange={e => updateManualBlock(idx, { quantity: parseInt(e.target.value) || 1 })}
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg p-1.5 text-xs font-bold text-center w-12 outline-none"
                              />

                              <button 
                                type="button"
                                onClick={() => removeManualBlock(idx)}
                                className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* PERSONAL DETAILS FORM */}
                  <form onSubmit={submitOrder} className="space-y-4">
                    <p className="text-xs uppercase font-extrabold tracking-wider text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">Datos personales de Envío</p>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Nombre Completo</label>
                      <input 
                        type="text" 
                        value={newOrder.nombre}
                        onChange={e => setNewOrder(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Escribe tu nombre"
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold focus:border-[#2E8B57] outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Dirección Exacta</label>
                      <textarea 
                        value={newOrder.direccion}
                        onChange={e => setNewOrder(prev => ({ ...prev, direccion: e.target.value }))}
                        placeholder="Barrio, colonia, calle, número de casa..."
                        rows={2}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold focus:border-[#2E8B57] outline-none resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Teléfono Móvil</label>
                      <input 
                        type="tel" 
                        value={newOrder.telefono}
                        onChange={e => setNewOrder(prev => ({ ...prev, telefono: e.target.value }))}
                        placeholder="+504 9999-9999"
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold focus:border-[#2E8B57] outline-none"
                        required
                      />
                    </div>

                    {/* METHOD OF PAYMENT RADIOS */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-400">Método de Pago</label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={`p-3.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${newOrder.metodoPago === 'Efectivo' ? 'bg-[#2E8B57]/10 border-[#2E8B57] text-[#2E8B57]' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                          <input 
                            type="radio" 
                            name="metodoPago" 
                            checked={newOrder.metodoPago === 'Efectivo'} 
                            onChange={() => setNewOrder(p => ({ ...p, metodoPago: 'Efectivo' }))}
                            className="accent-[#2E8B57] hidden"
                          />
                          <DollarSign size={16} />
                          <span className="text-xs font-bold">Efectivo al Recibir</span>
                        </label>

                        <label className={`p-3.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${newOrder.metodoPago === 'Transferencia' ? 'bg-[#0B5ED7]/10 border-[#0B5ED7] text-[#0B5ED7]' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                          <input 
                            type="radio" 
                            name="metodoPago" 
                            checked={newOrder.metodoPago === 'Transferencia'} 
                            onChange={() => setNewOrder(p => ({ ...p, metodoPago: 'Transferencia' }))}
                            className="accent-[#0B5ED7] hidden"
                          />
                          <CreditCard size={16} />
                          <span className="text-xs font-bold">Transferencia BAC</span>
                        </label>
                      </div>
                    </div>

                    {/* BANK DETAILS FOR TRANSFER METHOD */}
                    {newOrder.metodoPago === 'Transferencia' && (
                      <div className="space-y-3">
                        
                        {/* BAC Honduras Bank Card details */}
                        <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white p-4 rounded-2xl shadow-md space-y-3 relative overflow-hidden">
                          <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider font-bold opacity-60">Banco Beneficiario</span>
                              <p className="text-xs font-bold">BAC Credomatic Honduras</p>
                            </div>
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-extrabold uppercase tracking-widest">HN</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-bold opacity-60">Número de Cuenta</span>
                            <p className="text-sm font-mono font-bold tracking-widest">757074211</p>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-bold opacity-60">Nombre del Titular</span>
                            <p className="text-xs font-bold">MIGUEL ANGEL CRUZ ZUNIGA</p>
                          </div>
                        </div>

                        {/* DRAG AND DROP FILE UPLOADER */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Subir Comprobante de Transferencia</label>
                          <div 
                            onDragOver={handleDragOver}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all relative ${
                              newOrder.comprobanteUrl ? 'border-emerald-500 bg-emerald-500/5' : 
                              isDragging ? 'border-blue-500 bg-blue-500/10' : 
                              'border-slate-300 dark:border-slate-700 hover:border-blue-500'
                            }`}
                          >
                            <input 
                              type="file" 
                              id="screenshot-upload" 
                              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                              accept=".png, .jpg, .jpeg, .pdf"
                              className="hidden"
                            />
                            
                            {uploadingFile ? (
                              <div className="space-y-1">
                                <RefreshCw className="animate-spin text-blue-500 mx-auto" size={24} />
                                <p className="text-[11px] text-slate-400 font-bold">Procesando comprobante...</p>
                              </div>
                            ) : newOrder.comprobanteUrl ? (
                              <div className="space-y-1">
                                <CheckCircle className="text-emerald-500 mx-auto" size={24} />
                                <p className="text-xs text-emerald-600 font-bold">¡Comprobante cargado con éxito!</p>
                                <p className="text-[9px] text-slate-400">Puedes cambiarlo arrastrando otro archivo.</p>
                              </div>
                            ) : (
                              <label htmlFor="screenshot-upload" className="cursor-pointer space-y-1 block">
                                <UploadCloud className="text-slate-400 mx-auto" size={24} />
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Haz clic para buscar o arrastra aquí tu archivo</p>
                                <p className="text-[10px] text-slate-400">Formatos aceptados: PNG, JPG, PDF</p>
                              </label>
                            )}

                            {uploadError && (
                              <p className="text-[10px] text-red-500 font-bold mt-2">{uploadError}</p>
                            )}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Total & Submit */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-500">Total del Pedido:</span>
                        <span className="text-xl font-extrabold text-[#8B5A2B] dark:text-amber-400">
                          L {calculateCartTotal().toFixed(2)}
                        </span>
                      </div>

                      {newOrder.metodoPago === 'Transferencia' && !newOrder.comprobanteUrl && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 p-2.5 rounded-lg text-center animate-pulse">
                          ⚠️ Debes subir el comprobante de transferencia antes de confirmar.
                        </p>
                      )}

                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#2E8B57] hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-lg transition-transform active:scale-95 cursor-pointer flex justify-center items-center"
                      >
                        {loading ? 'Procesando tu pedido...' : '🛒 Confirmar Pedido Lácteo'}
                      </button>
                    </div>

                  </form>
                </div>
              ) : (
                
                // ORDER PLACED SUCCESSFULLY SCREEN
                <div className="py-8 text-center space-y-6">
                  <div className="bg-emerald-500/10 text-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner border-2 border-emerald-500/20">
                    <CheckCircle size={32} />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-serif font-extrabold text-2xl text-slate-900 dark:text-white">¡Muchas Gracias por su Compra!</h4>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      Tu pedido ha sido registrado correctamente y guardado de forma privada en el sistema.
                    </p>
                  </div>

                  {lastPlacedOrder && (
                    <div className="bg-[#FAF6EE] dark:bg-slate-800/40 p-4 rounded-2xl border border-amber-900/5 text-left max-w-sm mx-auto space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-400">ID de Pedido:</span>
                        <span className="font-mono font-bold text-blue-600">{lastPlacedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-400">Fecha / Hora:</span>
                        <span className="font-bold">{lastPlacedOrder.fecha} {lastPlacedOrder.hora}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-400">Cliente:</span>
                        <span className="font-bold">{lastPlacedOrder.nombre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-400">Pago por:</span>
                        <span className="font-bold">{lastPlacedOrder.metodoPago}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/50 dark:border-slate-700 pt-2 font-bold text-sm">
                        <span>Total:</span>
                        <span className="text-[#8B5A2B] dark:text-amber-400">L {lastPlacedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Send WhatsApp message for faster confirmation */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 max-w-sm mx-auto">
                    <p className="text-xs text-slate-400">
                      Envía un WhatsApp para acelerar la preparación de tu pedido:
                    </p>
                    <button 
                      onClick={() => lastPlacedOrder && openWhatsAppOrder(lastPlacedOrder)}
                      className="w-full bg-[#2E8B57] hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 text-xs uppercase"
                    >
                      <Phone size={16} /> Enviar Comprobante por WhatsApp
                    </button>
                    
                    <button 
                      onClick={() => { setCheckoutOpen(false); setCheckoutStep('form'); }}
                      className="text-xs font-bold text-slate-400 hover:text-slate-800"
                    >
                      Volver al Catálogo
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ------------------ FOOTER ------------------ */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <span className="font-serif font-extrabold text-lg text-white block">{settings.storeName || "Lácteos Golden"}</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              La marca preferida de productos lácteos frescos de Honduras. Confeccionados con los métodos higiénicos tradicionales de nuestra finca campestre.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Contacto Directo</h4>
            <ul className="text-xs space-y-2">
              <li className="flex items-center gap-1.5"><Phone size={14} className="text-[#FFD54F]" /> +504 8926 1628</li>
              <li className="flex items-center gap-1.5"><MapPin size={14} className="text-[#FFD54F]" /> Gracias A Dios, Comayaguela, Francisco Morazán</li>
              <li className="flex items-center gap-1.5"><Clock size={14} className="text-[#FFD54F]" /> Horarios: Lun - Sáb: 7:00 AM - 6:00 PM</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Nuestra Ubicación</h4>
            <div className="rounded-xl overflow-hidden h-24 bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-center p-4">
              📍 Gracias A Dios, Comayaguela, Francisco Morazán. Distribución rápida y local.
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Derechos Reservados</h4>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} {settings.storeName || "Lácteos Golden"}. Todos los derechos reservados. <br />
              Hecho con amor campesino ❤️
            </p>
          </div>

        </div>
      </footer>

      {/* ------------------ FLOATING WHATSAPP ------------------ */}
      <a 
        href="https://wa.me/50489261628?text=Hola,%20quiero%20realizar%20un%20pedido%20de%20productos%20lácteos%20artesanales."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-[#2E8B57] hover:bg-emerald-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 z-40 border-2 border-white"
        title="Contáctanos por WhatsApp"
      >
        <Phone size={24} />
      </a>

      {/* ----------------------------------------------------------------------------- */}
      {/* MODAL: EDIT/ADD PRODUCT FORM */}
      {/* ----------------------------------------------------------------------------- */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[90vh]">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-serif font-extrabold text-xl text-slate-900 dark:text-white">
                {editingProduct.id ? 'Editar Producto del Catálogo' : 'Agregar Nuevo Lácteo'}
              </h3>
              <button 
                onClick={() => { setProductModalOpen(false); setEditingProduct(null); }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre del Lácteo</label>
                <input 
                  type="text" 
                  value={editingProduct.nombre}
                  onChange={e => setEditingProduct(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                  placeholder="ej. Queso Especial"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descripción Corta</label>
                <textarea 
                  value={editingProduct.descripcion}
                  onChange={e => setEditingProduct(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                  placeholder="ej. Queso artesanal suave con sabor natural de la finca."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Precio por Libra (Lps)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editingProduct.precioLibra || ''}
                    onChange={e => setEditingProduct(prev => ({ ...prev, precioLibra: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Precio por Media Libra (Opcional)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editingProduct.precioMedia || ''}
                    onChange={e => setEditingProduct(prev => ({ ...prev, precioMedia: parseFloat(e.target.value) || null }))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                    placeholder="Ninguno"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Imagen del Producto (URL / Subir / IA)</label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={editingProduct.imagen}
                      onChange={e => setEditingProduct(prev => ({ ...prev, imagen: e.target.value }))}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs focus:outline-none flex-1"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={handleGenerateAIImage}
                      disabled={generatingAIImage}
                      className="flex-1 bg-[#2E8B57] hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[10px] py-2 rounded-xl uppercase whitespace-nowrap transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      {generatingAIImage ? 'Generando...' : '🎨 Generar con IA'}
                    </button>
                    <label className="flex-1 bg-[#8B5A2B] hover:bg-[#724a23] text-white font-bold text-[10px] py-2 rounded-xl uppercase whitespace-nowrap transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer text-center">
                      <span>📤 Subir Imagen</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleProductImageUpload}
                        disabled={uploadingProductImage}
                      />
                    </label>
                  </div>
                </div>
                {uploadingProductImage && (
                  <p className="text-[10px] text-blue-500 font-bold mt-1 animate-pulse">📤 Subiendo y guardando imagen automáticamente...</p>
                )}
                {editingProduct.imagen && (
                  <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    <img 
                      src={editingProduct.imagen} 
                      alt="Vista previa del producto" 
                      className="h-full w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  Ingresa una URL de imagen, haz clic en "Generar con IA" para crear una imagen fotográfica utilizando la inteligencia artificial de Gemini, o haz clic en "Subir Imagen" para cargar una foto desde tu dispositivo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Etiqueta Informativa</label>
                  <input 
                    type="text" 
                    value={editingProduct.etiqueta || ''}
                    onChange={e => setEditingProduct(prev => ({ ...prev, etiqueta: e.target.value }))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                    placeholder="ej. Más Vendido, Oferta, Nuevo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Estado de Exposición</label>
                  <select 
                    value={editingProduct.activo ? 'true' : 'false'}
                    onChange={e => setEditingProduct(prev => ({ ...prev, activo: e.target.value === 'true' }))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                  >
                    <option value="true">Activo / Visible</option>
                    <option value="false">Inactivo / Oculto</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#0B5ED7] hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl uppercase transition-colors text-xs tracking-wider shadow-md mt-4"
              >
                Guardar Cambios de Catálogo
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

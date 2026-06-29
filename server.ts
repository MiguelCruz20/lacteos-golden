import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = 3000; // Fixed port required by container infrastructure

// Permitir peticiones desde GitHub Pages (frontend estático) hacia este backend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// -----------------------------------------------------------------------------
// SUPABASE CLIENT (base de datos + almacenamiento de imágenes permanentes)
// -----------------------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('⚠️  Faltan las variables de entorno SUPABASE_URL y/o SUPABASE_SERVICE_KEY. Configúralas en Render.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const UPLOADS_BUCKET = 'uploads';

// -----------------------------------------------------------------------------
// REST API ROUTES
// -----------------------------------------------------------------------------

// --- SETTINGS ---
app.get('/api/settings', async (req, res) => {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (error || !data) {
    return res.json({
      googleSheetsUrl: '',
      adminUsername: 'admin',
      storeName: 'Lácteos Golden',
      storeSubtitle: 'La Casa del Queso'
    });
  }
  res.json({
    googleSheetsUrl: data.googleSheetsUrl || '',
    adminUsername: data.adminUsername || 'admin',
    storeName: data.storeName || 'Lácteos Golden',
    storeSubtitle: data.storeSubtitle || 'La Casa del Queso'
  });
});

app.post('/api/settings', async (req, res) => {
  const { data: current } = await supabase.from('settings').select('*').eq('id', 1).single();
  const currentSettings = current || { adminPassword: 'admin' };
  const { googleSheetsUrl, adminUsername, adminPassword, currentPassword, newPassword, storeName, storeSubtitle } = req.body;

  const updates: any = {};
  if (adminUsername) updates.adminUsername = adminUsername;
  if (googleSheetsUrl !== undefined) updates.googleSheetsUrl = googleSheetsUrl;
  if (storeName !== undefined) updates.storeName = storeName;
  if (storeSubtitle !== undefined) updates.storeSubtitle = storeSubtitle;

  if (currentPassword && newPassword) {
    if (currentPassword !== currentSettings.adminPassword) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }
    updates.adminPassword = newPassword;
  } else if (adminPassword) {
    updates.adminPassword = adminPassword;
  }

  const { error } = await supabase.from('settings').update(updates).eq('id', 1);
  if (error) {
    console.error('Error guardando settings:', error);
    return res.status(500).json({ error: 'No se pudo guardar la configuración' });
  }
  res.json({ success: true, message: 'Configuraciones guardadas con éxito' });
});

// Admin login verification route
app.post('/api/admin/login', async (req, res) => {
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();
  const { username, password } = req.body;

  if (settings && username === settings.adminUsername && password === settings.adminPassword) {
    res.json({ success: true, token: 'session_token_lacteos_premium_2026' });
  } else {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*').order('orden', { ascending: true });
  if (error) {
    console.error('Error leyendo productos:', error);
    return res.status(500).json({ error: 'No se pudieron cargar los productos' });
  }
  res.json(data || []);
});

app.post('/api/products', async (req, res) => {
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const newProduct = {
    id: 'prod-' + Date.now(),
    nombre: req.body.nombre || 'Nuevo Producto',
    descripcion: req.body.descripcion || '',
    precioLibra: parseFloat(req.body.precioLibra) || 0,
    precioMedia: req.body.precioMedia ? parseFloat(req.body.precioMedia) : null,
    imagen: req.body.imagen || 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&auto=format&fit=crop&q=80',
    activo: req.body.activo !== false,
    etiqueta: req.body.etiqueta || '',
    orden: count || 0
  };

  const { error } = await supabase.from('products').insert(newProduct);
  if (error) {
    console.error('Error creando producto:', error);
    return res.status(500).json({ error: 'No se pudo crear el producto' });
  }
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', async (req, res) => {
  const { data: existing } = await supabase.from('products').select('*').eq('id', req.params.id).single();
  if (!existing) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const updated = {
    nombre: req.body.nombre ?? existing.nombre,
    descripcion: req.body.descripcion ?? existing.descripcion,
    precioLibra: req.body.precioLibra !== undefined ? parseFloat(req.body.precioLibra) : existing.precioLibra,
    precioMedia: req.body.precioMedia !== undefined ? (req.body.precioMedia ? parseFloat(req.body.precioMedia) : null) : existing.precioMedia,
    imagen: req.body.imagen ?? existing.imagen,
    activo: req.body.activo ?? existing.activo,
    etiqueta: req.body.etiqueta ?? existing.etiqueta,
    orden: req.body.orden ?? existing.orden
  };

  const { error } = await supabase.from('products').update(updated).eq('id', req.params.id);
  if (error) {
    console.error('Error actualizando producto:', error);
    return res.status(500).json({ error: 'No se pudo actualizar el producto' });
  }
  res.json({ ...existing, ...updated });
});

app.delete('/api/products/:id', async (req, res) => {
  const { error } = await supabase.from('products').delete().eq('id', req.params.id);
  if (error) {
    console.error('Error eliminando producto:', error);
    return res.status(500).json({ error: 'No se pudo eliminar el producto' });
  }
  res.json({ success: true, message: 'Producto eliminado' });
});

app.post('/api/products/reorder', async (req, res) => {
  const { orderedIds } = req.body;
  if (!orderedIds || !Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds inválido' });
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from('products').update({ orden: i }).eq('id', orderedIds[i]);
  }

  res.json({ success: true });
});

// --- ORDERS ---
app.get('/api/orders', async (req, res) => {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error leyendo pedidos:', error);
    return res.status(500).json({ error: 'No se pudieron cargar los pedidos' });
  }
  res.json(data || []);
});

app.post('/api/orders', async (req, res) => {
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-HN', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');
  const timeStr = now.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', hour12: false });

  const orderId = 'PED-' + Math.floor(1000 + Math.random() * 9000);
  const newOrder = {
    id: orderId,
    fecha: dateStr,
    hora: timeStr,
    nombre: req.body.nombre || '',
    direccion: req.body.direccion || '',
    telefono: req.body.telefono || '',
    productos: req.body.productos || [],
    metodoPago: req.body.metodoPago || 'Efectivo',
    comprobante: req.body.comprobante || null,
    total: req.body.total || 0,
    estado: 'Pendiente'
  };

  const { error } = await supabase.from('orders').insert(newOrder);
  if (error) {
    console.error('Error creando pedido:', error);
    return res.status(500).json({ error: 'No se pudo crear el pedido' });
  }

  if (settings?.googleSheetsUrl) {
    const formattedProducts = newOrder.productos
      .map((p: any) => `${p.nombre} (${p.cantidad} ${p.presentacion})`)
      .join(', ');

    const payload = {
      action: 'append_order',
      fecha: newOrder.fecha,
      hora: newOrder.hora,
      id: newOrder.id,
      nombre: newOrder.nombre,
      direccion: newOrder.direccion,
      telefono: newOrder.telefono,
      productos: formattedProducts,
      metodoPago: newOrder.metodoPago,
      comprobante: newOrder.comprobante || 'N/A',
      total: `L ${newOrder.total.toFixed(2)}`,
      estado: newOrder.estado,
      comprobanteBase64: req.body.comprobanteBase64 || null,
      comprobanteMimeType: req.body.comprobanteMimeType || null
    };

    try {
      fetch(settings.googleSheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch((err) => console.error('Google Sheets fetch network error:', err));
    } catch (err) {
      console.error('Google Sheets Sync invocation error:', err);
    }
  }

  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', async (req, res) => {
  const { data: existing } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
  if (!existing) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  const nuevoEstado = req.body.estado || existing.estado;
  const { error } = await supabase.from('orders').update({ estado: nuevoEstado }).eq('id', req.params.id);
  if (error) {
    console.error('Error actualizando pedido:', error);
    return res.status(500).json({ error: 'No se pudo actualizar el pedido' });
  }

  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (settings?.googleSheetsUrl) {
    fetch(settings.googleSheetsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', id: req.params.id, estado: nuevoEstado })
    }).catch((e) => console.error('Error updating status in Google Sheets:', e));
  }

  res.json({ ...existing, estado: nuevoEstado });
});

app.delete('/api/orders/:id', async (req, res) => {
  const { error } = await supabase.from('orders').delete().eq('id', req.params.id);
  if (error) {
    console.error('Error eliminando pedido:', error);
    return res.status(500).json({ error: 'No se pudo eliminar el pedido' });
  }

  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (settings?.googleSheetsUrl) {
    fetch(settings.googleSheetsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_order', id: req.params.id })
    }).catch((e) => console.error('Error deleting order in Google Sheets:', e));
  }

  res.json({ success: true, message: 'Pedido eliminado' });
});

app.post('/api/admin/sync-all', async (req, res) => {
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (!settings?.googleSheetsUrl) {
    return res.status(400).json({ error: 'Google Sheets URL no configurada' });
  }

  const { data: orders } = await supabase.from('orders').select('*');

  fetch(settings.googleSheetsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'sync_all_orders',
      orders: (orders || []).map((o: any) => ({
        fecha: o.fecha,
        hora: o.hora,
        id: o.id,
        nombre: o.nombre,
        direccion: o.direccion,
        telefono: o.telefono,
        productos: o.productos.map((p: any) => `${p.nombre} (${p.cantidad} ${p.presentacion})`).join(', '),
        metodoPago: o.metodoPago,
        comprobante: o.comprobante || 'N/A',
        total: `L ${o.total.toFixed(2)}`,
        estado: o.estado
      }))
    })
  })
  .then(() => res.json({ success: true }))
  .catch((err) => {
    console.error('Error syncing all:', err);
    res.status(500).json({ error: 'Error de red con Google Sheets script' });
  });
});

// --- IMAGE UPLOAD (a Supabase Storage, permanente) ---
app.post('/api/upload', async (req, res) => {
  const { base64Data, filename, prefix } = req.body;
  if (!base64Data) {
    return res.status(400).json({ error: 'Sin archivo cargado' });
  }

  try {
    const mimeMatch = base64Data.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const filePrefix = prefix || 'comprobante';
    const safeFilename = `${filePrefix}_${Date.now()}_${(filename || 'imagen').replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { error } = await supabase.storage.from(UPLOADS_BUCKET).upload(safeFilename, buffer, {
      contentType: mimeType,
      upsert: true
    });

    if (error) {
      console.error('Error al subir imagen a Supabase Storage:', error);
      return res.status(500).json({ error: 'No se pudo guardar la imagen' });
    }

    const { data: publicUrlData } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(safeFilename);
    res.json({ success: true, url: publicUrlData.publicUrl });
  } catch (err) {
    console.error('Error al guardar imagen de comprobante:', err);
    res.status(500).json({ error: 'No se pudo guardar la imagen' });
  }
});

// --- GEMINI IMAGE GENERATION ---
app.post('/api/generate-image', async (req, res) => {
  const { productName, prompt } = req.body;
  if (!productName) {
    return res.status(400).json({ error: 'Se requiere el nombre del producto' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  const getFallbackUrl = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('queso') && lowercaseName.includes('chile')) {
      return 'https://images.unsplash.com/photo-1596450514735-2d002f0dc346?w=600&auto=format&fit=crop&q=80';
    }
    if (lowercaseName.includes('queso') && lowercaseName.includes('frijolero')) {
      return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80';
    }
    if (lowercaseName.includes('queso')) {
      return 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&auto=format&fit=crop&q=80';
    }
    if (lowercaseName.includes('mantequilla') && lowercaseName.includes('crema')) {
      return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80';
    }
    if (lowercaseName.includes('mantequilla')) {
      return 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80';
    }
    if (lowercaseName.includes('quesillo')) {
      return 'https://images.unsplash.com/photo-1528256846576-13a9657f6946?w=600&auto=format&fit=crop&q=80';
    }
    if (lowercaseName.includes('cuajada')) {
      return 'https://images.unsplash.com/photo-1552763426-3812852a44a6?w=600&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&auto=format&fit=crop&q=80';
  };

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    console.log('Gemini API key not configured, falling back to Unsplash.');
    return res.json({ success: true, url: getFallbackUrl(productName) });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const userPrompt = prompt || `A professional commercial food photograph of high-end traditional dairy product "${productName}" from a premium farm, placed on a beautiful dark rustic wooden table, soft natural warm light, decorated with green leaves and milk drops, high-resolution catalog photo style.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: userPrompt }] },
      config: { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } }
    });

    let base64ImageBytes: string | null = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          base64ImageBytes = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64ImageBytes) {
      console.warn('No inline image data returned by Gemini, falling back to Unsplash.');
      return res.json({ success: true, url: getFallbackUrl(productName) });
    }

    const safeFilename = `generated_${Date.now()}_${productName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    const buffer = Buffer.from(base64ImageBytes, 'base64');

    const { error } = await supabase.storage.from(UPLOADS_BUCKET).upload(`products/${safeFilename}`, buffer, {
      contentType: 'image/png',
      upsert: true
    });

    if (error) {
      console.error('Error subiendo imagen generada a Supabase Storage:', error);
      return res.json({ success: true, url: getFallbackUrl(productName) });
    }

    const { data: publicUrlData } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(`products/${safeFilename}`);
    res.json({ success: true, url: publicUrlData.publicUrl });

  } catch (err) {
    console.error('Gemini image generation failed:', err);
    res.json({ success: true, url: getFallbackUrl(productName) });
  }
});

// -----------------------------------------------------------------------------
// VITE CLIENT DEV SERVER INTEGRATION & STATIC SERVER
// -----------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('./dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('./dist/index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Se Vende Lácteos] Server running at http://localhost:${PORT}/`);
  });
}

startServer();

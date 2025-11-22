# 🚀 Guía Completa: Subir Proyecto Full-Stack a Render

## ✅ **VIABILIDAD: 100% COMPATIBLE**

Tu proyecto **Paulina Cultiva** es **perfectamente compatible** con Render. Todo funciona:
- ✅ Backend Node.js + Express + Socket.IO
- ✅ Frontend React + Vite + Material-UI
- ✅ Base de Datos MySQL
- ✅ Notificaciones en tiempo real
- ✅ Sistema de autenticación
- ✅ Upload de archivos con Multer

---

## 📋 **REQUISITOS PREVIOS**

### 1. **Organizar Repositorio**
```
TU_REPO/
├── api/
│   ├── index.js
│   ├── package.json
│   ├── .env
│   └── ...
├── client/
│   ├── src/
│   ├── package.json
│   └── ...
└── render.yaml  ← Nuevo archivo
```

### 2. **Crear Cuenta Render**
- Regístrate en [render.com](https://render.com)
- Conecta tu cuenta de GitHub/GitLab

---

## 🛠️ **CONFIGURACIONES NECESARIAS**

### **A. Backend (api/)**
```javascript
// api/package.json - Cambiar el script de start
{
  "scripts": {
    "start": "node index.js",  // Quitar --watch para producción
    "dev": "node --watch index.js"
  }
}
```

### **B. Frontend (client/)**
```javascript
// client/vite.config.js - Configurar producción
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5179
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    global: 'globalThis'
  }
})
```

### **C. Variables de Entorno**
```env
# api/.env.production
NODE_ENV=production
PORT=3000
CLIENT_URL=https://paulina-frontend.onrender.com
DB_NAME=tu_db_name
DB_USER=tu_db_user
DB_PASS=tu_db_pass
DB_HOST=tu_mysql_host
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
```

---

## 🚀 **PASO 1: CONFIGURACIÓN DE RENDER.yaml**

Crea el archivo `render.yaml` en la raíz:

```yaml
services:
  # 1. BASE DE DATOS MYSQL
  - type: pserv
    name: mysql-paulina-cultiva
    env: docker
    plan: free
    region: oregon
    repo: https://github.com/render-examples/mysql.git
    envVars:
      - key: MYSQL_DATABASE
        value: paulinacultiva
      - key: MYSQL_USER
        value: paulina_user
      - key: MYSQL_PASSWORD
        generateValue: true
      - key: MYSQL_ROOT_PASSWORD
        generateValue: true

  # 2. BACKEND API
  - type: web
    name: paulina-cultiva-api
    env: node
    plan: free
    region: oregon
    repo: https://github.com/TU_USERNAME/TU_REPO_NAME.git
    rootDir: api
    buildCommand: npm install
    startCommand: node index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: DB_NAME
        value: paulinacultiva
      - key: DB_USER
        sync: false
      - key: DB_PASS
        sync: false
      - key: DB_HOST
        sync: false
      - key: CLIENT_URL
        sync: false
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASS
        sync: false

  # 3. FRONTEND REACT
  - type: web
    name: paulina-cultiva-frontend
    env: static
    plan: free
    region: oregon
    repo: https://github.com/TU_USERNAME/TU_REPO_NAME.git
    rootDir: client
    buildCommand: npm install && npm run build
    publishDir: dist
    envVars:
      - key: VITE_API_URL
        value: https://paulina-cultiva-api.onrender.com
    routes:
      - type: rewrite
        source: /*
        destination: /index.html

# 4. REDIRECCIÓN PERSONALIZADA (OPCIONAL)
webServices:
  - type: web
    name: paulina-cultiva-app
    env: static
    plan: free
    region: oregon
    repo: https://github.com/TU_USERNAME/TU_REPO_NAME.git
    rootDir: client
    buildCommand: npm install && npm run build
    publishDir: dist
    domains:
      - paulina-cultiva.onrender.com
    envVars:
      - key: VITE_API_URL
        value: https://paulina-cultiva-api.onrender.com
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

---

## 🔧 **PASO 2: MODIFICACIONES DE CÓDIGO**

### **A. Backend - Corregir CORS y URLs**
```javascript
// api/index.js - Actualizar CORS para producción
server.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5179',
    process.env.CLIENT_URL  // ← Agregar variable de entorno
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
```

### **B. Frontend - URLs Dinámicas**
```javascript
// client/src/api/axios.js - Configurar API base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// client/src/hooks/useSocket.js - URLs dinámicas
const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
socketRef.current = io(serverUrl, {
  transports: ['websocket']
});
```

---

## 🗄️ **PASO 3: MIGRACIÓN DE BASE DE DATOS**

### **Opción A: Usar Render MySQL (Recomendado)**
1. Crea el servicio MySQL en Render
2. Copia las credenciales generadas
3. Configura las variables de entorno en el backend

### **Opción B: Usar Externo (PlanetScale, Railway)**
```env
DB_HOST=your-host.mysql.planetscale.com
DB_NAME=paulinacultiva
DB_USER=tu_usuario
DB_PASS=tu_contraseña
```

### **Opción C: SQLite (Gratis y más simple)**
```javascript
// api/config/db.js - Cambiar a SQLite para producción
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});
```

---

## 🚀 **PASO 4: DESPLIEGUE**

### **1. Subir a GitHub**
```bash
git init
git add .
git commit -m "Listo para despliegue a Render"
git remote add origin https://github.com/TU_USERNAME/TU_REPO_NAME.git
git push -u origin main
```

### **2. Crear Blueprints en Render**
1. Ve a Render Dashboard
2. "New" → "Blueprint"
3. Conecta tu repositorio
4. Render detectará `render.yaml` automáticamente
5. "Create Blueprint"

### **3. Configurar Variables de Entorno**
En el dashboard de Render:
- Ve a cada servicio → "Environment"
- Configura todas las variables sincronizadas
- Configura la URL del CLIENT_URL

---

## 🔄 **PASO 5: VERIFICACIÓN**

### **Backend Health Check**
```bash
# Tu API debería responder en:
https://paulina-cultiva-api.onrender.com/me
https://paulina-cultiva-api.onrender.com/recipes
```

### **Frontend**
```bash
# Tu app debería funcionar en:
https://paulina-cultiva-frontend.onrender.com
```

### **Pruebas Funcionales**
- [ ] Registro y login funcionan
- [ ] Crear y ver recetas
- [ ] Sistema de notificaciones en tiempo real
- [ ] Upload de imágenes
- [ ] Sistema de amistad

---

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES**

### **1. Socket.IO en Producción**
```javascript
// api/index.js - Asegurar que HTTP funcione con Socket.IO
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### **2. Base de Datos no Conecta**
```javascript
// api/config/db.js - Timeout extendido
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: console.log,  // Activar logs para debug
  dialectOptions: {
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000
  }
});
```

### **3. Archivos Estáticos No Cargan**
```javascript
// api/index.js - Path absoluto para uploads
const path = require('path');
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

---

## 💰 **COSTOS EN RENDER**

### **Plan Gratuito (Free Tier)**
- ✅ **MySQL**: 90 días sleep luego de 15 min inactividad
- ✅ **Backend**: 750 horas/mes (~24 días continuos)
- ✅ **Frontend**: Siempre activo (Static Site)
- ✅ **Dominio Render**: `tu-app.onrender.com`

### **Recomendación para Producción**
- **Starter Plan**: $7/més para MySQL activo 24/7
- **Web Services**: $7/més para backend sin sleep
- **Total**: ~$14-21/més para producción completa

---

## 🎯 **RESULTADO FINAL**

Una vez completado, tendrás:

🌐 **Frontend**: `https://paulina-cultiva.onrender.com`
🔧 **Backend**: `https://paulina-cultiva-api.onrender.com`
🗄️ **Base de Datos**: MySQL en Render

**Todo funcionando exactamente como en local, pero disponible mundialmente!** 🎉

¿Listo para empezar? ¡Te puedo ayudar con cada paso! 🚀
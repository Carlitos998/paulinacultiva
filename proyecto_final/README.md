# Proyecto Unificado

Este proyecto combina el backend desarrollado por Toby con el frontend desarrollado por Noa en una sola estructura unificada.

## Estructura del Proyecto

```
proyecto_final/
├── api/           # Backend de Toby (Node.js + Express + MySQL)
├── client/        # Frontend de Noa (React + Vite + Material-UI)
├── package.json   # Configuración para ejecutar ambos servicios
└── README.md      # Este archivo
```

## Configuración

### Backend (api/)
- **Puerto**: 3000
- **Tecnologías**: Node.js, Express, Sequelize, MySQL
- **Dependencias principales**: bcrypt, jsonwebtoken, mysql2, resend

### Frontend (client/)
- **Puerto**: 5179
- **Tecnologías**: React, Vite, Material-UI, React Router
- **Proxy**: Configurado para redirigir `/api` a `http://localhost:3000`

## Instalación

Para instalar todas las dependencias:

```bash
npm run install-all
```

## Ejecución

### Opción 1: Ejecutar ambos servicios simultáneamente
```bash
npm run dev
```

### Opción 2: Ejecutar por separado

Backend:
```bash
npm run dev-api
```

Frontend (en otra terminal):
```bash
npm run dev-client
```

### Opción 3: Solo backend (producción)
```bash
npm start
```

## Acceso

- **Frontend**: http://localhost:5179
- **Backend API**: http://localhost:3000

## Notas importantes

1. El frontend ya está configurado con un proxy en `vite.config.js` que redirige automáticamente las peticiones `/api` al backend
2. Asegúrate de tener MySQL corriendo y configurado correctamente en el backend
3. Las variables de entorno del backend están en `api/.env`
4. El frontend incluye autenticación con JWT y manejo de token automático

## Desarrollo

- El backend se reinicia automáticamente con `--watch` cuando hay cambios
- El frontend se recarga automáticamente en caliente con Vite
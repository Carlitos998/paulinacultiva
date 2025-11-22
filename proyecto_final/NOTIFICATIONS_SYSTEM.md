# Sistema de Notificaciones con Socket.IO

## 📋 Resumen del Sistema

He implementado un sistema completo de notificaciones en tiempo real con las siguientes características:

- **Backend**: Socket.IO para notificaciones en tiempo real
- **Base de datos**: Tabla `notifications` para persistencia con MySQL/Sequelize
- **Frontend**: Cliente Socket.IO para recibir notificaciones instantáneas
- **Integración**: Notificaciones automáticas para likes, comentarios, calificaciones y amistad

## 🏗️ Arquitectura General

### 1. Backend (API)
- **Express.js** con **Socket.IO** configurado
- **Modelo Notification** con persistencia en MySQL
- **Controladores** para gestión de notificaciones
- **Rutas API** para operaciones CRUD
- **Servicio de notificaciones** para fácil integración

### 2. Frontend (React)
- **Hook useSocket** para conexión Socket.IO
- **Hook useNotifications** para gestión de estado
- **Componente NotificationsDropdown** para UI
- **Integración** en el componente principal Home

## 📁 Archivos Creados/Modificados

### Backend
```
api/
├── models/Notification.js                    # Modelo de base de datos
├── controller/notificationController.js     # Lógica de negocio
├── controller/calification.js              # Integrado con notificaciones
├── controller/comment.js                   # Integrado con notificaciones
├── controller/friendship.js                # Integrado con notificaciones
├── routes/notifications.js                 # Rutas API
├── services/notificationService.js         # Servicio para integración fácil
├── test-notifications.js                   # Script de prueba
└── index.js                                # Configuración Socket.IO
```

### Frontend
```
client/src/
├── hooks/useSocket.js                      # Hook para conexión Socket.IO
├── hooks/useNotifications.js               # Hook para gestión de notificaciones
├── components/NotificationsDropdown.jsx   # Componente UI
└── components/Home.jsx                     # Botón de notificaciones integrado
```

## 🔧 Configuración del Servidor

### Socket.IO (index.js:114-152)
```javascript
// Configurar Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5179",
    methods: ["GET", "POST"]
  }
});

// Sistema de salas de usuario
socket.on('join-user-room', (userId) => {
  socket.join(`user-${userId}`);
});

// Eventos en tiempo real
socket.on('like-post', (data) => { /* ... */ });
socket.on('new-comment', (data) => { /* ... */ });
```

## 📊 Modelo de Datos

### Tabla notifications
```sql
CREATE TABLE Notifications (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  userId BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('like', 'comment', 'friend_request', 'friend_accept', 'system', 'favorite', 'rating'),
  isRead BOOLEAN DEFAULT FALSE,
  relatedUserId BIGINT UNSIGNED,
  relatedPostId BIGINT UNSIGNED,
  relatedCommentId BIGINT UNSIGNED,
  dvh INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔌 Eventos de Socket.IO

### Cliente → Servidor
- `join-user-room`: Unirse a sala personal de usuario

### Servidor → Cliente
- `new-notification`: Nueva notificación en tiempo real
- `post-liked`: Notificación de like en post
- `comment-added`: Notificación de comentario en post

## 🛠️ API REST Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notifications` | Obtener notificaciones del usuario |
| GET | `/api/notifications/unread-count` | Contador de no leídas |
| PUT | `/api/notifications/:id/read` | Marcar como leída |
| PUT | `/api/notifications/read-all` | Marcar todas como leídas |
| DELETE | `/api/notifications/:id` | Eliminar notificación |
| DELETE | `/api/notifications/read` | Eliminar leídas |

## 🎯 Tipos de Notificaciones

- `like`: Nuevo like en receta
- `comment`: Nuevo comentario en receta
- `favorite`: Nueva favorito en receta
- `friend_request`: Solicitud de amistad
- `friend_accept`: Amistad aceptada
- `rating`: Nueva calificación en receta
- `system`: Notificaciones del sistema

## 💡 Integración con Controladores

### Calificaciones (calification.js)
```javascript
// Notificación automática al calificar
if (!existing && post && post.autorId !== userId) {
  await NotificationService.notifyUser(
    post.autorId,
    'Nueva calificación en tu receta',
    `Alguien ha calificado tu receta "${post.titulo}" con ${score} estrella${score !== 1 ? 's' : ''}`,
    'rating',
    userId,
    postId
  );
}
```

### Comentarios (comment.js)
```javascript
// Notificación automática al comentar
if (post.autorId !== autorId) {
  await NotificationService.notifyPostComment(
    post.autorId,
    postId,
    comentario.id,
    autorId
  );
}
```

### Amistad (friendship.js)
```javascript
// Notificación de solicitud de amistad
await NotificationService.notifyFriendRequest(friendUser.id, userId);

// Notificación de amistad aceptada
await NotificationService.notifyFriendAccepted(friendship.userId, userId);
```

## 🎨 Componente Frontend

### NotificationsDropdown
- **Badge** con contador de notificaciones no leídas
- **Dropdown** con lista de notificaciones
- **Acciones**: Marcar leída, eliminar
- **Iconos** según tipo de notificación
- **Formato de tiempo** relativo

### Uso en Home.jsx
```jsx
import NotificationsDropdown from './NotificationsDropdown';

// Reemplazar botón existente
<NotificationsDropdown userId={currentUserId} />
```

## 🔄 Flujo Completo

1. **Usuario da like** → API guarda like → Crea notificación → Socket.IO emite → Frontend recibe
2. **Usuario comenta** → API guarda comentario → Crea notificación → Socket.IO emite → Frontend recibe
3. **Usuario solicita amistad** → API guarda solicitud → Crea notificación → Socket.IO emite → Frontend recibe

## 🧪 Pruebas

### Ejecutar script de prueba
```bash
cd proyecto_final/api
node test-notifications.js
```

### Verificar funcionamiento
1. Iniciar backend: `npm start` en carpeta api
2. Iniciar frontend: `npm run dev` en carpeta client
3. Iniciar sesión como usuario
4. Realizar acciones (like, comentario, etc.)
5. Verificar notificaciones en tiempo real

## 🚀 Características Implementadas

✅ **Persistencia**: Base de datos MySQL con Sequelize
✅ **Tiempo Real**: Socket.IO para notificaciones instantáneas
✅ **Tipos Múltiples**: Like, comentario, amistad, sistema
✅ **Gestión Estado**: Leído/no leído, eliminar
✅ **API REST**: Endpoints completos
✅ **UI Reactiva**: Componente con badge y dropdown
✅ **Integración**: Automática en acciones existentes
✅ **Seguridad**: Middleware de autenticación
✅ **Rendimiento**: Sistema de salas eficiente
✅ **Pruebas**: Script de verificación

## 📝 Uso del Servicio de Notificaciones

```javascript
const NotificationService = require('../services/notificationService');

// Notificación personalizada
await NotificationService.notifyUser(
  userId,
  'Título',
  'Mensaje',
  'tipo',
  relatedUserId,
  relatedPostId
);

// Notificaciones predefinidas
await NotificationService.notifyPostLike(postAuthorId, postId, userIdLiking);
await NotificationService.notifyPostComment(postAuthorId, postId, commentId, userIdCommenting);
await NotificationService.notifyFriendRequest(userId, requesterId);
await NotificationService.notifyFriendAccepted(userId, friendId);
```

El sistema está completamente integrado y funcional. El botón de notificaciones en la barra superior ahora mostrará notificaciones en tiempo real con persistencia completa en base de datos.
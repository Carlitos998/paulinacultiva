# Configuración de Gmail para envío de emails

## Pasos para configurar tu cuenta de Gmail

### 1. Habilitar Verificación en Dos Pasos
1. Ve a: https://myaccount.google.com/security
2. En "Acceso a Google", busca "Verificación en dos pasos"
3. Actívala si no lo está ya

### 2. Generar Contraseña de Aplicación
1. Ve a: https://myaccount.google.com/apppasswords
2. Selecciona:
   - **Seleccionar app**: Otro (nombre personalizado)
   - **Nombre**: Paulina Cultura API
3. Haz clic en "Generar"
4. Copia la contraseña generada (será algo como: `abcd efgh ijkl mnop`)

### 3. Configurar en el proyecto
Abre el archivo `api/.env` y reemplaza:
```
EMAIL_PASS=tu_app_password_aqui
```
Por la contraseña generada (sin espacios):
```
EMAIL_PASS=abcdefghijklmnop
```

### 4. Reiniciar el servidor
```bash
# Detén el servidor si está corriendo (Ctrl + C)
# Luego reinícialo:
cd api
npm start
```

### 5. Probar la configuración
```bash
cd api
node test-email.js
```

## Importante
- Usa la contraseña de aplicación, NO tu contraseña normal de Gmail
- Guarda la contraseña en un lugar seguro
- Cada contraseña de aplicación solo funciona para una app específica
- Puedes generar múltiples contraseñas si lo necesitas

## Solución de problemas
- Si sigue sin funcionar, verifica que la verificación en dos pasos esté activa
- Asegúrate de estar usando la contraseña de aplicación correcta
- Revisa que no haya espacios en blanco en el archivo .env
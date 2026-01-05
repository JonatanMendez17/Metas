# 🔐 Configurar Secrets de Firebase en GitHub

Para que el despliegue automático funcione, necesitas configurar los secrets de Firebase en GitHub.

## 📋 Secrets necesarios

Ve a tu repositorio en GitHub → **Settings** → **Secrets and variables** → **Actions** y crea estos secrets:

### 1. FIREBASE_API_KEY
```
AIzaSyCLrEceXProG4jQaZOnC6QlkpM_x7C-LOk
```

### 2. FIREBASE_AUTH_DOMAIN
```
metas-2cc55.firebaseapp.com
```

### 3. FIREBASE_PROJECT_ID
```
metas-2cc55
```

### 4. FIREBASE_STORAGE_BUCKET
```
metas-2cc55.firebasestorage.app
```

### 5. FIREBASE_MESSAGING_SENDER_ID
```
72829379006
```

### 6. FIREBASE_APP_ID
```
1:72829379006:web:382fdf92a0aaa42b99d9ef
```

### 7. FIREBASE_SERVICE_ACCOUNT
Este es el JSON de la cuenta de servicio. Para obtenerlo:
1. Ve a: https://console.firebase.google.com/project/metas-2cc55/settings/serviceaccounts/adminsdk
2. Haz clic en "Generar nueva clave privada"
3. Copia TODO el contenido del archivo JSON descargado
4. Pégalo como valor del secret

## ✅ Verificación

Una vez configurados todos los secrets, el workflow de GitHub Actions debería funcionar correctamente.

## 💻 Desarrollo local

Para desarrollo local, crea un archivo `.env.local` en la raíz del proyecto con:

```
VITE_FIREBASE_API_KEY=AIzaSyCLrEceXProG4jQaZOnC6QlkpM_x7C-LOk
VITE_FIREBASE_AUTH_DOMAIN=metas-2cc55.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=metas-2cc55
VITE_FIREBASE_STORAGE_BUCKET=metas-2cc55.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=72829379006
VITE_FIREBASE_APP_ID=1:72829379006:web:382fdf92a0aaa42b99d9ef
```

Este archivo ya está creado automáticamente y está en `.gitignore`, así que no se subirá al repositorio.


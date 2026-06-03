# 🚀 Guía de Comandos Expo & EAS (VesTrack)

Esta guía detalla los comandos necesarios para desarrollar, probar y generar binarios (APK) de la aplicación.

## 📱 Desarrollo Local

Para iniciar el servidor de desarrollo:

```bash
# Iniciar con opciones básicas
pnpm expo start

# Forzar plataforma web
pnpm expo start --web

# Forzar plataforma android (requiere emulador o dispositivo conectado)
pnpm expo start --android

# Limpiar caché si hay errores extraños
pnpm expo start -c
```

---

## 📦 Generación de APK (Android)

Existen dos formas principales de generar el APK usando **EAS (Expo Application Services)**.

### 1. Generación Local (Recomendado para pruebas rápidas)
Genera el APK usando tu propia máquina. Requiere tener configurado el entorno de Android (Android Studio/SDK).

```bash
# Generar APK localmente
eas build --platform android --profile preview --local
```
*El archivo resultante aparecerá en la raíz del proyecto o en una carpeta seleccionada por EAS.*

### 2. Generación en la Nube (EAS Cloud)
Expo procesa el build en sus servidores. No requiere que configures Android localmente.

```bash
# Login (si no lo has hecho)
eas login

# Generar APK en la nube
eas build --platform android --profile preview
```
*Al finalizar, te dará un link de descarga o un código QR.*

---

## 🌐 Despliegue Web

Para exportar la versión web estática:

```bash
npx expo export --platform web
```
*Esto genera una carpeta `dist` con los archivos listos para subir a cualquier hosting (GitHub Pages, Netlify, Vercel).*

---

## 🛠️ Comandos de Utilidad

### Gestión de Dependencias
```bash
# Instalar nuevas dependencias (asegura compatibilidad con Expo)
pnpm expo install nombre-del-paquete

# Verificar dependencias
pnpm expo install --check
```

### Configuración inicial de EAS
```bash
# Configurar el proyecto por primera vez
pnpm eas build:configure
```

### Logs y Depuración
```bash
# Ver logs de un build en curso (nube)
pnpm eas build:list
```

---

## 💡 Notas Importantes

- **Gestor de Paquetes**: Este proyecto utiliza `pnpm` para la instalación de dependencias y scripts de ejecución.
- **Seguridad (Edad Mínima de Paquetes)**: Con el fin de evitar ataques a la cadena de suministro (supply chain attacks), el proyecto está configurado para no descargar paquetes o versiones que tengan menos de **10 días** de haber sido publicados. Esta protección está activa en `pnpm-workspace.yaml` y `.npmrc` (`minimumReleaseAge` de 14400 minutos).
- **Profile `preview`**: Está configurado en `eas.json` para generar un **APK** instalable directamente.
- **Profile `production`**: Generalmente genera un **AAB** para la Google Play Store.
- **CORS**: En la versión web, usamos un proxy para BCV. Si los cambios no se ven, asegúrate de refrescar el navegador.

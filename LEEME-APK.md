# Divisa Punzó — versión Android (APK)

App de una sola actividad que muestra el juego en un WebView, en pantalla completa y horizontal,
con controles táctiles semitransparentes:

- **Izquierda:** joystick (dedo gordo izquierdo) para mover el caballo.
- **Derecha:** botón **ARROJAR** (puntería asistida, mantenelo para repetir) y botón **GALOPE** (se prende/apaga).
- **Tocar el escenario** (lado derecho): arroja la divisa justo hacia ese punto.
- **Arriba a la derecha:** pausa y sonido. El botón "atrás" de Android pausa el juego.

## Opción A (la más fácil, sin instalar nada): que GitHub te compile el APK
1. Creá una cuenta gratis en github.com y un repositorio nuevo (privado o público).
2. Subí **todo el contenido de esta carpeta** (incluida la carpeta oculta `.github`) al repositorio
   (botón *Add file → Upload files*; si no ves `.github`, arrastrala igual desde el explorador con "mostrar ocultos").
3. Entrá a la pestaña **Actions → Compilar APK → Run workflow**. Tarda ~3–5 minutos.
4. Cuando termine, abrí esa ejecución y bajá **DivisaPunzo-apk** (viene en un .zip con `app-debug.apk`).
5. Pasá el APK al celular, abrilo y aceptá "instalar apps de orígenes desconocidos" para ese explorador/navegador.

## Opción B: Android Studio
1. Instalá Android Studio, *File → Open* y elegí esta carpeta.
2. Esperá a que sincronice Gradle y luego *Build → Build APK(s)*.
   El archivo queda en `app/build/outputs/apk/debug/app-debug.apk`.

## Cambiar el juego
El juego está en `app/src/main/assets/www/` (HTML/JS/CSS). Editá ahí y volvé a compilar.

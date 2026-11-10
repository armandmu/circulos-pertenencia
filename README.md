# Círculos de pertenencia

Aplicación web independiente para ejercicios de exploración relacional en psicoterapia, basada en los materiales «Círculos de Pertenencia» y las figuras de [Escultura Familiar](https://armandmu.github.io/escultura-familiar/).

**URL prevista:** https://armandmu.github.io/circulos-pertenencia/

## Uso

El psicólogo inicia sesión con su cuenta profesional y crea una sesión. Comparte el enlace con código. El psicólogo y el paciente eligen figuras de un catálogo de 30 modelos, puede escribir un apodo o tipo de relación y colocarlas en una franja. Ambos participantes pueden arrastrarlas dentro del mapa, moverlas a otro círculo, cambiar el nombre después de colocarlas y retirarlas.

Los nombres de las seis franjas están escritos **siguiendo la circunferencia de cada círculo, dentro del propio círculo**, mediante SVG textPath. Del exterior al centro: Seguridad (morado), Desarrollo (azul), Justicia (rojo), Reconocimiento (verde), Pertenencia (naranja), Plenitud (amarillo), y centro blanco sin texto.

El psicólogo selecciona un círculo y pulsa **ⓘ Ver preguntas**: aparecen exclusivamente en su interfaz cinco preguntas de evaluación relativas a ese círculo, tomadas del documento proporcionado.

## Despliegue en GitHub Pages

1. Abre el repositorio en GitHub.
2. Entra en **Settings → Pages**.
3. En **Build and deployment → Source**, selecciona **GitHub Actions**.
4. Una vez habilitado Pages, GitHub Actions podrá desplegar el contenido de la rama main. Si no se lanza un despliegue automáticamente al activarlo, entra en **Actions → Publicar Círculos de Pertenencia → Run workflow**.

La dirección es independiente de Escultura Familiar.

## Aspectos técnicos y privacidad

- Web estática, sin compilación; utiliza supabase-js v2.57.0 desde CDN.
- Emplea el servicio de sesiones configurado en Escultura Familiar mediante las funciones cope_create_session, cope_join_session, cope_update_board y cope_close_session. Los tableros se diferencian por kind: circles-belonging. Se comparte el **backend** pero no la URL ni el repositorio.
- Usa una **clave publicable**, nunca una clave secreta. Los permisos RPC, las políticas RLS, la retención de datos y la autenticación del servicio Supabase preexistente deben verificarse antes de introducir información clínica. La conexión administrativa al proyecto Supabase original no está disponible para esta revisión.
- El panel de preguntas se muestra solamente tras el acceso profesional autenticado. Como las preguntas forman parte del código de una página web pública, esto protege la **visualización habitual**, pero no ofrece secreto técnico absoluto frente a quien inspeccione el código.
- No introducir nombres completos, identificadores ni detalles clínicos sensibles. Usar apodos o descriptores relacionales.
- Es una herramienta de exploración, no un test psicométrico validado. No realiza diagnósticos, cálculos ni interpretaciones psicológicas automáticas.

## Desarrollo

Ejecuta un servidor HTTP estático en la carpeta del repositorio, por ejemplo:

    python3 -m http.server 8000

Abre http://localhost:8000. Para autenticarte y conectar a una sesión necesitas conexión a Internet.

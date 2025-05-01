# Astro Gastos

Aplicación web moderna para el seguimiento y gestión de gastos personales, construida con Astro, React y TypeScript.

## 🚀 Características

- 📊 Visualización de gastos con gráficos interactivos usando Chart.js
- 💰 Gestión de gastos con persistencia en Supabase
- 📱 Aplicación híbrida con Capacitor para Android
- 🎨 Interfaz moderna con TailwindCSS
- 🔄 Estado reactivo con React Hooks
- 🔒 Autenticación y seguridad con Supabase
- 📱 Diseño responsive para todos los dispositivos
- 📱 Mobile-first con optimizaciones específicas para pantallas < 400px
- 🎯 Accesibilidad mejorada para dispositivos móviles
- 📱 UI optimizada para interacción táctil

## 🛠️ Tecnologías Principales

- [Astro](https://astro.build/) - Framework web moderno
- [React](https://reactjs.org/) - Biblioteca para interfaces de usuario
- [TypeScript](https://www.typescriptlang.org/) - JavaScript con tipado estático
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS utilitario
- [Supabase](https://supabase.com/) - Backend como servicio
- [Capacitor](https://capacitorjs.com/) - Framework para aplicaciones híbridas
- [Chart.js](https://www.chartjs.org/) - Biblioteca de visualización de datos

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/astro-gastos.git
cd astro-gastos

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

## 🏗️ Estructura del Proyecto

```
astro-gastos/
├── src/                          # Código fuente
│   ├── assets/                   # Recursos estáticos
│   ├── components/               # Componentes React
│   ├── context/                  # Contexto de React
│   ├── data/                     # Datos y mocks
│   ├── hooks/                    # Hooks personalizados
│   ├── layouts/                  # Plantillas de página
│   ├── lib/                      # Utilidades y configuraciones
│   ├── pages/                    # Páginas de la aplicación
│   ├── services/                 # Servicios y API
│   ├── styles/                   # Estilos globales
│   ├── types/                    # Definiciones de TypeScript
│   └── utils/                    # Funciones utilitarias
├── public/                       # Archivos públicos
├── android/                      # Configuración de Android
└── .github/                      # Configuración de GitHub
```

## 🚀 Scripts Disponibles

| Comando           | Descripción                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo      |
| `npm run build`   | Compila la aplicación para producción |
| `npm run preview` | Previsualiza la versión de producción |
| `npm run astro`   | Ejecuta comandos de la CLI de Astro   |

## 📱 Desarrollo Móvil

Para desarrollar la versión móvil:

```bash
# Añadir plataforma Android
npx cap add android

# Abrir proyecto en Android Studio
npx cap open android
```

## 🔧 Configuración

1. Crea una cuenta en [Supabase](https://supabase.com/)
2. Crea un nuevo proyecto
3. Configura las variables de entorno en `.env`:

```env
PUBLIC_SUPABASE_URL=tu_url_de_supabase
PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

## 📄 Licencia

MIT

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request.

## 📞 Contacto

Para cualquier pregunta o sugerencia, por favor abre un issue en el repositorio.

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## 📱 Características Mobile-First

- Diseño optimizado para pantallas pequeñas (< 400px)
- Componentes táctiles con áreas de toque amplias
- Tipografía y espaciado adaptativos
- Gráficos y tablas responsivos
- Navegación optimizada para móvil
- Formularios adaptados a pantallas pequeñas
- Utilidades específicas para móvil:
  - `.mobile-only` - Elementos visibles solo en móvil
  - `.desktop-only` - Elementos visibles solo en desktop
  - `.mobile-flex-col` - Layout flexible para móvil
  - `.mobile-text-center` - Alineación de texto optimizada

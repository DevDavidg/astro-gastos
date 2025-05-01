# Astro Gastos

Aplicación web para el seguimiento y gestión de gastos personales construida con Astro y React.

## Características

- 📊 Visualización de gastos en tablas y gráficos
- 💰 Cálculo automático de totales y estadísticas
- 💾 Persistencia de datos en localStorage
- 📱 Diseño responsive para todos los dispositivos
- 🔄 Actualización reactiva de la interfaz

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/astro-gastos.git
cd astro-gastos

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

## Uso

1. Abre la aplicación en `http://localhost:4321`
2. Agrega tus gastos usando el formulario
3. Visualiza tus gastos en la tabla principal
4. Consulta el resumen y gráficos en la página "Resumen"
5. Configura parámetros adicionales en "Configuración"

## Estructura del Proyecto

```
astro-gastos/
├── src/                          # Código fuente
│   ├── assets/                   # Imágenes y recursos
│   ├── components/               # Componentes UI reutilizables
│   │   ├── charts/               # Componentes de gráficos
│   │   ├── inputs/               # Formularios y campos
│   │   ├── table/                # Componentes de tablas
│   │   └── ui/                   # Elementos UI básicos
│   ├── context/                  # Contexto global de la aplicación
│   ├── data/                     # Datos iniciales y mocks
│   ├── hooks/                    # Hooks personalizados
│   ├── layouts/                  # Plantillas de página
│   ├── pages/                    # Páginas de la aplicación
│   ├── styles/                   # Estilos SCSS modulares
│   ├── types/                    # Definiciones de TypeScript
│   └── utils/                    # Funciones utilitarias
├── public/                       # Archivos estáticos
```

## Tecnologías

- [Astro](https://astro.build/) - Framework web para sitios orientados a contenido
- [React](https://reactjs.org/) - Biblioteca JavaScript para interfaces de usuario
- [TypeScript](https://www.typescriptlang.org/) - JavaScript con tipado estático
- [SCSS](https://sass-lang.com/) - Preprocesador CSS avanzado

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción

## Licencia

MIT

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

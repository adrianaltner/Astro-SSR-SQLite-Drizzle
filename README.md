# Astro Starter Kit: Blog

```sh
npm create astro@latest -- --template blog
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/blog)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/blog/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![blog](https://github.com/withastro/astro/assets/2244813/ff10799f-a816-4703-b967-c78997e8323d)

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── # Astro SSR with SQLite and Drizzle ORM

A full-stack web application built with Astro.js, SQLite database, and Drizzle ORM. This project demonstrates server-side rendering, form handling, and database operations in a clean and maintainable way.

## Features

- 🚀 **Astro.js** with SSR enabled
- 💽 **SQLite** database
- 🧰 **Drizzle ORM** for typesafe database operations
- 🖥️ **Node.js Adapter** for deployment
- 📝 **Form Submission** with validation
- 📊 **Data Table** display
- 📱 **Responsive Design**

## Prerequisites

- Node.js 22 or higher
- npm (comes with Node.js)

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/astro-drizzle-sqlite.git
cd astro-drizzle-sqlite
```

2. **Install dependencies**

```bash
npm install
```

3. **Generate database migrations**

```bash
npm run db:generate
```

4. **Apply database migrations**

```bash
npm run db:migrate
```

5. **Start the development server**

```bash
npm run dev
```

Visit `http://localhost:4321` to see the application running.

## Project Structure

```
src/
├── db/
│   ├── schema.ts (Database schema definitions)
│   ├── utils.ts (Database utilities)
│   ├── migrate.ts (Migration script)
│   └── index.ts (Database connection)
├── pages/
│   ├── index.astro (Main page with form and table)
│   └── api/
│       └── submit.ts (API endpoint for form submission)
├── components/
│   ├── SubmissionForm.astro (Form component)
│   └── SubmissionsTable.astro (Data table component)
└── styles/
    ├── global.css (Global styles)
    └── table.css (Table and form styles)
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio to view/edit database

## Deployment

This app is configured for deployment on any Node.js hosting provider. After building, you can start the server with:

```bash
npm run build && npm run start
```

## Database Management

To view and manage your database directly, you can use the Drizzle Studio:

```bash
npm run db:studio
```

## License

MIT

## Author

Your Name
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

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

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).

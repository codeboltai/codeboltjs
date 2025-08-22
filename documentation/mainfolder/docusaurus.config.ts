import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Codebolt',
  tagline: 'Codebolt Documentation',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.codebolt.ai',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  markdown: {
    mermaid: true,
  },

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'codeboltai', // Usually your GitHub org/user name.
  projectName: 'codeboltai.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    docs: {
      sidebar: {
        autoCollapseCategories: true,
      },
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'forest'},
    },
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'CodeBolt',
      logo: {
        alt: 'CodeBolt Logo',
        src: 'img/logo.jpg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'userSidebar',
          position: 'left',
          label: 'User Guide',
        },
        {
          type: 'docSidebar',
          sidebarId: 'devSidebar',
          position: 'left',
          label: 'Developer Guide',
        },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'toolSidebar',
        //   position: 'left',
        //   label: 'Tools',
        // },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'appSidebar',
        //   position: 'left',
        //   label: 'Apps',
        // },
        {
          type: 'docSidebar',
          sidebarId: 'jsapiSidebar',
          position: 'left',
          label: 'API',
        },
        {
          to: '/blog', 
          label: 'Blog', 
          position: 'left'
        },
        
      ],
    },
    footer: {
      style: 'dark',
      links: [
        
      ],
      copyright: `Copyright © ${new Date().getFullYear()} CodeBolt.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

export interface Content {
  title: string;
  href?: string;
  list: {
    title: string;
    href: string;
    isNew?: boolean;
  }[];
}

export const docsConfig = {
  contents: [
    {
      title: "Getting Started",
      list: [
        {
          title: "Introduction",
          href: "/docs/introduction",
        },
        {
          title: "Installation",
          href: "/docs/installation",
        },
        {
          title: "Configuration",
          href: "/docs/configuration",
        },
      ],
    },
    {
      title: "Commands",
      list: [
        {
          title: "noto",
          href: "/docs/commands/noto",
        },
      ],
    },
  ],
};

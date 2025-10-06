import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";

import remarkGfm from "remark-gfm";
import remarkEmoji from "remark-emoji";
import remarkFlexibleToc from "remark-flexible-toc";

import type { TocItem, FlexibleTocOptions } from "remark-flexible-toc";
import type { Options as RehypePrettyCodeOptions } from "rehype-pretty-code";

// TODO: move this type to toc component
type TOCItem = {
  title: string;
  url: string;
  depth: number;
};

const docs = defineCollection({
  name: "docs",
  directory: "contents/docs",
  include: "**/*.md",
  schema: z.object({}),
  transform: async (document, context) => {
    const toc: TOCItem[] = [];

    const mdx = await compileMDX(context, document, {
      remarkPlugins: [
        remarkGfm,
        remarkEmoji,
        [
          remarkFlexibleToc,
          {
            skipLevels: [],
            callback: (items: TocItem[]) => {
              toc.push(
                ...items.map((item) => ({
                  title: item.value,
                  url: item.href,
                  depth: item.depth,
                })),
              );
            },
          } as FlexibleTocOptions,
        ],
      ],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            defaultLang: "plaintext",
            theme: "vitesse-light",
            keepBackground: false,
          } as RehypePrettyCodeOptions,
        ],
      ],
    });

    return {
      ...document,
      mdx,
      toc,
    };
  },
});

export default defineConfig({
  collections: [docs],
});

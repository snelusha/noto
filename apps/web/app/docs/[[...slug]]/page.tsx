import { notFound } from "next/navigation";

import { MDXContent } from "@content-collections/mdx/react";

import { Text } from "lucide-react";

import { AnchorProvider, TOCItem } from "~/components/toc";

import { allDocs } from "content-collections";

import { cn } from "~/styles/utils";
import { TOCPopover } from "~/components/toc-popover";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) return notFound();

  const doc = allDocs.find(
    (doc) =>
      doc.slugs.length === slug.length &&
      doc.slugs.every((value, index) => value === slug[index]),
  );
  if (!doc) return notFound();

  return (
    <AnchorProvider toc={doc.toc}>
      <div className="flex w-full min-w-0 flex-col">
        <TOCPopover />
        <div className="flex w-full max-w-[860px] min-w-0 flex-grow flex-col gap-6 px-6 pt-8 md:pt-12 xl:mx-auto xl:px-12">
          <h1 className="text-3xl font-medium">{doc.title}</h1>
          <article className="prose h-[200dvh]">
            <MDXContent code={doc.mdx} />
          </article>
        </div>
      </div>
      <div className="sticky top-28 flex w-[286px] max-w-full shrink-0 flex-col gap-3 self-start pe-2 pt-12 pb-2 max-xl:hidden">
        <div className="text-muted-foreground flex items-center gap-2">
          <Text className="size-3.5" />
          <span>On this page</span>
        </div>
        <div className="flex flex-col gap-2">
          {doc.toc.map((item: TOCItem) => (
            <TOCItem
              key={item.url}
              href={item.url}
              className={cn(
                item.depth !== 2 && "ml-2",
                "text-muted-foreground data-[active]:text-secondary-foreground",
              )}
            >
              {item.title}
            </TOCItem>
          ))}
        </div>
      </div>
    </AnchorProvider>
  );
}

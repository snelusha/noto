import "~/styles/prose.css";

import { notFound } from "next/navigation";

import { MDXContent } from "@content-collections/mdx/react";

import { Text } from "lucide-react";

import { AnchorProvider, TOCItem } from "~/components/toc";

import { allDocs } from "content-collections";
import { cn } from "~/styles/utils";

export default async function Page({ params }: { params: { slug: string[] } }) {
  const { slug } = await params;

  const doc = allDocs[0];
  if (!doc) return notFound();

  console.log(doc.toc);

  return (
    <AnchorProvider toc={doc.toc}>
      <article className="prose mx-auto px-6 py-14">
        <MDXContent code={doc.mdx} />
      </article>
      <div className="font-calling-code sticky top-28 flex w-[268px] flex-col self-start">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Text className="size-4" />
          On this page
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {doc.toc.map((item: TOCItem) => (
            <TOCItem
              key={item.url}
              href={item.url}
              className={cn(
                item.depth === 2 && "ml-2",
                item.depth === 3 && "ml-4",
                "text-muted-foreground data-[active=true]:text-secondary-foreground",
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

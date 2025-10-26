import { notFound } from "next/navigation";

import { MDXContent } from "@content-collections/mdx/react";

import { AnchorProvider } from "~/components/toc";
import { TOCMobile } from "~/components/toc-mobile";
import { TOCDesktop } from "~/components/toc-desktop";

import { allDocs } from "content-collections";

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
        <TOCMobile />
        <div className="flex w-full max-w-[860px] min-w-0 flex-grow flex-col gap-6 px-6 py-8 md:py-12 xl:mx-auto xl:px-12">
          <h1 className="text-3xl font-medium">{doc.title}</h1>
          <article className="prose">
            <MDXContent code={doc.mdx} />
          </article>
        </div>
      </div>
      <TOCDesktop />
    </AnchorProvider>
  );
}

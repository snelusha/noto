import { notFound } from "next/navigation";

import { MDXContent } from "@content-collections/mdx/react";

import { allDocs } from "content-collections";

export default async function Page({ params }: { params: { slug: string[] } }) {
  const { slug } = await params;

  const doc = allDocs[0];
  if (!doc) return notFound();

  return (
    <article className="typography mx-auto">
      <MDXContent code={doc.mdx} />
    </article>
  );
}

import "~/styles/prose.css";

import { notFound } from "next/navigation";

import { MDXContent } from "@content-collections/mdx/react";

import { allDocs } from "content-collections";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) return notFound();

  const doc = allDocs.find((doc) => doc.slug === slug.at(-1));
  if (!doc) return notFound();

  console.log(doc.toc);

  return (
    <div className="mx-auto max-w-3xl">
      <article className="prose">
        <MDXContent code={doc.mdx} />
      </article>
    </div>
  );
}

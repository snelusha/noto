import "~/styles/prose.css";

import { notFound } from "next/navigation";

import { MDXContent } from "@content-collections/mdx/react";

import { allDocs } from "content-collections";

export default async function Page({ params }: { params: { slug: string[] } }) {
  const { slug } = await params;

  const doc = allDocs[0];
  if (!doc) return notFound();

  return (
    <>
      <article className="prose mx-auto px-6 py-14">
        <MDXContent code={doc.mdx} />
      </article>
      <div className="h-dvh w-[268px]"></div>
    </>
  );
}

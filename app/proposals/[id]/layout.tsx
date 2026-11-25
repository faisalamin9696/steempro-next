import React, { Suspense } from "react";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import LoadingStatus from "@/components/LoadingStatus";
import { proposalOr404 } from "@/libs/sds-server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // `parseInt("abc")` is NaN, and an RPC call with a NaN id is a request the
  // node cannot answer. Reject the shape before it leaves the server.
  if (!/^\d{1,9}$/.test(id)) notFound();

  // Resolved before the Suspense boundary, otherwise the fallback flushes a 200
  // and a missing proposal can no longer become a 404. The page's call is
  // request-cached, so this is one RPC either way.
  await proposalOr404(Number(id));

  return <Suspense fallback={<LoadingStatus />}>{children}</Suspense>;
}

export default layout;

export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = (await params) as { id: string };
  const { title, description, thumbnail } = await getMetadata.proposalAsync(id);
  const canonical = `${BASE_URL}/proposals/${id}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title,
      description,
      images: thumbnail ? [thumbnail] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: thumbnail ? [thumbnail] : [],
    },
  };
}

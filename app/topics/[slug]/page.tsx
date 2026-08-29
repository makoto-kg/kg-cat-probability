import React from "react";
import { notFound } from "next/navigation";
import { TOPICS } from "@/lib/topics";
import { TopicView } from "@/components/lesson/TopicView";

interface TopicPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return TOPICS.map((topic) => ({
    slug: topic.slug,
  }));
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = TOPICS.find((t) => t.slug === slug);

  if (!topic) {
    notFound();
  }

  return <TopicView topic={topic} />;
}

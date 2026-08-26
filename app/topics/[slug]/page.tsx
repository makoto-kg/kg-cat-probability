import React from "react";
import { notFound } from "next/navigation";
import { TOPICS } from "@/lib/topics";
import { TopicView } from "@/components/lesson/TopicView";

interface TopicPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return TOPICS.map((topic) => ({
    slug: topic.slug,
  }));
}

export default function TopicPage({ params }: TopicPageProps) {
  const topic = TOPICS.find((t) => t.slug === params.slug);

  if (!topic) {
    notFound();
  }

  return <TopicView topic={topic} />;
}

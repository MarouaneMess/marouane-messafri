import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { formatDate, readingTime } from "@/lib/utils";
import type { Post } from "@/lib/validation";
export function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      <div className="post-meta mono">
        <span>{post.category}</span>
        <span>
          <Clock size={12} /> {readingTime(post.content)} min
        </span>
      </div>
      <h3>
        <Link href={`/blog/${post.slug}`}>
          {post.title}
          <ArrowUpRight size={22} />
        </Link>
      </h3>
      <p>{post.excerpt}</p>
      <div className="post-bottom">
        <span>{formatDate(post.publishedAt)}</span>
        <span>
          {post.type === "WRITEUP" ? "WRITE-UP" : "NOTE DE JOURNAL"} ↗
        </span>
      </div>
    </article>
  );
}

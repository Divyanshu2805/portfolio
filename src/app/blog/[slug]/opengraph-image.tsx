import { DATA } from "@/data/resume";
import { OG_SIZE, ogImage } from "@/lib/og";
import { formatPostDate, getPost } from "@/lib/posts";

export const alt = DATA.writing.title;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) return ogImage({ eyebrow: "/blog", title: DATA.writing.title });
  return ogImage({ eyebrow: formatPostDate(post.date), title: post.title, subtitle: post.summary });
}

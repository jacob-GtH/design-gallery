import { notFound } from "next/navigation";
import { client } from "@/sanity/design-cms/lib/client";
import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft, FiHeart, FiCalendar, FiUser } from "react-icons/fi";
import DesignFooterMotion from "@/components/designs/DesignViewMotion";

export async function generateStaticParams() {
  const designs = await client.fetch(`*[_type == "design"]{ _id }`);
  return designs.map((design: { _id: string }) => ({ id: design._id }));
}

export default async function DesignPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  
  const design = await client.fetch(
    `*[_type == "design" && _id == $id][0]{
      _id,
      title,
      description,
      publishedAt,
      likes,
      background,
      "designer":  designer->{_id, name, slug},
      "tags": tags[]->title,
      media[]{
        url,
        type,
        caption,
      },
      "relatedDesigns": *[
        _type == "design" &&
        references(^.designer._ref) &&
        _id != ^._id &&
        count(media) > 0
      ][0..20]{
        title,
        "slug": slug.current,
        "mediaUrl": media[0].url,
        "mediaType": media[0].type
      }
    }`,
    { id },
    { timeout: 10000 }
  );

  if (!design) return notFound();

  const formattedDate = new Date(design.publishedAt).toLocaleDateString(
    "ar-EG",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* الخلفية (صورة أو فيديو) */}
      <div className="absolute inset-0 z-0 bg-black">
        {design.media[0]?.type === "image" ? (
          <Image
            src={design.media[0]?.url}
            alt={design.title}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <video
            src={design.media[0]?.url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* العنوان والوصف */}
      <div className="absolute bottom-32 left-8 z-10 text-white max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">{design.title}</h1>
        {design.description && (
          <p className="text-lg text-gray-100">{design.description}</p>
        )}
        <div className="flex gap-4 text-sm mt-4 text-gray-300">
          <span className="flex items-center gap-1">
            <FiCalendar />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <FiHeart />
            {design.likes || 0}
          </span>
          {design.designer && (
            <span className="flex items-center gap-1">
              <FiUser />
              {design.designer.name}
            </span>
          )}
        </div>
      </div>

      {/* زر الرجوع */}
      <Link
        href="/admin"
        className="absolute top-10 right-10 z-10 text-white hover:text-red-400 text-sm flex items-center gap-2"
      >
        <FiArrowLeft />
        الرجوع
      </Link>

      {/* ✅ التصاميم الأخرى بحركة Framer Motion */}
      {design.relatedDesigns?.length > 0 && (
        <DesignFooterMotion relatedDesigns={design.relatedDesigns} />
      )}
    </main>
  );
}

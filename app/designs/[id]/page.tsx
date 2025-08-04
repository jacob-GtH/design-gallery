import { notFound } from "next/navigation";
import { client } from "@/sanity/design-cms/lib/client";
import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft, FiHeart, FiCalendar, FiUser } from "react-icons/fi";
import DesignFooterMotion from "@/components/designs/DesignCardScroll";

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
      backgroundColor,
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
  console.log("background color:", design.background);


  return (
    <main className="w-full min-h-screen overflow-x-hidden" style={{ backgroundColor: design.backgroundColor }}>
      {/* تفاصيل التصميم */}
      <div className="pb-12 pt-14 max-w-sm md:max-w-7xl mx-auto">
        <h1 className="text-4xl  font-bold mb-4">{design.title}</h1>

        {design.description && (
          <p className="text-lg text-gray-300 mb-6 whitespace-pre-line">
            {design.description}
          </p>
        )}

        {/* ✅ الوسائط الكاملة */}
        <section className="pb-12 h-full">
          {design.media?.map((item: { url: string; type: string; caption?: string }, index: number) => (
            <div key={index}>
              <div className="relative group w-full overflow-hidden">
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt={`media-${index}`}
                    className="w-full h-auto object-contain mx-auto"
                  />
                ) : (
                  <video
                    src={item.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto object-contain mx-auto"
                  />
                )}
              </div>

              {item.caption && (
                <div
                  className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.caption }}
                />
              )}
            </div>
          ))}
        </section>
        <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-8">
          <span className="flex items-center gap-2">
            <FiCalendar />
            {formattedDate}
          </span>
          <span className="flex items-center gap-2">
            <FiHeart />
            {design.likes || 0}
          </span>
          {design.designer && (
            <span className="flex items-center gap-2">
              <FiUser />
              {design.designer.name}
            </span>
          )}
        </div>

        {/* زر الرجوع */}
        <Link
          href="/designs"
          className="inline-flex items-center gap-2 text-sm text-white hover:text-red-400"
        >
          <FiArrowLeft />
          عودة إلى جميع التصاميم
        </Link>

        {/* ✅ التصاميم المشابهة */}
        {design.relatedDesigns?.length > 0 && (
          <DesignFooterMotion relatedDesigns={design.relatedDesigns} />
        )}
      </div>
    </main>
  );
}

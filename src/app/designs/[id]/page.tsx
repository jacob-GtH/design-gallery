import { notFound } from "next/navigation";
import { client } from "@/lib/sanity.client";
import Link from "next/link";
import { FiArrowLeft, FiHeart, FiCalendar, FiUser } from "react-icons/fi";
import DesignFooterMotion from "@/components/designs/DesignCardScroll";
import MediaBlocks from "@/components/designs/MediaBlocks";
import { getCover } from "@/lib/cover";
import { MEDIA_FULL, MEDIA_LITE, NOT_DRAFT } from "@/lib/queries";

// شبكة أمان: تُعاد توليد الصفحة كل 60 ثانية كحد أقصى (يغطي التعديلات من Sanity Studio مباشرة).
// وعند التعديل من لوحة الإدارة تُبطَل الصفحات فوراً عبر revalidatePath في الـ API.
export const revalidate = 60;

export async function generateStaticParams() {
  const designs = await client.fetch(`*[_type == "design" && ${NOT_DRAFT}]{ _id }`);
  return designs.map((design: { _id: string }) => ({ id: design._id }));
}

export default async function DesignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const design = await client.fetch(
    `*[_type == "design" && _id == $id && ${NOT_DRAFT}][0]{
      _id,
      title,
      description,
      publishedAt,
      likes,
      backgroundColor,
      "designer":  designer->{_id, name, slug},
      "tags": tags[]->title,
      ${MEDIA_FULL},
      "relatedDesigns": *[
        _type == "design" &&
        references(^.designer._ref) &&
        _id != ^._id &&
        ${NOT_DRAFT} &&
        count(media) > 0
      ][0..20]{
        title,
        "id": _id,
        coverKey,
        ${MEDIA_LITE}
      }
    }`,
    { id },
    { timeout: 10000 }
  );

  if (!design) return notFound();

  const formattedDate = design.publishedAt
    ? new Date(design.publishedAt).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // التصاميم المشابهة: نحوّل كل تصميم إلى غلافه (الغلاف المختار أو أول كتلة مرئية)
  const relatedDesigns = (design.relatedDesigns ?? [])
    .map((r: { id: string; title: string; coverKey?: string | null; media?: { _key?: string; type: string; url?: string; items?: { url: string }[] | null }[] }) => {
      const cover = getCover(r.media, r.coverKey);
      return cover ? { id: r.id, title: r.title, mediaUrl: cover.url, mediaType: cover.type } : null;
    })
    .filter(Boolean) as { id: string; title: string; mediaUrl: string; mediaType: string }[];

  return (
    <div className="w-full min-h-screen overflow-x-hidden" style={{ backgroundColor: design.backgroundColor }}>
      {/* تفاصيل التصميم */}
      <div className="pb-12 pt-14 max-w-sm md:max-w-7xl mx-auto">
        <h1 className="text-black dark:text-white text-4xl font-bold mb-4 transition-colors duration-500">{design.title}</h1>

        {design.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-line transition-colors duration-500">
            {design.description}
          </p>
        )}

        {/* ✅ الوسائط الكاملة */}
        <section className="pb-12 h-full">
          <MediaBlocks blocks={design.media ?? []} />
        </section>
        <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 text-sm mb-8 transition-colors duration-500">
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
          className="inline-flex items-center gap-2 text-sm text-black dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors duration-500"
        >
          <FiArrowLeft />
          عودة إلى جميع التصاميم
        </Link>

        {/* ✅ التصاميم المشابهة */}
        {relatedDesigns.length > 0 && (
          <DesignFooterMotion relatedDesigns={relatedDesigns} />
        )}
      </div>
    </div>
  );
}

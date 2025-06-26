// components/designs/DesignDetails.tsx
import { IDesign } from "../../interfaces/Design";
import { Button } from "../ui/Button";

export default function DesignDetails({ design }: { design: IDesign }) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative h-96">
          <img
            src={design.mediaUrl}
            alt={design.title}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="p-8">
          <div className="flex flex-wrap justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{design.title}</h1>
              <p className="text-lg text-blue-600">بواسطة {design.designer}</p>
            </div>

            <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
              <span>❤️</span>
              <span className="font-bold">{design.likes} إعجاب</span>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-gray-700 leading-relaxed">
              {design.description || "لا يوجد وصف متوفر لهذا التصميم."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {design.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary">تواصل مع المصمم</Button>
            <Button variant="outline">مشاركة التصميم</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

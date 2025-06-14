// app/designs/page.tsx
import React from 'react';

interface Design {
  _id: string;
  title: string;
  slug: { current: string };
  imageUrl: string;
  category: any;
  description: string;
}

export default async function DesignsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/designs`);
  const designs: Design[] = await res.json();

  return (
    <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {designs.map((design) => (
        <div key={design._id} className="bg-white rounded-xl shadow p-4">
          <img src={design.imageUrl} alt={design.title} className="rounded-md mb-4" />
          <h2 className="text-xl font-semibold">{design.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{design.description}</p>
        </div>
      ))}
    </main>
  );
}

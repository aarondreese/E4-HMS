import Link from "next/link";
import { Attribute } from "@/lib/types";

async function getAttributes(): Promise<Attribute[]> {
  const res = await fetch("http://localhost:3000/Attribute/api", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch attributes");
  return res.json();
}

const AttributePage = async () => {
  let attributes: Attribute[] = [];
  try {
    attributes = await getAttributes();
  } catch (e) {
    return <div>Error loading attributes.</div>;
  }
  return (
    <main className="flex flex-col justify-center items-center p-24 min-h-screen">
      <h1 className="mb-8 font-bold text-2xl">Attributes</h1>
      <table className="mb-8 border border-gray-300 min-w-full">
        <thead>
          <tr>
            <th className="px-2 py-1 border">ID</th>
            <th className="px-2 py-1 border">Name</th>
            <th className="px-2 py-1 border">Active</th>
          </tr>
        </thead>
        <tbody>
          {attributes.map((attr) => (
            <tr key={attr.ID}>
              <td className="px-2 py-1 border">
                <Link href={`/Attribute/${attr.ID}`}>{attr.ID}</Link>
              </td>
              <td className="px-2 py-1 border">
                <Link href={`/Attribute/${attr.ID}`}>{attr.Name}</Link>
              </td>
              <td className="px-2 py-1 border">
                {attr.isActive ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-8">
        <a href="/" className="text-blue-600 text-lg underline">
          Back to Main Menu
        </a>
      </div>
    </main>
  );
};

export default AttributePage;

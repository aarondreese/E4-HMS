import { AttributeGroup } from "@/lib/attributeGroup";

async function getAttributeGroups(): Promise<AttributeGroup[]> {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/AttributeGroup/api`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch attribute groups");
  return res.json();
}

export default async function AttributeGroupPage() {
  const groups = await getAttributeGroups();
  return (
    <div className="mx-auto p-4 max-w-2xl">
      <h1 className="mb-4 font-bold text-2xl">Attribute Groups</h1>
      <table className="mb-4 border border-gray-300 min-w-full">
        <thead>
          <tr>
            <th className="px-2 py-1 border">ID</th>
            <th className="px-2 py-1 border">Name</th>
            <th className="px-2 py-1 border">isActive</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.ID}>
              <td className="px-2 py-1 border">
                <a
                  href={`/AttributeGroup/${g.ID}`}
                  className="text-blue-600 underline"
                >
                  {g.ID}
                </a>
              </td>
              <td className="px-2 py-1 border">
                <a
                  href={`/AttributeGroup/${g.ID}`}
                  className="text-blue-600 underline"
                >
                  {g.Name}
                </a>
              </td>
              <td className="px-2 py-1 border">{g.isActive}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form method="post" action="/AttributeGroup/api" className="mb-4">
        <h2 className="mb-2 font-semibold">Add New Attribute Group</h2>
        <input
          name="Name"
          placeholder="Name"
          className="mr-2 px-2 py-1 border"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 px-4 py-1 rounded text-white"
        >
          Add
        </button>
      </form>
      <div className="mt-8">
        <a href="/" className="text-blue-600 text-lg underline">
          Back to Main Menu
        </a>
      </div>
    </div>
  );
}

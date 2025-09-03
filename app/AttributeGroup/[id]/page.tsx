import { AttributeGroup } from "@/lib/attributeGroup";

interface AttributeGroupAttribute {
  ID: number;
  AttributeGroupID: number;
  AttributeID: number;
  AttributeName: string;
}

async function getAttributeGroup(id: string): Promise<AttributeGroup | null> {
  const res = await fetch(`http://localhost:3000/AttributeGroup/api?id=${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getGroupAttributes(
  id: string
): Promise<AttributeGroupAttribute[]> {
  const res = await fetch(
    `http://localhost:3000/AttributeGroup/api/attributes?groupId=${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function AttributeGroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const group = await getAttributeGroup(params.id);
  const attributes = await getGroupAttributes(params.id);

  if (!group) {
    return <div>Attribute Group not found.</div>;
  }

  return (
    <div className="mx-auto p-4 max-w-2xl">
      <div className="bg-gray-50 mb-6 p-4 border rounded">
        <h2 className="mb-2 font-bold text-xl">Attribute Group Details</h2>
        <div>
          <strong>ID:</strong> {group.ID}
        </div>
        <div>
          <strong>Name:</strong> {group.Name}
        </div>
        <div>
          <strong>isActive:</strong> {group.isActive}
        </div>
      </div>
      <h3 className="mb-2 font-semibold text-lg">Attributes in this Group</h3>
      <table className="mb-4 border border-gray-300 min-w-full">
        <thead>
          <tr>
            <th className="px-2 py-1 border">ID</th>
            <th className="px-2 py-1 border">Attribute Name</th>
          </tr>
        </thead>
        <tbody>
          {attributes.map((attr) => (
            <tr key={attr.ID}>
              <td className="px-2 py-1 border">{attr.ID}</td>
              <td className="px-2 py-1 border">{attr.AttributeName}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="/AttributeGroup" className="text-blue-600 underline">
        Back to Attribute Groups
      </a>
    </div>
  );
}

import Link from "next/link";
import { PropertyDetails } from "@/lib/propertyDetails";

async function getProperties(): Promise<PropertyDetails[]> {
  const res = await fetch("http://localhost:3000/property/api/properties", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch properties");
  return res.json();
}

const PropertyPage = async () => {
  let properties: PropertyDetails[] = [];
  try {
    properties = await getProperties();
  } catch (e) {
    return <div>Error loading properties.</div>;
  }
  return (
    <>
      <h1>Properties</h1>
      <table className="border border-gray-300 min-w-full">
        <thead>
          <tr>
            <th className="px-2 py-1 border">ID</th>
            <th className="px-2 py-1 border">Address</th>
            <th className="px-2 py-1 border">Type</th>
            <th className="px-2 py-1 border">Postcode</th>
            <th className="px-2 py-1 border">Lettable</th>
            <th className="px-2 py-1 border">Virtual</th>
            <th className="px-2 py-1 border">Take On Date</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => (
            <tr key={p.PropertyID}>
              <td className="px-2 py-1 border">
                <Link href={`/property/${p.PropertyID}`}>{p.PropertyID}</Link>
              </td>
              <td className="px-2 py-1 border">
                <Link href={`/property/${p.PropertyID}`}>{p.AddressLine1}</Link>
              </td>
              <td className="px-2 py-1 border">{p.TypeName}</td>
              <td className="px-2 py-1 border">{p.PostCode ?? "N/A"}</td>
              <td className="px-2 py-1 border">
                {p.isLettable ? "Yes" : "No"}
              </td>
              <td className="px-2 py-1 border">{p.isVirtual ? "Yes" : "No"}</td>
              <td className="px-2 py-1 border">{p.TakeOnDate?.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      <Link href="/newproperty">Add new</Link>
      <div className="mt-8">
        <a href="/" className="text-blue-600 text-lg underline">
          Back to Main Menu
        </a>
      </div>
    </>
  );
};

export default PropertyPage;

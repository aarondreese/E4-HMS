
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PropertyDetails } from "@/lib/propertyDetails";

async function getProperties(): Promise<PropertyDetails[]> {
  const res = await fetch("/property/api/properties", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch properties");
  return res.json();
}

export default function PropertyPage() {
  const [properties, setProperties] = useState<PropertyDetails[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<PropertyDetails[]>([]);

  useEffect(() => {
    getProperties().then(setProperties).catch(() => setProperties([]));
  }, []);

  useEffect(() => {
    const s = search.trim().toLowerCase();
    if (!s) {
      setFiltered(properties);
    } else {
      setFiltered(
        properties.filter(
          (p) =>
            (p.AddressLine1 && p.AddressLine1.toLowerCase().includes(s)) ||
            (p.PostCode && p.PostCode.toLowerCase().includes(s))
        )
      );
    }
  }, [search, properties]);

  return (
    <>
      <div className="mb-4">
        <a href="/" className="text-blue-600 text-lg underline">
          Back to Main Menu
        </a>
      </div>
      <h1>Properties</h1>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          placeholder="Search by address or postcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 w-full sm:w-64"
        />
      </div>
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
          {filtered.map((p) => (
            <tr key={p.PropertyID}>
              <td className="px-2 py-1 border">
                <Link href={`/property/${p.PropertyID}`}>{p.PropertyID}</Link>
              </td>
              <td className="px-2 py-1 border">
                <Link href={`/property/${p.PropertyID}`}>{p.AddressLine1}</Link>
              </td>
              <td className="px-2 py-1 border">{p.TypeName}</td>
              <td className="px-2 py-1 border">{p.PostCode ?? "N/A"}</td>
              <td className="px-2 py-1 border">{p.isLettable ? "Yes" : "No"}</td>
              <td className="px-2 py-1 border">{p.isVirtual ? "Yes" : "No"}</td>
              <td className="px-2 py-1 border">{p.TakeOnDate?.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      <Link href="/newproperty">Add new</Link>
    </>
  );
}

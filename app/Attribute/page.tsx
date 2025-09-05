"use client";
import Link from "next/link";
import { Attribute } from "@/lib/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function AttributePage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchAttributes() {
      try {
        const res = await fetch("/Attribute/api", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch attributes");
        const data = await res.json();
        setAttributes(data);
      } catch (e) {
        setError("Error loading attributes.");
      } finally {
        setLoading(false);
      }
    }
    fetchAttributes();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
      {/* New Attribute Form */}
      <NewAttributeForm />
      <div className="mt-8">
        <a href="/" className="text-blue-600 text-lg underline">
          Back to Main Menu
        </a>
      </div>
    </main>
  );
}

function NewAttributeForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/Attribute/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name: name }),
      });
      if (!res.ok) throw new Error("Failed to add attribute");
      const data = await res.json();
      if (data.id) {
        router.push(`/Attribute/${data.id}`);
      } else {
        setError("Failed to get new attribute ID");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-2 mb-8"
    >
      <label className="font-semibold">Add New Attribute</label>
      <input
        className="p-1 border rounded min-w-[200px]"
        placeholder="Attribute Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 px-4 py-1 rounded font-semibold text-white"
        disabled={loading || !name.trim()}
      >
        {loading ? "Saving..." : "Add Attribute"}
      </button>
      {error && <div className="mt-1 text-red-600 text-sm">{error}</div>}
    </form>
  );
}

export default AttributePage;

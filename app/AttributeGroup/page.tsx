'use client';

import { AttributeGroup } from "@/types";
import { useState, useEffect } from "react";

export default function AttributeGroupPage() {
  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    try {
      setLoading(true);
      const res = await fetch('/AttributeGroup/api');
      if (!res.ok) throw new Error('Failed to fetch attribute groups');
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const Name = formData.get('Name') as string;

    try {
      const res = await fetch('/AttributeGroup/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add attribute group');
      }

      // Clear form and refresh list
      e.currentTarget.reset();
      await fetchGroups();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add attribute group');
    }
  }

  if (loading) return <div className="mx-auto p-4 max-w-2xl">Loading...</div>;
  if (error) return <div className="mx-auto p-4 max-w-2xl text-red-600">Error: {error}</div>;

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
      <form onSubmit={handleSubmit} className="mb-4">
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

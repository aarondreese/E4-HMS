"use client";

import { AttributeGroup, Attribute, AttributeGroupAttribute } from "@/types";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AttributeGroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [group, setGroup] = useState<AttributeGroup | null>(null);
  const [groupAttributes, setGroupAttributes] = useState<
    AttributeGroupAttribute[]
  >([]);
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>(
    []
  );
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingAttribute, setAddingAttribute] = useState(false);
  const [error, setError] = useState("");

  // Fetch group details
  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await fetch(`/AttributeGroup/api?id=${params.id}`);
        if (res.ok) {
          setGroup(await res.json());
        } else {
          setGroup(null);
        }
      } catch (err) {
        console.error("Error fetching group:", err);
        setGroup(null);
      }
    }
    fetchGroup();
  }, [params.id]);

  // Fetch group attributes
  const fetchGroupAttributes = async () => {
    try {
      const res = await fetch(
        `/AttributeGroup/api/attributes?groupId=${params.id}`
      );
      if (res.ok) {
        setGroupAttributes(await res.json());
      }
    } catch (err) {
      console.error("Error fetching group attributes:", err);
    }
  };

  // Fetch available attributes (not in this group)
  const fetchAvailableAttributes = async () => {
    try {
      const [allAttributesRes, groupAttributesRes] = await Promise.all([
        fetch("/Attribute/api"),
        fetch(`/AttributeGroup/api/attributes?groupId=${params.id}`),
      ]);

      if (allAttributesRes.ok && groupAttributesRes.ok) {
        const allAttributes = await allAttributesRes.json();
        const currentGroupAttributes = await groupAttributesRes.json();

        const groupAttributeIds = new Set(
          currentGroupAttributes.map(
            (attr: AttributeGroupAttribute) => attr.AttributeID
          )
        );

        const available = allAttributes.filter(
          (attr: Attribute) =>
            attr.isActive === 1 && !groupAttributeIds.has(attr.ID)
        );

        setAvailableAttributes(available);
      }
    } catch (err) {
      console.error("Error fetching available attributes:", err);
    }
  };

  useEffect(() => {
    async function fetchAttributes() {
      try {
        const res = await fetch(
          `/AttributeGroup/api/attributes?groupId=${params.id}`
        );
        if (res.ok) {
          setGroupAttributes(await res.json());
        }
      } catch (err) {
        console.error("Error fetching group attributes:", err);
      }
    }
    fetchAttributes();
  }, [params.id]);

  useEffect(() => {
    if (group) {
      setLoading(false);
    }
  }, [group]);

  // Handle adding attribute to group
  const handleAddAttribute = async () => {
    if (!selectedAttributeId) return;

    setAddingAttribute(true);
    setError("");

    try {
      const res = await fetch("/AttributeGroup/api/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attributeGroupId: parseInt(params.id),
          attributeId: parseInt(selectedAttributeId),
        }),
      });

      if (res.ok) {
        // Refresh the lists
        await fetchGroupAttributes();
        await fetchAvailableAttributes();
        setSelectedAttributeId("");
        setShowAddForm(false);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to add attribute");
      }
    } catch (err) {
      setError("An error occurred while adding the attribute");
      console.error("Error adding attribute:", err);
    } finally {
      setAddingAttribute(false);
    }
  };

  // Handle removing attribute from group
  const handleRemoveAttribute = async (attributeId: number) => {
    if (
      !confirm("Are you sure you want to remove this attribute from the group?")
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/AttributeGroup/api/attributes?attributeGroupId=${params.id}&attributeId=${attributeId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        // Refresh the lists
        await fetchGroupAttributes();
        if (showAddForm) {
          await fetchAvailableAttributes();
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to remove attribute");
      }
    } catch (err) {
      alert("An error occurred while removing the attribute");
      console.error("Error removing attribute:", err);
    }
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
    fetchAvailableAttributes();
    setError("");
  };

  if (loading) {
    return <div className="mx-auto p-4 max-w-2xl">Loading...</div>;
  }

  if (!group) {
    return (
      <div className="mx-auto p-4 max-w-2xl">Attribute Group not found.</div>
    );
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

      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">Attributes in this Group</h3>
        <button
          type="button"
          className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded font-semibold text-white transition"
          onClick={handleShowAddForm}
        >
          + Add Attribute
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-100 mb-4 p-4 rounded">
          <h4 className="mb-2 font-semibold">Add Attribute to Group</h4>
          {availableAttributes.length === 0 ? (
            <div className="text-gray-600">No available attributes to add.</div>
          ) : (
            <>
              <select
                className="mb-2 p-2 border rounded w-full"
                value={selectedAttributeId}
                onChange={(e) => setSelectedAttributeId(e.target.value)}
              >
                <option value="">Select an attribute...</option>
                {availableAttributes.map((attr) => (
                  <option key={attr.ID} value={attr.ID}>
                    {attr.Name}
                  </option>
                ))}
              </select>
              {error && (
                <div className="mb-2 text-red-600 text-sm">{error}</div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded font-semibold text-white transition"
                  onClick={handleAddAttribute}
                  disabled={!selectedAttributeId || addingAttribute}
                >
                  {addingAttribute ? "Adding..." : "Add"}
                </button>
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 px-3 py-1 rounded font-semibold text-white transition"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedAttributeId("");
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <table className="mb-4 border border-gray-300 min-w-full">
        <thead>
          <tr>
            <th className="px-2 py-1 border">ID</th>
            <th className="px-2 py-1 border">Attribute Name</th>
            <th className="px-2 py-1 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groupAttributes.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="px-2 py-4 border text-gray-500 text-center"
              >
                No attributes in this group yet.
              </td>
            </tr>
          ) : (
            groupAttributes.map((attr) => (
              <tr key={attr.ID}>
                <td className="px-2 py-1 border">{attr.AttributeID}</td>
                <td className="px-2 py-1 border">{attr.AttributeName}</td>
                <td className="px-2 py-1 border text-center">
                  <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-white text-sm transition"
                    onClick={() => handleRemoveAttribute(attr.AttributeID)}
                    title="Remove from group"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Link href="/AttributeGroup" className="text-blue-600 underline">
        Back to Attribute Groups
      </Link>
    </div>
  );
}

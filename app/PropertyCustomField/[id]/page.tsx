"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PropertyCustomField, CustomFieldType } from "@/types";

export default function PropertyCustomFieldDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [field, setField] = useState<PropertyCustomField | null>(null);
  const [fieldTypes, setFieldTypes] = useState<CustomFieldType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [fieldRes, typesRes] = await Promise.all([
          fetch(`/PropertyCustomField/api?id=${params.id}`, { cache: "no-store" }),
          fetch("/PropertyCustomField/api/customFieldTypes", { cache: "no-store" }),
        ]);

        if (!fieldRes.ok) throw new Error("Failed to fetch custom field");
        
        const fieldData = await fieldRes.json();
        setField(fieldData);
        
        if (typesRes.ok) {
          const typesData = await typesRes.json();
          setFieldTypes(typesData);
        }
      } catch (e) {
        setError("Error loading custom field.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  const handleSave = async () => {
    if (!field) return;
    
    // Validate tab number
    if (![1, 2, 3].includes(field.TabNumber)) {
      setError("Tab number must be 1, 2, or 3");
      return;
    }
    
    setSaving(true);
    setError("");
    
    try {
      const res = await fetch(`/PropertyCustomField/api?id=${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FieldName: field.FieldName,
          FieldLabel: field.FieldLabel,
          CustomFieldTypeID: field.CustomFieldTypeID,
          TabNumber: field.TabNumber,
          RowNumber: field.RowNumber,
          ColNumber: field.ColNumber,
          isActive: field.isActive,
          Rules: field.Rules,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update custom field");
      }
      alert("Custom field updated successfully!");
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (updates: Partial<PropertyCustomField>) => {
    if (field) {
      setField({ ...field, ...updates });
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!field) return <div className="p-8">Custom field not found.</div>;

  return (
    <main className="p-8 min-h-screen">
      <div className="mb-4">
        <Link href="/PropertyCustomField" className="text-blue-600 underline">
          ← Back to Custom Fields List
        </Link>
      </div>

      <h1 className="mb-6 font-bold text-2xl">
        Edit Custom Field: {field.FieldName}
      </h1>

      <div className="bg-white shadow-md p-6 rounded-lg max-w-3xl">
        <div className="gap-6 grid grid-cols-2 mb-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Field Name
            </label>
            <input
              type="text"
              value={field.FieldName}
              onChange={(e) => updateField({ FieldName: e.target.value })}
              className="px-3 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Field Label
            </label>
            <input
              type="text"
              value={field.FieldLabel}
              onChange={(e) => updateField({ FieldLabel: e.target.value })}
              className="px-3 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Field Type
            </label>
            <select
              value={field.CustomFieldTypeID}
              onChange={(e) => updateField({ CustomFieldTypeID: parseInt(e.target.value) })}
              className="px-3 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {fieldTypes.map((type) => (
                <option key={type.ID} value={type.ID}>
                  {type.FieldTypeDescription || `Type ${type.ID}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Active
            </label>
            <select
              value={field.isActive}
              onChange={(e) => updateField({ isActive: parseInt(e.target.value) })}
              className="px-3 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Tab Number
            </label>
            <select
              value={field.TabNumber}
              onChange={(e) => updateField({ TabNumber: parseInt(e.target.value) })}
              className="px-3 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Row Number
            </label>
            <input
              type="number"
              value={field.RowNumber}
              onChange={(e) => updateField({ RowNumber: parseInt(e.target.value) })}
              className="px-3 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
              min="1"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Column Number
            </label>
            <input
              type="number"
              value={field.ColNumber}
              onChange={(e) => updateField({ ColNumber: parseInt(e.target.value) })}
              className="px-3 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
              min="1"
            />
          </div>

          <div className="col-span-2">
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Rules (XML)
            </label>
            <textarea
              value={field.Rules || ""}
              onChange={(e) => updateField({ Rules: e.target.value })}
              className="px-3 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={4}
              placeholder="Optional XML rules..."
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 px-6 py-2 rounded-md font-medium text-white"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          
          <button
            onClick={() => router.push("/PropertyCustomField")}
            className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-md font-medium text-gray-700"
          >
            Cancel
          </button>
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>

      <div className="mt-8 max-w-3xl">
        <h2 className="mb-4 font-semibold text-xl">Field Information</h2>
        <div className="bg-gray-50 shadow-sm p-4 border rounded-lg">
          <p><strong>ID:</strong> {field.ID}</p>
          <p><strong>Current Type:</strong> {field.CustomFieldTypeName || field.CustomFieldTypeID}</p>
          <p><strong>Position:</strong> Tab {field.TabNumber}, Row {field.RowNumber}, Col {field.ColNumber}</p>
        </div>
      </div>
    </main>
  );
}

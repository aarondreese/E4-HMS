"use client";
import Link from "next/link";
import { PropertyCustomField } from "@/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function PropertyCustomFieldPage() {
  const [fields, setFields] = useState<PropertyCustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchFields() {
      try {
        const res = await fetch("/PropertyCustomField/api", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch custom fields");
        const data = await res.json();
        setFields(data);
      } catch (e) {
        setError("Error loading custom fields.");
      } finally {
        setLoading(false);
      }
    }
    fetchFields();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this custom field?")) return;
    
    try {
      const res = await fetch(`/PropertyCustomField/api?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setFields(fields.filter(f => f.ID !== id));
    } catch (e) {
      alert("Error deleting custom field.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <main className="flex flex-col justify-center items-center p-24 min-h-screen">
      <h1 className="mb-8 font-bold text-2xl">Property Custom Fields</h1>
      <table className="mb-8 border border-gray-300 min-w-full">
        <thead>
          <tr>
            <th className="px-2 py-1 border">ID</th>
            <th className="px-2 py-1 border">Field Name</th>
            <th className="px-2 py-1 border">Label</th>
            <th className="px-2 py-1 border">Type</th>
            <th className="px-2 py-1 border">Tab</th>
            <th className="px-2 py-1 border">Row</th>
            <th className="px-2 py-1 border">Col</th>
            <th className="px-2 py-1 border">Active</th>
            <th className="px-2 py-1 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.ID}>
              <td className="px-2 py-1 border">
                <Link href={`/PropertyCustomField/${field.ID}`}>{field.ID}</Link>
              </td>
              <td className="px-2 py-1 border">
                <Link href={`/PropertyCustomField/${field.ID}`}>{field.FieldName}</Link>
              </td>
              <td className="px-2 py-1 border">{field.FieldLabel}</td>
              <td className="px-2 py-1 border">{field.CustomFieldTypeName || field.CustomFieldTypeID}</td>
              <td className="px-2 py-1 border">{field.TabNumber}</td>
              <td className="px-2 py-1 border">{field.RowNumber}</td>
              <td className="px-2 py-1 border">{field.ColNumber}</td>
              <td className="px-2 py-1 border">
                {field.isActive ? "Yes" : "No"}
              </td>
              <td className="px-2 py-1 border">
                <button
                  onClick={() => handleDelete(field.ID)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* New Custom Field Form */}
      <NewCustomFieldForm />
      
      <div className="mt-8">
        <a href="/" className="text-blue-600 text-lg underline">
          Back to Main Menu
        </a>
      </div>
    </main>
  );
}

function NewCustomFieldForm() {
  const [fieldName, setFieldName] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [customFieldTypeID, setCustomFieldTypeID] = useState<number | "">("");
  const [tabNumber, setTabNumber] = useState(1);
  const [rowNumber, setRowNumber] = useState(1);
  const [colNumber, setColNumber] = useState(1);
  const [fieldTypes, setFieldTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchFieldTypes() {
      try {
        const res = await fetch("/PropertyCustomField/api/customFieldTypes");
        if (res.ok) {
          const data = await res.json();
          setFieldTypes(data);
        }
      } catch (e) {
        console.error("Error loading field types:", e);
      }
    }
    fetchFieldTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Validate tab number
    if (![1, 2, 3].includes(tabNumber)) {
      setError("Tab number must be 1, 2, or 3");
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/PropertyCustomField/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FieldName: fieldName,
          FieldLabel: fieldLabel,
          CustomFieldTypeID: customFieldTypeID,
          TabNumber: tabNumber,
          RowNumber: rowNumber,
          ColNumber: colNumber,
          isActive: 1,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add custom field");
      }
      const data = await res.json();
      
      if (data.id) {
        router.push(`/PropertyCustomField/${data.id}`);
      } else {
        setError("Failed to get new custom field ID");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-gray-300 bg-gray-50 p-4 border rounded w-full max-w-2xl">
      <h2 className="mb-4 font-semibold text-xl">Add New Custom Field</h2>
      <form onSubmit={handleSubmit} className="gap-4 grid grid-cols-2">
        <div>
          <label className="block mb-1 font-medium text-sm">Field Name:</label>
          <input
            type="text"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            className="px-2 py-1 border rounded w-full"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1 font-medium text-sm">Field Label:</label>
          <input
            type="text"
            value={fieldLabel}
            onChange={(e) => setFieldLabel(e.target.value)}
            className="px-2 py-1 border rounded w-full"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1 font-medium text-sm">Field Type:</label>
          <select
            value={customFieldTypeID}
            onChange={(e) => setCustomFieldTypeID(e.target.value ? parseInt(e.target.value) : "")}
            className="px-2 py-1 border rounded w-full"
            required
          >
            <option value="">Select a type...</option>
            {fieldTypes.map((type) => (
              <option key={type.ID} value={type.ID}>
                {type.FieldTypeDescription || `Type ${type.ID}`}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-1 font-medium text-sm">Tab Number:</label>
          <select
            value={tabNumber}
            onChange={(e) => setTabNumber(parseInt(e.target.value))}
            className="px-2 py-1 border rounded w-full"
            required
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>
        
        <div>
          <label className="block mb-1 font-medium text-sm">Row Number:</label>
          <input
            type="number"
            value={rowNumber}
            onChange={(e) => setRowNumber(parseInt(e.target.value))}
            className="px-2 py-1 border rounded w-full"
            required
            min="1"
          />
        </div>
        
        <div>
          <label className="block mb-1 font-medium text-sm">Column Number:</label>
          <input
            type="number"
            value={colNumber}
            onChange={(e) => setColNumber(parseInt(e.target.value))}
            className="px-2 py-1 border rounded w-full"
            required
            min="1"
          />
        </div>
        
        <div className="col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 px-4 py-2 rounded font-medium text-white"
          >
            {loading ? "Adding..." : "Add Custom Field"}
          </button>
          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
        </div>
      </form>
    </div>
  );
}

export default PropertyCustomFieldPage;

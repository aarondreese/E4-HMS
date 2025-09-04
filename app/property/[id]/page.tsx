"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { PropertyAttribute } from "@/lib/propertyAttribute";
import { PropertyDetails } from "@/lib/propertyDetails";

function formatAttrValue(value: any, key: string) {
  if (value && typeof value === "object") {
    if (value instanceof Date) {
      return !isNaN(value.getTime())
        ? value.toLocaleDateString("en-GB")
        : value.toString();
    }
    return JSON.stringify(value);
  }
  if (key.toLowerCase().includes("date") && value) {
    const d = new Date(value);
    return !isNaN(d.getTime()) ? d.toLocaleDateString("en-GB") : String(value);
  }
  if (typeof value === "boolean") {
    return value ? (
      <span className="font-bold text-green-600">&#10003;</span>
    ) : (
      <span className="font-bold text-red-600">&#10007;</span>
    );
  }
  if (typeof value === "number" && key.toLowerCase().includes("boolean")) {
    return value === 1 ? (
      <span className="font-bold text-green-600">&#10003;</span>
    ) : (
      <span className="font-bold text-red-600">&#10007;</span>
    );
  }
  return value ?? "";
}

type PropertyPageProps = {
  params: {
    id: string | string[];
  };
};

interface TabsPanelProps {
  attributes: PropertyAttribute[];
  descriptors: any[];
  selectedAttr: PropertyAttribute | null;
}

// Clean TabsPanel component
function TabsPanel({ attributes, descriptors, selectedAttr }: TabsPanelProps) {
  // Always show three tabs: 1, 2, 3
  const tabs = [1, 2, 3];
  const tabData = tabs.map((tabNum: number) => {
    const tabDescriptors = descriptors.filter((d: any) => d.tab === tabNum);
    // Tab is enabled if there is at least one descriptor for this tab
    return { tabNum, tabDescriptors, hasData: tabDescriptors.length > 0 };
  });
  // State for selected tab
  const [selectedTab, setSelectedTab] = React.useState<number>(1);
  React.useEffect(() => {
    // If current tab has no data, switch to first tab with data
    const current = tabData.find((t: any) => t.tabNum === selectedTab);
    if (!current?.hasData) {
      const firstWithData = tabData.find((t: any) => t.hasData);
      if (firstWithData) setSelectedTab(firstWithData.tabNum);
    }
  }, [selectedAttr, descriptors, selectedTab, tabData]);

  // Render
  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-2">
        {tabData.map(
          ({ tabNum, hasData }: { tabNum: number; hasData: boolean }) => (
            <button
              key={String(tabNum)}
              className={`px-4 py-2 rounded-t font-semibold border-b-2 focus:outline-none ${
                selectedTab === tabNum
                  ? "bg-white border-blue-600 text-blue-700"
                  : hasData
                  ? "bg-purple-50 border-purple-200 text-purple-700"
                  : "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-60"
              }`}
              onClick={() => hasData && setSelectedTab(tabNum)}
              disabled={!hasData}
              aria-disabled={!hasData}
            >
              Tab {tabNum}
            </button>
          )
        )}
      </div>
      {/* Tab content rendering */}
      {(() => {
        const currentTab = tabData.find((t: any) => t.tabNum === selectedTab);
        return (
          <table className="border border-gray-300 min-w-full table-fixed">
            <tbody>
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr
                  key={rowIdx}
                  style={{ minHeight: "3.2rem", height: "3.2rem" }}
                >
                  {Array.from({ length: 2 }).map((_, colIdx) => {
                    const desc =
                      currentTab && currentTab.tabDescriptors
                        ? currentTab.tabDescriptors.find(
                            (d: any) =>
                              d.row === rowIdx + 1 && d.col === colIdx + 1
                          )
                        : undefined;
                    let value = "";
                    if (
                      desc &&
                      selectedAttr &&
                      desc.fieldName in selectedAttr
                    ) {
                      value = formatAttrValue(
                        selectedAttr[desc.fieldName as keyof PropertyAttribute],
                        desc.fieldName
                      );
                    }
                    return (
                      <td
                        key={colIdx}
                        className="px-2 py-1 border align-middle"
                        style={{ width: "50%" }}
                      >
                        {desc ? (
                          <div className="flex flex-col">
                            <span className="mb-1 font-semibold">
                              {desc.label}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 border rounded">
                              {value}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300">&nbsp;</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        );
      })()}
    </div>
  );
}

function AddAttributePanel({
  addAttrDescriptors,
  addAttrSelectedTab,
  setAddAttrSelectedTab,
  newAttrValues,
  setNewAttrValues,
  setShowAddAttribute,
  setSelectedNewAttrId,
  setAddingAttrMode,
  onSave,
}: {
  addAttrDescriptors: any[];
  addAttrSelectedTab: number;
  setAddAttrSelectedTab: (tab: number) => void;
  newAttrValues: { [field: string]: string };
  setNewAttrValues: (values: { [field: string]: string }) => void;
  setShowAddAttribute: (show: boolean) => void;
  setSelectedNewAttrId: (id: string | null) => void;
  setAddingAttrMode: (mode: "select" | "form" | null) => void;
  onSave: () => void;
}) {
  // Debug output for addAttrDescriptors array
  React.useEffect(() => {
    console.log("AddAttributePanel addAttrDescriptors:", addAttrDescriptors);
  }, [addAttrDescriptors]);

  // Render
  return (
    <>
      {/* Tabbed panel for new attribute fields */}
      <div className="mb-2">
        {[1, 2, 3].map((tabNum) => {
          const tabFields = addAttrDescriptors.filter((d) => d.tab === tabNum);
          const tabComplete =
            tabFields.length > 0 &&
            tabFields.every(
              (desc) => newAttrValues[desc.fieldName] !== undefined
            );
          return (
            <button
              key={tabNum}
              className={`px-4 py-2 rounded-t font-semibold border-b-2 focus:outline-none mr-2 ${
                addAttrSelectedTab === tabNum
                  ? "bg-white border-blue-600 text-blue-700"
                  : tabFields.length > 0
                  ? "bg-purple-50 border-purple-200 text-purple-700"
                  : "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-60"
              }`}
              onClick={() =>
                tabFields.length > 0 && setAddAttrSelectedTab(tabNum)
              }
              disabled={tabFields.length === 0}
              aria-disabled={tabFields.length === 0}
              style={{
                borderColor:
                  tabFields.length === 0
                    ? "#444"
                    : tabComplete
                    ? "green"
                    : "red",
              }}
            >
              Tab {tabNum}
            </button>
          );
        })}
      </div>
      <div className="gap-2 grid grid-cols-2">
        {addAttrDescriptors
          .filter((d) => d.tab === addAttrSelectedTab)
          .map((desc) => (
            <div key={desc.fieldName} className="flex flex-col mb-2">
              <label className="mb-1 font-medium text-sm">{desc.label}</label>
              {desc.inputType === "textarea" ? (
                <textarea
                  className="p-2 border rounded"
                  value={newAttrValues[desc.fieldName] || ""}
                  onChange={(e) =>
                    setNewAttrValues({
                      ...newAttrValues,
                      [desc.fieldName]: e.target.value,
                    })
                  }
                />
              ) : desc.inputType === "date" ? (
                <input
                  type="date"
                  className="p-2 border rounded"
                  value={(() => {
                    // Convert DD/MM/YYYY to YYYY-MM-DD for input value
                    const val = newAttrValues[desc.fieldName];
                    if (val && val.includes("/")) {
                      const [day, month, year] = val.split("/");
                      if (day && month && year)
                        return `${year}-${month.padStart(
                          2,
                          "0"
                        )}-${day.padStart(2, "0")}`;
                    }
                    return val || "";
                  })()}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val) {
                      // Convert YYYY-MM-DD to DD/MM/YYYY
                      const [year, month, day] = val.split("-");
                      val = `${day}/${month}/${year}`;
                    }
                    setNewAttrValues({
                      ...newAttrValues,
                      [desc.fieldName]: val,
                    });
                  }}
                />
              ) : (
                <input
                  type={desc.inputType}
                  className="p-2 border rounded"
                  value={newAttrValues[desc.fieldName] || ""}
                  onChange={(e) =>
                    setNewAttrValues({
                      ...newAttrValues,
                      [desc.fieldName]: e.target.value,
                    })
                  }
                />
              )}
            </div>
          ))}
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded font-semibold text-gray-700 transition"
          onClick={() => {
            setShowAddAttribute(false);
            setSelectedNewAttrId(null);
            setAddingAttrMode(null);
            setNewAttrValues({});
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded bg-green-600 text-white font-semibold transition ${
            addAttrDescriptors.length > 0 &&
            addAttrDescriptors.every(
              (desc) => newAttrValues[desc.fieldName] !== undefined
            )
              ? "hover:bg-green-700"
              : "opacity-50 cursor-not-allowed"
          }`}
          disabled={
            !(
              addAttrDescriptors.length > 0 &&
              addAttrDescriptors.every(
                (desc) => newAttrValues[desc.fieldName] !== undefined
              )
            )
          }
          onClick={onSave}
        >
          Save
        </button>
      </div>
    </>
  );
}

const PropertyPage = ({ params }: PropertyPageProps) => {
  // Add Attribute panel state
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [availableAttributes, setAvailableAttributes] = useState<any[]>([]);
  const [selectedNewAttrId, setSelectedNewAttrId] = useState<string | null>(
    null
  );
  const [addAttrDescriptors, setAddAttrDescriptors] = useState<any[]>([]);
  const [newAttrValues, setNewAttrValues] = useState<{
    [field: string]: string;
  }>({});
  const [addAttrSelectedTab, setAddAttrSelectedTab] = useState(1);
  const [addingAttrMode, setAddingAttrMode] = useState<
    "select" | "form" | null
  >(null);

  // Helper: infer input type from field name
  function inferInputType(fieldName: string) {
    if (/date/i.test(fieldName)) return "date";
    if (/email/i.test(fieldName)) return "email";
    if (/phone|tel/i.test(fieldName)) return "tel";
    if (/number|qty|amount|count|id$/i.test(fieldName)) return "number";
    if (/desc|note|comment/i.test(fieldName)) return "textarea";
    return "text";
  }

  // Show Add Attribute panel and fetch available attributes
  const handleShowAddAttribute = async () => {
    setShowAddAttribute(true);
    setAddingAttrMode("select");
    setSelectedNewAttrId(null);
    setNewAttrValues({});
    setAddAttrSelectedTab(1);
    const res = await fetch("/Attribute/api");
    const data = res.ok ? await res.json() : [];
    setAvailableAttributes(data.filter((a: any) => a.isActive === 1));
  };

  // Fetch descriptors for selected new attribute
  useEffect(() => {
    async function fetchNewAttrDescriptors() {
      if (addingAttrMode !== "form" || !selectedNewAttrId) {
        setAddAttrDescriptors([]);
        return;
      }
      const descRes = await fetch(
        `/property/api/attributeDescriptor?attributeId=${selectedNewAttrId}`
      );
      const descData = descRes.ok ? await descRes.json() : [];
      // Add inputType to each descriptor
      const withInputType = descData.map((desc: any) => ({
        ...desc,
        inputType: inferInputType(desc.fieldName),
      }));
      setAddAttrDescriptors(withInputType);
    }
    fetchNewAttrDescriptors();
  }, [addingAttrMode, selectedNewAttrId]);
  const id =
    Array.isArray(params.id) && params.id.length > 0
      ? params.id[0]
      : typeof params.id === "string"
      ? params.id
      : undefined;
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [propertyAttributes, setPropertyAttributes] = useState<
    PropertyAttribute[]
  >([]);
  const [attributeDescriptors, setAttributeDescriptors] = useState<any[]>([]);
  const [selectedAttrId, setSelectedAttrId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const propRes = await fetch(`/property/api/properties?id=${id}`);
      const propData = propRes.ok ? await propRes.json() : null;
      setProperty(propData ?? null);
      if (propData) {
        const attrRes = await fetch(
          `/property/api/propertyAttributes?propertyId=${propData.PropertyID}`
        );
        const attrData = attrRes.ok ? await attrRes.json() : [];
        setPropertyAttributes(attrData);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const selectedAttr =
    propertyAttributes.find((attr) => attr.ID === selectedAttrId) ?? null;

  // Fetch descriptors for selected attribute
  useEffect(() => {
    async function fetchDescriptors() {
      if (!selectedAttr || !selectedAttr.AttributeID) {
        setAttributeDescriptors([]);
        return;
      }
      try {
        console.log(
          "Fetching descriptors for attributeId:",
          selectedAttr.AttributeID
        );
        const descRes = await fetch(
          `/property/api/attributeDescriptor?attributeId=${selectedAttr.AttributeID}`
        );
        const descData = descRes.ok ? await descRes.json() : [];
        setAttributeDescriptors(descData);
      } catch (err) {
        console.error("Descriptor API fetch error:", err);
      }
    }
    fetchDescriptors();
  }, [selectedAttr]);

  // Debug output for selectedAttr and attributeDescriptors
  useEffect(() => {
    console.log("selectedAttr:", selectedAttr);
  }, [selectedAttr]);
  useEffect(() => {
    console.log("attributeDescriptors:", attributeDescriptors);
  }, [attributeDescriptors]);
  useEffect(() => {
    console.log("addAttrDescriptors:", addAttrDescriptors);
  }, [addAttrDescriptors]);

  // Save new attribute
  const handleSaveNewAttribute = async () => {
    const payload = {
      PropertyID: property?.PropertyID ?? null,
      AttributeID: selectedNewAttrId ? parseInt(selectedNewAttrId) : null,
      isActive: 1,
      String01: newAttrValues.String01 ?? null,
      String02: newAttrValues.String02 ?? null,
      String03: newAttrValues.String03 ?? null,
      Date01: newAttrValues.Date01 ?? null,
      Date02: newAttrValues.Date02 ?? null,
      Date03: newAttrValues.Date03 ?? null,
      Int01: newAttrValues.Int01 ?? null,
      Int02: newAttrValues.Int02 ?? null,
      Int03: newAttrValues.Int03 ?? null,
      Decimal01: newAttrValues.Decimal01 ?? null,
      Decimal02: newAttrValues.Decimal02 ?? null,
      Decimal03: newAttrValues.Decimal03 ?? null,
      Lookup01: newAttrValues.Lookup01 ?? null,
      Lookup02: newAttrValues.Lookup02 ?? null,
      Lookup03: newAttrValues.Lookup03 ?? null,
      Boolean01: newAttrValues.Boolean01 ?? null,
      Boolean02: newAttrValues.Boolean02 ?? null,
      Boolean03: newAttrValues.Boolean03 ?? null,
    };
    const res = await fetch("/property/api/insertPropertyAttribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok && property?.PropertyID) {
      // Refresh property attributes
      const attrRes = await fetch(`/property/api/propertyAttributes?propertyId=${property.PropertyID}`);
      const attrData = attrRes.ok ? await attrRes.json() : [];
      setPropertyAttributes(attrData);
      // Auto-select the newly added attribute
      const newAttr = attrData.find((a: any) => a.AttributeID === payload.AttributeID);
      if (newAttr) {
        setSelectedAttrId(newAttr.ID);
      }
    }
    setShowAddAttribute(false);
    setSelectedNewAttrId(null);
    setAddingAttrMode(null);
    setNewAttrValues({});
  };

  // Main render
  return (
    <div className="mx-auto p-4 max-w-5xl">
      <Link
        href="/property"
        className="block mb-4 font-semibold text-purple-700 hover:underline"
      >
        &larr; Back to Properties
      </Link>
      <h1 className="mb-4 font-bold text-2xl">Property Details</h1>
      {/* 3-column property details table */}
      {property ? (
        (() => {
          // ...existing code for 3-column details...
          const col1 = [
            ["PropertyID", property.PropertyID, "Property ID"],
            ["AddressLine1", property.AddressLine1, "Address Line 1"],
            ["AddressLine2", property.AddressLine2, "Address Line 2"],
            ["AddressLine3", property.AddressLine3, "Address Line 3"],
            ["PostCode", property.PostCode, "Postcode"],
            ["UPRN", property.UPRN, "UPRN"],
            ["TypeName", property.TypeName, "Property Type"],
          ];
          const boolKeys = Object.keys(property).filter(
            (k) => typeof property[k as keyof PropertyDetails] === "boolean"
          );
          const col3 = boolKeys.map((k) => [
            k,
            property[k as keyof PropertyDetails],
            k
              .replace(/^is/, "Is ")
              .replace(/([A-Z])/g, " $1")
              .replace(/\bProp\b/, "Property")
              .replace(/\bCommunual\b/, "Communal")
              .replace(/\bDwelling\b/, "Dwelling")
              .replace(/\bLettable\b/, "Lettable")
              .replace(/\bUtility\b/, "Utility")
              .replace(/\bPrivate\b/, "Private")
              .replace(/\bBlock\b/, "Block")
              .replace(/\bVirtual\b/, "Virtual")
              .replace(/\s+/, " ")
              .trim(),
          ]);
          const col1Keys = col1.map(([k]) => k);
          const col3Keys = boolKeys;
          const col2 = Object.entries(property)
            .filter(([k, v]) => !col1Keys.includes(k) && !col3Keys.includes(k))
            .map(([k, v]) => [
              k,
              v,
              k
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase())
                .replace(/\bID\b/, "ID")
                .trim(),
            ]);
          // Pad columns to equal length
          const maxLen = Math.max(col1.length, col2.length, col3.length);
          while (col1.length < maxLen) col1.push(["", "", ""]);
          while (col2.length < maxLen) col2.push(["", "", ""]);
          while (col3.length < maxLen) col3.push(["", "", ""]);
          return (
            <div className="flex flex-row gap-10 mb-4 w-full">
              {[col1, col2, col3].map((col, idx) => (
                <table
                  key={idx}
                  className="border border-gray-300 w-full table-fixed"
                  style={{ minWidth: 0, flex: 1 }}
                >
                  <tbody>
                    {col.map(([key, value, label], i) => {
                      let displayValue = value;
                      if (key === "TakeOnDate" && value) {
                        const d = new Date(value as string);
                        if (!isNaN(d.getTime())) {
                          displayValue = d.toLocaleDateString("en-GB");
                        } else {
                          displayValue = String(value).slice(0, 10);
                        }
                      }
                      return (
                        <tr key={i} style={{ height: "3.2rem" }}>
                          <td
                            className="px-2 py-1 border font-semibold align-middle"
                            style={{
                              width: "180px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {label}
                          </td>
                          <td
                            className="px-2 py-1 border align-middle"
                            style={{
                              width: col === col3 ? "40px" : "220px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              textAlign: col === col3 ? "center" : undefined,
                            }}
                          >
                            {col === col3 && typeof value === "boolean" ? (
                              value ? (
                                <span className="font-bold text-green-600">
                                  &#10003;
                                </span>
                              ) : (
                                <span className="font-bold text-red-600">
                                  &#10007;
                                </span>
                              )
                            ) : (
                              String(displayValue ?? "")
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ))}
            </div>
          );
        })()
      ) : (
        <div className="mb-4">Loading property details...</div>
      )}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <h2 className="mr-4 font-semibold text-lg">Property Attributes</h2>
          <button
            type="button"
            className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded font-semibold text-white transition"
            onClick={handleShowAddAttribute}
          >
            + Add Attribute
          </button>
        </div>
        <div className="flex flex-row gap-8">
          <div className="min-w-0 basis-1/3">
            {propertyAttributes.length === 0 ? (
              <div className="text-gray-500">
                No attributes assigned to this property.
              </div>
            ) : (
              <table className="border border-gray-300 min-w-full">
                <thead>
                  <tr>
                    <th className="px-2 py-1 border">ID</th>
                    <th className="px-2 py-1 border">Attribute Name</th>
                    <th className="px-2 py-1 border">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyAttributes.map((attr) => (
                    <tr
                      key={attr.ID}
                      className={
                        selectedAttrId === attr.ID
                          ? "bg-blue-100 cursor-pointer"
                          : "cursor-pointer"
                      }
                      onClick={() => setSelectedAttrId(attr.ID)}
                    >
                      <td className="px-2 py-1 border">{attr.ID}</td>
                      <td className="px-2 py-1 border">{attr.Name ?? ""}</td>
                      <td className="px-2 py-1 border text-center">
                        {attr.isActive ? (
                          <span className="font-bold text-green-600">
                            &#10003;
                          </span>
                        ) : (
                          <span className="font-bold text-red-600">
                            &#10007;
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="bg-gray-50 p-4 border rounded min-h-[180px] basis-2/3">
            {showAddAttribute ? (
              <div className="mb-4">
                <h3 className="mb-2 font-semibold text-lg">Add Attribute</h3>
                {addingAttrMode !== "form" ? (
                  <>
                    {availableAttributes.length === 0 ? (
                      <div className="text-gray-500">
                        No available attributes.
                      </div>
                    ) : (
                      <select
                        className="mb-2 p-2 border rounded w-full"
                        value={selectedNewAttrId || ""}
                        onChange={(e) => setSelectedNewAttrId(e.target.value)}
                      >
                        <option value="" disabled>
                          Select an attribute...
                        </option>
                        {availableAttributes.map((attr) => (
                          <option key={attr.ID} value={attr.ID}>
                            {attr.Name}
                          </option>
                        ))}
                      </select>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded font-semibold text-gray-700 transition"
                        onClick={() => {
                          setShowAddAttribute(false);
                          setSelectedNewAttrId(null);
                          setAddingAttrMode(null);
                          setNewAttrValues({});
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={`px-3 py-1 rounded bg-purple-600 text-white font-semibold transition ${
                          selectedNewAttrId
                            ? "hover:bg-purple-700"
                            : "opacity-50 cursor-not-allowed"
                        }`}
                        disabled={!selectedNewAttrId}
                        onClick={() => {
                          setAddingAttrMode("form");
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <AddAttributePanel
                      addAttrDescriptors={addAttrDescriptors}
                      addAttrSelectedTab={addAttrSelectedTab}
                      setAddAttrSelectedTab={setAddAttrSelectedTab}
                      newAttrValues={newAttrValues}
                      setNewAttrValues={setNewAttrValues}
                      setShowAddAttribute={setShowAddAttribute}
                      setSelectedNewAttrId={setSelectedNewAttrId}
                      setAddingAttrMode={setAddingAttrMode}
                      onSave={handleSaveNewAttribute}
                    />
                  </>
                )}
              </div>
            ) : selectedAttr ? (
              <>
                <h3 className="mb-2 font-semibold text-lg">
                  Attribute Details
                </h3>
                <TabsPanel
                  attributes={propertyAttributes}
                  descriptors={attributeDescriptors}
                  selectedAttr={selectedAttr}
                />
              </>
            ) : (
              <div className="text-gray-500">
                Select an attribute to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPage;

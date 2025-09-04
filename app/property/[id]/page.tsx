"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

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

interface PropertyDetails {
  PropertyID: number;
  PropertyTypeID: number;
  AddressID: number;
  PropIsVirtual: boolean;
  TakeOnDate: string;
  DisposedDate: string | null;
  DisposalMethod: number | null;
  AddressLine1: string;
  AddressLine2: string | null;
  AddressLine3: string | null;
  PostCode: string | null;
  UPRN: string | null;
  TypeName: string;
  isBlock: boolean;
  isDwelling: boolean;
  isLettable: boolean;
  isCommunual: boolean;
  isVirtual: boolean;
  isUtility: boolean;
  isPrivate: boolean;
  TakeonType: string;
}

export interface PropertyAttribute {
  ID: number;
  ROWSTAMP: string;
  PropertyID: number;
  isActive: number;
  Name?: string;
  Type?: string;
  String01?: string;
  String02?: string;
  String03?: string;
  Date01?: string;
  Date02?: string;
  Date03?: string;
  Int01?: number;
  Int02?: number;
  Int03?: number;
  Decimal01?: number;
  Decimal02?: number;
  Decimal03?: number;
  Lookup01?: number;
  Lookup02?: number;
  Lookup03?: number;
  Boolean01?: number;
  Boolean02?: number;
  Boolean03?: number;
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
  }, [selectedAttr, descriptors]);

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
                  ? "bg-gray-100 border-gray-300 text-gray-500"
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
                <tr key={rowIdx} style={{ height: "3.2rem" }}>
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
                        style={{ verticalAlign: "middle" }}
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

const PropertyPage = ({ params }: PropertyPageProps) => {
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
      if (!selectedAttr) {
        setAttributeDescriptors([]);
        return;
      }
      try {
        // Debug: log the attributeId being sent
        //console.log("Fetching descriptors for attributeId:", selectedAttr.ID);
        const descRes = await fetch(
          `/property/api/attributeDescriptor?attributeId=${selectedAttr.ID}`
        );
        // Debug: log the raw response
        console.log("Descriptor API response status:", descRes.status);
        const descData = descRes.ok ? await descRes.json() : [];
        // Debug: log the data received
        //console.log("Descriptor API response data:", descData);
        setAttributeDescriptors(descData);
      } catch (err) {
        console.error("Descriptor API fetch error:", err);
      }
    }
    fetchDescriptors();
  }, [selectedAttr]);

  // Main render
  return (
    <div className="mx-auto p-4 max-w-5xl">
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
        <h2 className="mb-2 font-semibold text-lg">Property Attributes</h2>
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
            {selectedAttr ? (
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

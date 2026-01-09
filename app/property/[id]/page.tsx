"use client";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { PropertyAttribute, PropertyDetails } from "@/types";

// Image Upload Field Component for Property Attributes
function ImageUploadField({
  label,
  imageData,
  onImageChange,
}: {
  label: string;
  imageData?: string | null;
  onImageChange: (base64: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onImageChange(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => {
            console.error("Error playing video:", err);
          });
        }
      }, 200);
    } catch (error) {
      const err = error as Error;
      alert("Could not access camera: " + err.message);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) {
      alert("No video element");
      return;
    }

    const video = videoRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert("Video not ready yet. Please wait a moment and try again.");
      return;
    }
    
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        alert("Failed to create canvas context");
        return;
      }
      
      ctx.drawImage(video, 0, 0);
      const base64 = canvas.toDataURL("image/jpeg", 0.9);
      onImageChange(base64);
      closeCamera();
    } catch (error) {
      const err = error as Error;
      alert("Error capturing: " + err.message);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onImageChange(null);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="flex flex-col gap-2">
      <label className="mb-1 font-medium text-sm">{label}</label>
      <div
        className={`relative w-40 h-40 border-2 border-dashed rounded-lg ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {imageData ? (
          <div className="relative w-full h-full">
            <Image
              src={imageData}
              alt={label}
              fill
              className="object-cover rounded-lg"
            />
            <button
              onClick={handleRemove}
              type="button"
              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white text-xs"
            >
              ×
            </button>
          </div>
        ) : showCamera ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg"
              style={{ backgroundColor: '#000' }}
            />
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
              <button
                onClick={capturePhoto}
                type="button"
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm"
              >
                Capture
              </button>
              <button
                onClick={closeCamera}
                type="button"
                className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-white text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center w-full h-full gap-2 p-2">
            <p className="text-xs text-gray-500 text-center">
              Drop image here or
            </p>
            <div className="flex flex-col gap-1 w-full">
              <button
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-white text-xs w-full"
              >
                Choose File
              </button>
              <button
                onClick={handleCamera}
                type="button"
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-xs w-full"
              >
                📷 Camera
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}

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
import { LookupGroup, Lookup } from "@/types";

function TabsPanel({ attributes, descriptors, selectedAttr }: TabsPanelProps) {
  const tabs = [1, 2, 3];
  const tabData = tabs.map((tabNum: number) => {
    const tabDescriptors = descriptors.filter((d: any) => d.tab === tabNum);
    return { tabNum, tabDescriptors, hasData: tabDescriptors.length > 0 };
  });
  const [selectedTab, setSelectedTab] = React.useState<number>(1);
  const [lookupGroups, setLookupGroups] = React.useState<LookupGroup[]>([]);
  const [lookups, setLookups] = React.useState<Lookup[]>([]);

  React.useEffect(() => {
    fetch("/lookup/api/lookupGroup")
      .then((res) => res.json())
      .then((data) =>
        setLookupGroups(data.filter((g: LookupGroup) => g.isActive))
      );
  }, []);

  React.useEffect(() => {
    // Fetch all lookups for all groups
    if (lookupGroups.length > 0) {
      Promise.all(
        lookupGroups.map((g) =>
          fetch(`/lookup/api/lookup?groupId=${g.ID}`)
            .then((res) => res.json())
            .then((data) => data as Lookup[])
        )
      ).then((allLookups) => setLookups(allLookups.flat()));
    }
  }, [lookupGroups]);

  const lookupGroupMap = Object.fromEntries(
    lookupGroups.map((g) => [g.ID, g.Name])
  );
  const lookupValueMap = Object.fromEntries(
    lookups.map((l) => [l.ID, l.Value])
  );

  React.useEffect(() => {
    const current = tabData.find((t: any) => t.tabNum === selectedTab);
    if (!current?.hasData) {
      const firstWithData = tabData.find((t: any) => t.hasData);
      if (firstWithData) setSelectedTab(firstWithData.tabNum);
    }
  }, [selectedAttr, descriptors, selectedTab, tabData]);

  function isLookupField(field: string) {
    return /lookup/i.test(field);
  }

  function isImageField(field: string) {
    return /image/i.test(field);
  }

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
                      // If lookup field, show value and group name together
                      if (isLookupField(desc.fieldName)) {
                        const lookupId = selectedAttr[
                          desc.fieldName as keyof PropertyAttribute
                        ] as number | undefined;
                        const lookupValue = lookupId
                          ? lookupValueMap[lookupId]
                          : undefined;
                        value = lookupValue ?? "";
                      } else if (isImageField(desc.fieldName)) {
                        const rawValue = selectedAttr[
                          desc.fieldName as keyof PropertyAttribute
                        ];
                        value = typeof rawValue === "string" ? rawValue : "";
                      } else {
                        value = formatAttrValue(
                          selectedAttr[
                            desc.fieldName as keyof PropertyAttribute
                          ],
                          desc.fieldName
                        );
                      }
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
                            {isImageField(desc.fieldName) && value ? (
                              <div className="relative mt-1 h-32 w-full overflow-hidden rounded border bg-white">
                                <Image
                                  src={value}
                                  alt={desc.label}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <span className="bg-gray-100 px-2 py-1 border rounded">
                                {value}
                              </span>
                            )}
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
  const [lookupGroups, setLookupGroups] = React.useState<LookupGroup[]>([]);
  const [lookups, setLookups] = React.useState<Lookup[]>([]);

  // Helper: check if field is a lookup field
  const isLookupField = (field: string) => {
    return /lookup/i.test(field);
  };

  // Helper: check if field is an integer field
  const isIntegerField = (fieldName: string) => {
    return /^int\d+$/i.test(fieldName);
  };

  // Fetch lookup groups and lookups
  React.useEffect(() => {
    fetch("/lookup/api/lookupGroup")
      .then((res) => res.json())
      .then((data) =>
        setLookupGroups(data.filter((g: LookupGroup) => g.isActive))
      );
  }, []);

  React.useEffect(() => {
    if (lookupGroups.length > 0) {
      Promise.all(
        lookupGroups.map((g) =>
          fetch(`/lookup/api/lookup?groupId=${g.ID}`)
            .then((res) => res.json())
            .then((data) => data as Lookup[])
        )
      ).then((allLookups) => setLookups(allLookups.flat()));
    }
  }, [lookupGroups]);

  const lookupGroupMap = Object.fromEntries(
    lookupGroups.map((g) => [g.ID, g.Name])
  );

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
              {desc.inputType === "image" ? (
                <ImageUploadField
                  label={desc.label}
                  imageData={newAttrValues[desc.fieldName]}
                  onImageChange={(base64) =>
                    setNewAttrValues({
                      ...newAttrValues,
                      [desc.fieldName]: base64 || "",
                    })
                  }
                />
              ) : isLookupField(desc.fieldName) ? (
                <select
                  className="p-2 border rounded"
                  value={newAttrValues[desc.fieldName] || ""}
                  onChange={(e) =>
                    setNewAttrValues({
                      ...newAttrValues,
                      [desc.fieldName]: e.target.value,
                    })
                  }
                >
                  <option value="">Select...</option>
                  {lookups
                    .filter(
                      (lookup) =>
                        desc.lookupGroupId &&
                        lookup.LookupGroupID === desc.lookupGroupId
                    )
                    .map((lookup) => (
                      <option key={lookup.ID} value={lookup.ID}>
                        {lookup.Value}
                      </option>
                    ))}
                </select>
              ) : desc.inputType === "textarea" ? (
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
                  onChange={(e) => {
                    let value = e.target.value;
                    // If this is an integer field, only allow numeric input
                    if (isIntegerField(desc.fieldName)) {
                      // Remove any non-numeric characters (allow negative sign at start)
                      value = value.replace(/[^-0-9]/g, "");
                      // Only allow one negative sign at the beginning
                      if (value.indexOf("-") > 0) {
                        value = value.replace(/-/g, "");
                      }
                      // Prevent multiple negative signs
                      if ((value.match(/-/g) || []).length > 1) {
                        value = value.replace(/-+/g, "-");
                      }
                    }
                    setNewAttrValues({
                      ...newAttrValues,
                      [desc.fieldName]: value,
                    });
                  }}
                  inputMode={
                    isIntegerField(desc.fieldName) ? "numeric" : undefined
                  }
                  pattern={
                    isIntegerField(desc.fieldName) ? "^-?[0-9]*$" : undefined
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
  const inferInputType = (fieldName: string) => {
    if (/image/i.test(fieldName)) return "image";
    if (/date/i.test(fieldName)) return "date";
    if (/email/i.test(fieldName)) return "email";
    if (/phone|tel/i.test(fieldName)) return "tel";
    if (
      /^int\d+$/i.test(fieldName) ||
      /number|qty|amount|count|id$/i.test(fieldName)
    )
      return "number";
    if (/desc|note|comment/i.test(fieldName)) return "textarea";
    return "text";
  };

  // Helper: check if field is an integer field
  const isIntegerField = (fieldName: string) => {
    return /^int\d+$/i.test(fieldName);
  };

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
  const [parentProperties, setParentProperties] = useState<PropertyDetails[]>(
    []
  );
  const [childProperties, setChildProperties] = useState<PropertyDetails[]>([]);
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
        // Fetch parent property
        const parentRes = await fetch(
          `/property/api/getParentProperty?propertyId=${propData.PropertyID}`
        );
        if (parentRes.ok) {
          const parents = await parentRes.json();
          setParentProperties(parents || []);
        } else {
          setParentProperties([]);
        }
        // Fetch child properties
        const childRes = await fetch(
          `/property/api/getChildProperties?propertyId=${propData.PropertyID}`
        );
        if (childRes.ok) {
          const children = await childRes.json();
          setChildProperties(children || []);
        } else {
          setChildProperties([]);
        }
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

  // Function to refetch property attributes
  const refetchPropertyAttributes = async () => {
    if (property?.PropertyID) {
      const attrRes = await fetch(
        `/property/api/propertyAttributes?propertyId=${property.PropertyID}`
      );
      const attrData = attrRes.ok ? await attrRes.json() : [];
      setPropertyAttributes(attrData);
    }
  };

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
      Image01: newAttrValues.Image01 ?? null,
      Image02: newAttrValues.Image02 ?? null,
      Image03: newAttrValues.Image03 ?? null,
    };

    const response = await fetch("/property/api/insertPropertyAttribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      // Refresh the property attributes list after successful save
      await refetchPropertyAttributes();
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
        <>
          {(() => {
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
              .filter(
                ([k, v]) => !col1Keys.includes(k) && !col3Keys.includes(k)
              )
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
          })()}

          {/* Hierarchy Section */}
          <div className="mb-6">
            <h2 className="mb-2 font-semibold text-lg">Hierarchy</h2>
            {parentProperties.length === 0 && childProperties.length === 0 ? (
              <div className="text-gray-500">
                No parent or child properties.
              </div>
            ) : (
              <table className="border border-gray-300 min-w-full">
                <thead>
                  <tr>
                    <th className="px-2 py-1 border">ID</th>
                    <th className="px-2 py-1 border">Address</th>
                    <th className="px-2 py-1 border">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {parentProperties.map((p) => (
                    <tr key={"parent-" + p.PropertyID} className="bg-green-50">
                      <td className="px-2 py-1 border">
                        <Link
                          href={`/property/${p.PropertyID}`}
                          className="font-bold text-green-700 underline"
                        >
                          {p.PropertyID}
                        </Link>
                      </td>
                      <td className="px-2 py-1 border">
                        <Link
                          href={`/property/${p.PropertyID}`}
                          className="font-bold text-green-700 underline"
                        >
                          {p.AddressLine1}
                        </Link>
                      </td>
                      <td className="px-2 py-1 border font-bold text-green-700">
                        {p.TypeName}
                      </td>
                    </tr>
                  ))}
                  {childProperties.map((p) => (
                    <tr key={"child-" + p.PropertyID}>
                      <td className="px-2 py-1 border">
                        <Link
                          href={`/property/${p.PropertyID}`}
                          className="text-black underline"
                        >
                          {p.PropertyID}
                        </Link>
                      </td>
                      <td className="px-2 py-1 border">
                        <Link
                          href={`/property/${p.PropertyID}`}
                          className="text-black underline"
                        >
                          {p.AddressLine1}
                        </Link>
                      </td>
                      <td className="px-2 py-1 border">{p.TypeName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
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
                  {(() => {
                    // Group attributes by AttributeGroup
                    const groupedAttrs: {
                      [key: string]: typeof propertyAttributes;
                    } = {};

                    propertyAttributes.forEach((attr: any) => {
                      const groupName =
                        attr.AttributeGroupName || "Ungrouped Attributes";
                      if (!groupedAttrs[groupName]) {
                        groupedAttrs[groupName] = [];
                      }
                      groupedAttrs[groupName].push(attr);
                    });

                    // Sort group names (Ungrouped always last)
                    const sortedGroupNames = Object.keys(groupedAttrs).sort(
                      (a, b) => {
                        if (a === "Ungrouped Attributes") return 1;
                        if (b === "Ungrouped Attributes") return -1;
                        return a.localeCompare(b);
                      }
                    );

                    return sortedGroupNames
                      .map((groupName) => [
                        // Group header row
                        <tr key={`header-${groupName}`}>
                          <td
                            colSpan={3}
                            className="bg-purple-600 px-2 py-2 border font-semibold text-white text-center"
                          >
                            {groupName}
                          </td>
                        </tr>,
                        // Attribute rows for this group
                        ...groupedAttrs[groupName].map((attr: any) => (
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
                            <td className="px-2 py-1 border">
                              {attr.Name ?? ""}
                            </td>
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
                        )),
                      ])
                      .flat();
                  })()}
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

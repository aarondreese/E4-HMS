"use client";
import { useState, useEffect } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { LookupGroup } from "@/lib/lookupGroup";

interface Attribute {
  ID: number;
  Name: string;
  isActive: number;
}

function DraggableFieldPill({ field }: { field: string }) {
  const [{ isDragging }, drag] = useDrag({
    type: "FIELD",
    item: { field },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  return (
    <li
      ref={drag}
      className={`inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 font-medium shadow-sm cursor-move text-center align-middle${
        isDragging ? " opacity-50" : ""
      }`}
      style={{ margin: 0 }}
    >
      <span className="flex justify-center items-center w-full">{field}</span>
    </li>
  );
}

function AttributeDetailPage({ params }: { params: { id: string } }) {
  // State for editing label in grid cell
  const [editingCell, setEditingCell] = useState<{
    tab: number;
    row: number;
    col: number;
    field: string;
  } | null>(null);
  const [labelInput, setLabelInput] = useState("");
  // Track newly added fields for highlight
  const [newFields, setNewFields] = useState<
    { tab: number; row: number; col: number; field: string }[]
  >([]);
  const [lookupGroups, setLookupGroups] = useState<LookupGroup[]>([]);
  const [selectedLookupGroupId, setSelectedLookupGroupId] = useState<
    number | null
  >(null);

  const handleRemoveField = (
    tab: number,
    row: number,
    col: number,
    field: string
  ) => {
    setDescriptors((prev) =>
      prev.filter(
        (d) =>
          !(
            d.TabNumber === tab &&
            d.RowNumber === row &&
            d.ColumnNumber === col &&
            d.FieldName === field
          )
      )
    );
    setNewFields((prev) =>
      prev.filter(
        (f) =>
          !(
            f.tab === tab &&
            f.row === row &&
            f.col === col &&
            f.field === field
          )
      )
    );
  };

  useEffect(() => {
    // Fetch active LookupGroups
    fetch("/lookup/api/lookupGroup")
      .then((res) => res.json())
      .then((data) =>
        setLookupGroups(data.filter((g: LookupGroup) => g.isActive))
      );
  }, []);

  // In AttributeDetailPage, after fetching lookupGroups, create a map for fast lookup
  const lookupGroupMap = Object.fromEntries(
    lookupGroups.map((g) => [g.ID, g.Name])
  );

  // Drop target for empty grid cells
  const GridCell = ({ rowNum, colNum }: { rowNum: number; colNum: number }) => {
    const cell = descriptors.find(
      (d) =>
        d.TabNumber === activeTab + 1 &&
        d.RowNumber === rowNum &&
        d.ColumnNumber === colNum
    );
    const newCell = newFields.find(
      (f) => f.tab === activeTab + 1 && f.row === rowNum && f.col === colNum
    );
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: "FIELD",
      canDrop: () => !cell,
      drop: (item: { field: string }) => {
        if (!cell) {
          setDescriptors((prev) => [
            ...prev,
            {
              TabNumber: activeTab + 1,
              RowNumber: rowNum,
              ColumnNumber: colNum,
              Label: "",
              FieldName: item.field,
            },
          ]);
          setNewFields((prev) => [
            ...prev,
            { tab: activeTab + 1, row: rowNum, col: colNum, field: item.field },
          ]);
          setEditingCell({
            tab: activeTab + 1,
            row: rowNum,
            col: colNum,
            field: item.field,
          });
          setLabelInput("");
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });

    // Handle label save
    const handleLabelSave = () => {
      setDescriptors((prev) =>
        prev.map((d) => {
          if (
            d.TabNumber === editingCell?.tab &&
            d.RowNumber === editingCell?.row &&
            d.ColumnNumber === editingCell?.col &&
            d.FieldName === editingCell?.field
          ) {
            // If Lookup field, also save LookupGroupID
            if (isLookupField(d.FieldName)) {
              return {
                ...d,
                Label: labelInput,
                LookupGroupID: selectedLookupGroupId,
              };
            }
            return { ...d, Label: labelInput };
          }
          return d;
        })
      );
      setEditingCell(null);
      setLabelInput("");
      setSelectedLookupGroupId(null);
    };

    // Helper to detect if a field is a Lookup field
    function isLookupField(field: string) {
      return /lookup/i.test(field); // or use type info if available
    }

    return (
      <td
        ref={drop as unknown as React.Ref<HTMLTableDataCellElement>}
        className="px-2 py-1 border align-middle"
        style={{
          minHeight: "2.5rem",
          height: "2.5rem",
          background: newCell
            ? "#d1fae5"
            : isOver && canDrop
            ? "#e0e7ff"
            : undefined,
        }}
      >
        {editingCell &&
        editingCell.tab === activeTab + 1 &&
        editingCell.row === rowNum &&
        editingCell.col === colNum ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLabelSave();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              className="px-2 py-1 border rounded w-24"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              autoFocus
              placeholder="Enter label"
            />
            {/* If Lookup field, show LookupGroup dropdown */}
            {isLookupField(editingCell.field) && (
              <select
                className="ml-2 px-2 py-1 border rounded"
                value={selectedLookupGroupId ?? ""}
                onChange={(e) =>
                  setSelectedLookupGroupId(Number(e.target.value))
                }
                required
              >
                <option value="" disabled>
                  Select Lookup Group
                </option>
                {lookupGroups.map((g) => (
                  <option key={g.ID} value={g.ID}>
                    {g.Name}
                  </option>
                ))}
              </select>
            )}
            <button
              type="submit"
              className="bg-blue-500 px-2 py-1 rounded text-white"
            >
              Save
            </button>
          </form>
        ) : cell ? (
          <span className="flex items-center gap-2">
            <span
              onDoubleClick={() => {
                setEditingCell({
                  tab: activeTab + 1,
                  row: rowNum,
                  col: colNum,
                  field: cell.FieldName,
                });
                setLabelInput(cell.Label || "");
              }}
              className="cursor-pointer"
            >
              {cell.Label
                ? `${cell.Label} (${cell.FieldName})`
                : `( ${cell.FieldName} )`}
              {/* If lookup field and LookupGroupID, show group name */}
              {isLookupField(cell.FieldName) &&
                cell.LookupGroupID &&
                lookupGroupMap[cell.LookupGroupID] && (
                  <span className="ml-1 text-purple-700 text-xs">
                    [ {lookupGroupMap[cell.LookupGroupID]} ]
                  </span>
                )}
            </span>
            {newCell && (
              <button
                type="button"
                className="bg-red-500 ml-2 px-2 py-1 rounded text-white"
                onClick={() =>
                  handleRemoveField(
                    activeTab + 1,
                    rowNum,
                    colNum,
                    cell.FieldName
                  )
                }
                title="Remove field"
              >
                ×
              </button>
            )}
          </span>
        ) : null}
        {/* Debug: log lookup info for each populated cell */}
        {cell &&
          (() => {
            if (isLookupField(cell.FieldName)) {
              console.debug("Lookup cell:", {
                FieldName: cell.FieldName,
                LookupGroupID: cell.LookupGroupID,
                GroupName: lookupGroupMap[cell.LookupGroupID],
                Descriptor: cell,
              });
            }
            return null;
          })()}
      </td>
    );
  };
  // AttributeDescriptor grid data
  const [descriptors, setDescriptors] = useState<any[]>([]);

  // All possible fields in Attribute table (excluding ID, ROWSTAMP, Name, isActive)
  const [allFields, setAllFields] = useState<{ name: string; type: string }[]>(
    []
  );

  useEffect(() => {
    async function fetchFields() {
      const res = await fetch("/Attribute/api/fields");
      if (res.ok) {
        const data = await res.json();
        setAllFields(data);
      }
    }
    fetchFields();
  }, []);

  // Get used fields from descriptors
  const usedFields = descriptors.map((d) => d.FieldName);
  const unusedFields = allFields.filter((f) => !usedFields.includes(f.name));

  // Selection state for unused fields
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };
  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function fetchAttribute() {
      const res = await fetch(`/Attribute/api?id=${params.id}`);
      if (res.ok) {
        setAttribute(await res.json());
      } else {
        setAttribute(null);
      }
      setLoading(false);
    }
    fetchAttribute();
  }, [params.id]);

  useEffect(() => {
    fetch(`/Attribute/api/descriptors?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => setDescriptors(data));
  }, [params.id]);

  // Debug: log the descriptors array that populates the grid
  useEffect(() => {
    console.log("Grid descriptors:", descriptors);
  }, [descriptors]);

  // Save newly added fields to backend
  const handleSaveUpdates = async () => {
    if (newFields.length === 0) return;
    const payload = newFields.map((f) => {
      const desc = descriptors.find(
        (d) =>
          d.TabNumber === f.tab &&
          d.RowNumber === f.row &&
          d.ColumnNumber === f.col &&
          d.FieldName === f.field
      );
      return {
        AttributeID: params.id,
        TabNumber: f.tab,
        RowNumber: f.row,
        ColumnNumber: f.col,
        FieldName: f.field,
        Label: desc?.Label || "",
      };
    });
    await fetch("/Attribute/api/descriptors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setNewFields([]);
    // Optionally, refresh descriptors from backend
    fetch(`/Attribute/api/descriptors?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => setDescriptors(data));
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!attribute) {
    return <div>Attribute not found.</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="mx-auto p-4 max-w-2xl">
        <div className="bg-gray-50 mb-6 p-4 border rounded">
          <h2 className="mb-2 font-bold text-xl">Attribute Details</h2>
          <div>
            <strong>ID:</strong> {attribute.ID}
          </div>
          <div>
            <strong>Name:</strong> {attribute.Name}
          </div>
          <div>
            <strong>isActive:</strong> {attribute.isActive}
          </div>
        </div>
        <div className="mb-4">
          <div className="flex mb-2">
            {["Tab 1", "Tab 2", "Tab 3"].map((tab, idx) => (
              <button
                key={tab}
                className={`px-4 py-2 border-b-2 ${
                  activeTab === idx
                    ? "border-blue-600 font-bold"
                    : "border-transparent"
                }`}
                onClick={() => setActiveTab(idx)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <table className="border border-gray-300 min-w-full table-fixed">
            <colgroup>
              <col style={{ width: "50%" }} />
              <col style={{ width: "50%" }} />
            </colgroup>
            <tbody>
              {[1, 2, 3, 4, 5].map((rowNum) => (
                <tr key={rowNum} style={{ minHeight: "2.5rem" }}>
                  {[1, 2].map((colNum) => (
                    <GridCell key={colNum} rowNum={rowNum} colNum={colNum} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Save Updates button if there are green cells */}
        {newFields.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              type="button"
              className="bg-green-600 hover:bg-green-700 shadow px-4 py-2 rounded text-white"
              onClick={handleSaveUpdates}
            >
              Save Updates
            </button>
          </div>
        )}
        {/* Unused fields list under the table */}
        <div className="mt-6 mb-6">
          <h3 className="mb-2 font-semibold">Unused Fields</h3>
          <div
            className="flex items-start w-full"
            style={{
              gap: "0.5rem",
              justifyContent: "flex-start",
              paddingLeft: 0,
            }}
          >
            {(() => {
              // Group unused fields by field name prefix (ignore trailing numbers)
              const unusedFieldObjs = allFields.filter(
                (f) =>
                  !descriptors.some((d) => d.FieldName === f.name) &&
                  !newFields.some((nf) => nf.field === f.name)
              );
              const prefixGroups: { [prefix: string]: { name: string }[] } = {};
              unusedFieldObjs.forEach((f) => {
                const prefix = f.name.replace(/\d+$/, "");
                if (!prefixGroups[prefix]) prefixGroups[prefix] = [];
                prefixGroups[prefix].push(f);
              });
              return Object.values(prefixGroups).map((fields, idx) => (
                <ul
                  key={idx}
                  className="flex flex-col gap-2 bg-white border rounded"
                  style={{
                    minWidth: 120,
                    maxWidth: 180,
                    whiteSpace: "nowrap",
                    fontSize: "0.95rem",
                    padding: 0,
                  }}
                >
                  {fields.map((f) => (
                    <DraggableFieldPill key={f.name} field={f.name} />
                  ))}
                </ul>
              ));
            })()}
          </div>
        </div>
        <a href="/Attribute" className="text-blue-600 underline">
          Back to Attributes
        </a>
      </div>
    </DndProvider>
  );
}

export default AttributeDetailPage;

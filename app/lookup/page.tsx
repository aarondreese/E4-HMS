"use client";

import React, { useEffect, useState } from "react";
import { LookupGroup } from "@/lib/lookupGroup";
import { Lookup } from "@/lib/lookup";
import Link from "next/link";

export default function LookupManager() {
  const [groups, setGroups] = useState<LookupGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<LookupGroup | null>(null);
  const [lookups, setLookups] = useState<Lookup[]>([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    Name: "",
    Description: "",
    IsActive: true,
  });
  const [showLookupForm, setShowLookupForm] = useState(false);
  const [newLookup, setNewLookup] = useState({
    Value: "",
    isActive: 1,
    MetaData: "",
  });

  useEffect(() => {
    fetch("/lookup/api/lookupGroup")
      .then((r) => r.json())
      .then(setGroups);
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetch(`/lookup/api/lookup?groupId=${selectedGroup.ID}`)
        .then((r) => r.json())
        .then(setLookups);
    } else {
      setLookups([]);
    }
  }, [selectedGroup]);

  const handleAddGroup = async () => {
    await fetch("/lookup/api/lookupGroup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGroup),
    });
    setShowGroupForm(false);
    setNewGroup({ Name: "", Description: "", IsActive: true });
    fetch("/lookup/api/lookupGroup")
      .then((r) => r.json())
      .then(setGroups);
  };

  const handleAddLookup = async () => {
    if (!selectedGroup) return;
    await fetch("/lookup/api/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newLookup, LookupGroupID: selectedGroup.ID }),
    });
    setShowLookupForm(false);
    setNewLookup({ Value: "", isActive: 1, MetaData: "" });
    fetch(`/lookup/api/lookup?groupId=${selectedGroup.ID}`)
      .then((r) => r.json())
      .then(setLookups);
  };

  return (
    <div className="mx-auto p-6 max-w-5xl">
      <Link
        href="/"
        className="block mb-4 font-semibold text-purple-700 hover:underline"
      >
        &larr; Back to Main Menu
      </Link>
      <h1 className="mb-4 font-bold text-2xl">Lookup Group Management</h1>
      <div className="flex gap-8">
        <div className="w-1/2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg">Lookup Groups</h2>
            <button
              className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-white"
              onClick={() => setShowGroupForm(true)}
            >
              + Add Group
            </button>
          </div>
          <table className="mb-4 border w-full">
            <thead>
              <tr>
                <th className="px-2 py-1 border">ID</th>
                <th className="px-2 py-1 border">Name</th>
                <th className="px-2 py-1 border">Active</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr
                  key={g.ID}
                  className={
                    selectedGroup?.ID === g.ID
                      ? "bg-blue-100 cursor-pointer"
                      : "cursor-pointer"
                  }
                  onClick={() => setSelectedGroup(g)}
                >
                  <td className="px-2 py-1 border">{g.ID}</td>
                  <td className="px-2 py-1 border">{g.Name}</td>
                  <td className="px-2 py-1 border text-center">
                    {g.isActive ? (
                      <span className="font-bold text-green-600">&#10003;</span>
                    ) : (
                      <span className="font-bold text-red-600">&#10007;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {showGroupForm && (
            <div className="bg-gray-100 mb-4 p-4 rounded">
              <h3 className="mb-2 font-semibold">Add Lookup Group</h3>
              <input
                className="mb-2 p-1 border w-full"
                placeholder="Name"
                value={newGroup.Name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, Name: e.target.value })
                }
              />
              <input
                className="mb-2 p-1 border w-full"
                placeholder="Description"
                value={newGroup.Description}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, Description: e.target.value })
                }
              />
              <label className="block mb-2">
                <input
                  type="checkbox"
                  checked={newGroup.IsActive}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, IsActive: e.target.checked })
                  }
                />{" "}
                Active
              </label>
              <button
                className="bg-green-600 mr-2 px-3 py-1 rounded text-white"
                onClick={handleAddGroup}
              >
                Save
              </button>
              <button
                className="bg-gray-400 px-3 py-1 rounded text-white"
                onClick={() => setShowGroupForm(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div className="w-1/2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg">Lookups</h2>
            {selectedGroup && (
              <button
                className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-white"
                onClick={() => setShowLookupForm(true)}
              >
                + Add Lookup
              </button>
            )}
          </div>
          {selectedGroup ? (
            <>
              <table className="mb-4 border w-full">
                <thead>
                  <tr>
                    <th className="px-2 py-1 border">ID</th>
                    <th className="px-2 py-1 border">Value</th>
                    <th className="px-2 py-1 border">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {lookups.map((l) => (
                    <tr key={l.ID}>
                      <td className="px-2 py-1 border">{l.ID}</td>
                      <td className="px-2 py-1 border">{l.Value}</td>
                      <td className="px-2 py-1 border text-center">
                        {l.isActive ? (
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
              {showLookupForm && (
                <div className="bg-gray-100 mb-4 p-4 rounded">
                  <h3 className="mb-2 font-semibold">Add Lookup</h3>
                  <input
                    className="mb-2 p-1 border w-full"
                    placeholder="Value"
                    value={newLookup.Value}
                    onChange={(e) =>
                      setNewLookup({ ...newLookup, Value: e.target.value })
                    }
                  />
                  <label className="block mb-2">
                    <input
                      type="checkbox"
                      checked={!!newLookup.isActive}
                      onChange={(e) =>
                        setNewLookup({
                          ...newLookup,
                          isActive: e.target.checked ? 1 : 0,
                        })
                      }
                    />{" "}
                    Active
                  </label>
                  <input
                    className="mb-2 p-1 border w-full"
                    placeholder="MetaData (optional XML)"
                    value={newLookup.MetaData}
                    onChange={(e) =>
                      setNewLookup({ ...newLookup, MetaData: e.target.value })
                    }
                  />
                  <button
                    className="bg-green-600 mr-2 px-3 py-1 rounded text-white"
                    onClick={handleAddLookup}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-400 px-3 py-1 rounded text-white"
                    onClick={() => setShowLookupForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500">
              Select a Lookup Group to view lookups.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

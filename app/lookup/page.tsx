'use client';

import React, { useEffect, useState } from "react";
import { LookupGroup } from "@/lib/lookupGroup";
import { Lookup } from "@/lib/lookup";
import Link from "next/link";

export default function LookupManager() {
  const [groups, setGroups] = useState<LookupGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<LookupGroup | null>(null);
  const [lookups, setLookups] = useState<Lookup[]>([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ Name: "", Description: "", IsActive: true });
  const [showLookupForm, setShowLookupForm] = useState(false);
  const [newLookup, setNewLookup] = useState({ Value: "", isActive: 1, MetaData: "" });

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
    fetch("/lookup/api/lookupGroup").then((r) => r.json()).then(setGroups);
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
    fetch(`/lookup/api/lookup?groupId=${selectedGroup.ID}`).then((r) => r.json()).then(setLookups);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link href="/" className="block mb-4 font-semibold text-purple-700 hover:underline">&larr; Back to Main Menu</Link>
      <h1 className="text-2xl font-bold mb-4">Lookup Group Management</h1>
      <div className="flex gap-8">
        <div className="w-1/2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Lookup Groups</h2>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded" onClick={() => setShowGroupForm(true)}>
              + Add Group
            </button>
          </div>
          <table className="w-full border mb-4">
            <thead>
              <tr>
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Active</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr
                  key={g.ID}
                  className={selectedGroup?.ID === g.ID ? "bg-blue-100 cursor-pointer" : "cursor-pointer"}
                  onClick={() => setSelectedGroup(g)}
                >
                  <td className="border px-2 py-1">{g.ID}</td>
                  <td className="border px-2 py-1">{g.Name}</td>
                  <td className="border px-2 py-1 text-center">{g.isActive ? <span className="text-green-600 font-bold">&#10003;</span> : <span className="text-red-600 font-bold">&#10007;</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {showGroupForm && (
            <div className="bg-gray-100 p-4 rounded mb-4">
              <h3 className="font-semibold mb-2">Add Lookup Group</h3>
              <input
                className="border p-1 mb-2 w-full"
                placeholder="Name"
                value={newGroup.Name}
                onChange={(e) => setNewGroup({ ...newGroup, Name: e.target.value })}
              />
              <input
                className="border p-1 mb-2 w-full"
                placeholder="Description"
                value={newGroup.Description}
                onChange={(e) => setNewGroup({ ...newGroup, Description: e.target.value })}
              />
              <label className="block mb-2">
                <input
                  type="checkbox"
                  checked={newGroup.IsActive}
                  onChange={(e) => setNewGroup({ ...newGroup, IsActive: e.target.checked })}
                /> Active
              </label>
              <button className="bg-green-600 text-white px-3 py-1 rounded mr-2" onClick={handleAddGroup}>
                Save
              </button>
              <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => setShowGroupForm(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
        <div className="w-1/2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Lookups</h2>
            {selectedGroup && (
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded" onClick={() => setShowLookupForm(true)}>
                + Add Lookup
              </button>
            )}
          </div>
          {selectedGroup ? (
            <>
              <table className="w-full border mb-4">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">ID</th>
                    <th className="border px-2 py-1">Value</th>
                    <th className="border px-2 py-1">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {lookups.map((l) => (
                    <tr key={l.ID}>
                      <td className="border px-2 py-1">{l.ID}</td>
                      <td className="border px-2 py-1">{l.Value}</td>
                      <td className="border px-2 py-1 text-center">{l.isActive ? <span className="text-green-600 font-bold">&#10003;</span> : <span className="text-red-600 font-bold">&#10007;</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {showLookupForm && (
                <div className="bg-gray-100 p-4 rounded mb-4">
                  <h3 className="font-semibold mb-2">Add Lookup</h3>
                  <input
                    className="border p-1 mb-2 w-full"
                    placeholder="Value"
                    value={newLookup.Value}
                    onChange={(e) => setNewLookup({ ...newLookup, Value: e.target.value })}
                  />
                  <label className="block mb-2">
                    <input
                      type="checkbox"
                      checked={!!newLookup.isActive}
                      onChange={(e) => setNewLookup({ ...newLookup, isActive: e.target.checked ? 1 : 0 })}
                    /> Active
                  </label>
                  <input
                    className="border p-1 mb-2 w-full"
                    placeholder="MetaData (optional XML)"
                    value={newLookup.MetaData}
                    onChange={(e) => setNewLookup({ ...newLookup, MetaData: e.target.value })}
                  />
                  <button className="bg-green-600 text-white px-3 py-1 rounded mr-2" onClick={handleAddLookup}>
                    Save
                  </button>
                  <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => setShowLookupForm(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500">Select a Lookup Group to view lookups.</div>
          )}
        </div>
      </div>
    </div>
  );
}

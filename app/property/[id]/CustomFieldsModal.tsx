import React, { useEffect, useState } from 'react';

interface CustomFieldDefinition {
  ID: number;
  FieldName: string;
  FieldLabel: string;
  CustomFieldTypeID: number;
  TabNumber: number;
  RowNumber: number;
  ColNumber: number;
  Rules?: string | null;
  FieldTypeDescription?: string | null;
  FieldTypeDefinition?: string | null;
  ValueID?: number | null;
  CustomDate?: string | null;
  CustomDateTime?: string | null;
  CustomTime?: string | null;
  CustomInt?: number | null;
  CustomDecimal?: number | null;
  CustomShortText?: string | null;
  CustomLongText?: string | null;
  CustomMaxText?: string | null;
  CustomBoolean?: number | null;
  CustomImageLink?: string | null;
}

interface CustomFieldsModalProps {
  propertyId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomFieldsModal({
  propertyId,
  isOpen,
  onClose,
}: CustomFieldsModalProps) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [selectedTab, setSelectedTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<number, any>>({});

  const fetchCustomFields = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/property/api/customFieldValues?propertyId=${propertyId}`
      );
      if (res.ok) {
        const data = await res.json();
        setFields(data);
        
        // Initialize field values from existing data
        const initialValues: Record<number, any> = {};
        data.forEach((field: CustomFieldDefinition) => {
          // Normalize boolean value: true/1 -> 1, false/0 -> 0, null/undefined -> null
          let boolValue = field.CustomBoolean;
          if (boolValue === true) boolValue = 1;
          else if (boolValue === false) boolValue = 0;
          else if (boolValue !== 1 && boolValue !== 0) boolValue = null;
          
          initialValues[field.ID] = {
            CustomDate: field.CustomDate,
            CustomDateTime: field.CustomDateTime,
            CustomTime: field.CustomTime,
            CustomInt: field.CustomInt,
            CustomDecimal: field.CustomDecimal,
            CustomShortText: field.CustomShortText,
            CustomLongText: field.CustomLongText,
            CustomMaxText: field.CustomMaxText,
            CustomBoolean: boolValue,
            CustomImageLink: field.CustomImageLink,
          };
        });
        setFieldValues(initialValues);
      }
    } catch (error) {
      console.error('Error fetching custom fields:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && propertyId) {
      fetchCustomFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, propertyId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each modified field
      const savePromises = Object.entries(fieldValues).map(([fieldId, values]) => {
        return fetch('/property/api/customFieldValues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId,
            fieldId: parseInt(fieldId),
            values,
          }),
        });
      });

      await Promise.all(savePromises);
      alert('Custom fields saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving custom fields:', error);
      alert('Error saving custom fields');
    } finally {
      setSaving(false);
    }
  };

  const updateFieldValue = (fieldId: number, dataType: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: {
        ...(prev[fieldId] || {}),
        [dataType]: value,
      },
    }));
  };

  const renderInput = (field: CustomFieldDefinition) => {
    const fieldType = field.FieldTypeDefinition || field.FieldTypeDescription || '';
    const currentValues = fieldValues[field.ID] || {};

    // Determine which data type field to use based on FieldTypeDefinition
    if (fieldType.toLowerCase().includes('date') && !fieldType.toLowerCase().includes('time')) {
      const dateValue = currentValues.CustomDate 
        ? new Date(currentValues.CustomDate).toISOString().split('T')[0]
        : '';
      return (
        <input
          type="date"
          className="px-3 py-2 border rounded-md w-full"
          value={dateValue}
          onChange={(e) => updateFieldValue(field.ID, 'CustomDate', e.target.value || null)}
        />
      );
    }

    if (fieldType.toLowerCase().includes('datetime')) {
      const dateTimeValue = currentValues.CustomDateTime
        ? new Date(currentValues.CustomDateTime).toISOString().slice(0, 16)
        : '';
      return (
        <input
          type="datetime-local"
          className="px-3 py-2 border rounded-md w-full"
          value={dateTimeValue}
          onChange={(e) => updateFieldValue(field.ID, 'CustomDateTime', e.target.value || null)}
        />
      );
    }

    if (fieldType.toLowerCase().includes('time')) {
      return (
        <input
          type="time"
          className="px-3 py-2 border rounded-md w-full"
          value={currentValues.CustomTime || ''}
          onChange={(e) => updateFieldValue(field.ID, 'CustomTime', e.target.value || null)}
        />
      );
    }

    if (fieldType.toLowerCase().includes('int') || fieldType.toLowerCase().includes('integer')) {
      return (
        <input
          type="number"
          className="px-3 py-2 border rounded-md w-full"
          value={currentValues.CustomInt ?? ''}
          onChange={(e) => updateFieldValue(field.ID, 'CustomInt', e.target.value ? parseInt(e.target.value) : null)}
          step="1"
        />
      );
    }

    if (fieldType.toLowerCase().includes('decimal') || fieldType.toLowerCase().includes('number')) {
      return (
        <input
          type="number"
          className="px-3 py-2 border rounded-md w-full"
          value={currentValues.CustomDecimal ?? ''}
          onChange={(e) => updateFieldValue(field.ID, 'CustomDecimal', e.target.value ? parseFloat(e.target.value) : null)}
          step="0.01"
        />
      );
    }

    if (fieldType.toLowerCase().includes('bool') || fieldType.toLowerCase().includes('checkbox')) {
      const boolValue = currentValues.CustomBoolean;
      const getNextValue = () => {
        if (boolValue === null || boolValue === undefined) return 1;
        if (boolValue === 1) return 0;
        return null;
      };
      
      return (
        <button
          type="button"
          onClick={() => updateFieldValue(field.ID, 'CustomBoolean', getNextValue())}
          className={`relative inline-flex items-center h-8 w-16 rounded-full transition-colors ${
            boolValue === 1
              ? 'bg-green-500'
              : boolValue === 0
              ? 'bg-red-500'
              : 'bg-gray-400'
          }`}
          title={boolValue === 1 ? 'On' : boolValue === 0 ? 'Off' : 'Not Set'}
        >
          <span
            className={`inline-block w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
              boolValue === 1 ? 'translate-x-9' : boolValue === 0 ? 'translate-x-1' : 'translate-x-5'
            }`}
          />
          <span className="absolute inset-0 flex justify-center items-center font-semibold text-white text-xs">
            {boolValue === 1 ? 'ON' : boolValue === 0 ? 'OFF' : '?'}
          </span>
        </button>
      );
    }

    if (fieldType.toLowerCase().includes('longtext') || fieldType.toLowerCase().includes('textarea')) {
      return (
        <textarea
          className="px-3 py-2 border rounded-md w-full"
          rows={4}
          value={currentValues.CustomLongText || ''}
          onChange={(e) => updateFieldValue(field.ID, 'CustomLongText', e.target.value || null)}
        />
      );
    }

    if (fieldType.toLowerCase().includes('maxtext') || fieldType.toLowerCase().includes('memo')) {
      return (
        <textarea
          className="px-3 py-2 border rounded-md w-full"
          rows={6}
          value={currentValues.CustomMaxText || ''}
          onChange={(e) => updateFieldValue(field.ID, 'CustomMaxText', e.target.value || null)}
        />
      );
    }

    if (fieldType.toLowerCase().includes('image') || fieldType.toLowerCase().includes('link')) {
      return (
        <input
          type="text"
          className="px-3 py-2 border rounded-md w-full"
          placeholder="Enter image URL..."
          value={currentValues.CustomImageLink || ''}
          onChange={(e) => updateFieldValue(field.ID, 'CustomImageLink', e.target.value || null)}
        />
      );
    }

    // Default to short text
    return (
      <input
        type="text"
        className="px-3 py-2 border rounded-md w-full"
        value={currentValues.CustomShortText || ''}
        onChange={(e) => updateFieldValue(field.ID, 'CustomShortText', e.target.value || null)}
      />
    );
  };

  const getFieldsByTab = (tabNum: number) => {
    return fields.filter((f) => f.TabNumber === tabNum);
  };

  const organizeFieldsByPosition = (tabFields: CustomFieldDefinition[]) => {
    // Group by row
    const rows: Record<number, CustomFieldDefinition[]> = {};
    tabFields.forEach((field) => {
      if (!rows[field.RowNumber]) {
        rows[field.RowNumber] = [];
      }
      rows[field.RowNumber].push(field);
    });

    // Sort each row by column
    Object.keys(rows).forEach((rowKey) => {
      rows[parseInt(rowKey)].sort((a, b) => a.ColNumber - b.ColNumber);
    });

    return rows;
  };

  if (!isOpen) return null;

  const tabs = [1, 2, 3];
  const availableTabs = tabs.filter((tab) => getFieldsByTab(tab).length > 0);

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white shadow-2xl rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center bg-indigo-600 p-4 text-white">
          <h2 className="font-bold text-2xl">Custom Fields - Property {propertyId}</h2>
          <button
            onClick={onClose}
            className="hover:bg-indigo-700 px-3 py-1 rounded font-bold text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">Loading custom fields...</div>
        ) : fields.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No custom fields defined. Please define custom fields in the Property Custom Fields section.
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            {availableTabs.length > 1 && (
              <div className="flex border-b">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-6 py-3 font-semibold transition ${
                      selectedTab === tab
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-gray-600 hover:text-indigo-600'
                    }`}
                  >
                    Tab {tab}
                  </button>
                ))}
              </div>
            )}

            {/* Field Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {(() => {
                const tabFields = getFieldsByTab(selectedTab);
                if (tabFields.length === 0) {
                  return (
                    <div className="text-gray-500 text-center">
                      No fields in this tab
                    </div>
                  );
                }

                const rows = organizeFieldsByPosition(tabFields);
                const rowNumbers = Object.keys(rows)
                  .map((k) => parseInt(k))
                  .sort((a, b) => a - b);

                return (
                  <div className="gap-6 grid">
                    {rowNumbers.map((rowNum) => {
                      const rowFields = rows[rowNum];
                      return (
                        <div
                          key={rowNum}
                          className="gap-4 grid"
                          style={{
                            gridTemplateColumns: `repeat(${Math.max(...rowFields.map((f) => f.ColNumber))}, minmax(0, 1fr))`,
                          }}
                        >
                          {rowFields.map((field) => (
                            <div
                              key={field.ID}
                              className="flex flex-col"
                              style={{ gridColumn: field.ColNumber }}
                            >
                              <label className="mb-2 font-medium text-gray-700 text-sm">
                                {field.FieldLabel}
                                {field.FieldTypeDescription && (
                                  <span className="ml-2 text-gray-500 text-xs">
                                    ({field.FieldTypeDescription})
                                  </span>
                                )}
                              </label>
                              {renderInput(field)}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 bg-gray-50 p-4 border-t">
              <button
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-md font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 px-6 py-2 rounded-md font-medium text-white"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

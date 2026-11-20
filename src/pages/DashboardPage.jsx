import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  Download,
  Edit3,
  FolderOpen,
  Globe,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Table,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cloneSchemaFromUrl, SAMPLE_API_PRESETS } from '../services/apiInspector';
import {
  createSchema,
  deleteSchema,
  getUserSchemas,
  updateSchema,
} from '../services/schemaService';
import { FIELD_TYPE_OPTIONS, generateDataset } from '../utils/kenyanGenerator';

const DEFAULT_FIELDS = [
  { key: 'user_id', type: 'relational_id' },
  { key: 'full_name', type: 'kenyan_name' },
  { key: 'phone_number', type: 'kenyan_phone' },
  { key: 'mpesa_ref', type: 'mpesa_code' },
  { key: 'county', type: 'kenyan_county' },
];

function sortSchemasByName(schemas) {
  return [...schemas].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );
}

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [schemaName, setSchemaName] = useState('Kenyan Fintech Users');
  const [editingSchemaId, setEditingSchemaId] = useState(null);
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [rowCount, setRowCount] = useState(5);
  const [generatedData, setGeneratedData] = useState(() => generateDataset(DEFAULT_FIELDS, 5));

  const [viewMode, setViewMode] = useState('table');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState(location.state?.message || '');
  const [errorMsg, setErrorMsg] = useState('');

  const [apiUrl, setApiUrl] = useState('https://typicode.com');
  const [isImporting, setIsImporting] = useState(false);

  const [savedSchemas, setSavedSchemas] = useState([]);
  const [loadingSchemas, setLoadingSchemas] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSavedSchemas() {
      if (!currentUser) return;

      try {
        const schemas = await getUserSchemas(currentUser.uid);
        setSavedSchemas(sortSchemasByName(schemas));
      } catch {
        setErrorMsg('Could not load saved cloud schemas.');
      } finally {
        setLoadingSchemas(false);
      }
    }

    loadSavedSchemas();
  }, [currentUser]);

  function handleGenerate() {
    setErrorMsg('');
    const validFields = fields.filter((field) => field.key.trim() !== '');

    if (validFields.length === 0) {
      setErrorMsg('Add at least one field with a valid key name.');
      return;
    }

    setGeneratedData(generateDataset(validFields, rowCount));
  }

  function handleAddField() {
    setFields([...fields, { key: `field_${fields.length + 1}`, type: 'kenyan_name' }]);
  }

  function handleFieldChange(index, property, value) {
    setFields(fields.map((field, fieldIndex) =>
      fieldIndex === index ? { ...field, [property]: value } : field,
    ));
  }

  function handleRemoveField(index) {
    if (fields.length === 1) return;
    setFields(fields.filter((_, fieldIndex) => fieldIndex !== index));
  }

  async function handleImportFromApi(event) {
    event.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    setIsImporting(true);

    try {
      const clonedFields = await cloneSchemaFromUrl(apiUrl);
      setFields(clonedFields);
      setEditingSchemaId(null);
      setSchemaName('Imported API Schema');
      setGeneratedData(generateDataset(clonedFields, rowCount));
      setStatusMsg(`Imported ${clonedFields.length} fields from live REST API!`);
    } catch (error) {
      setErrorMsg(error.message || 'Failed to clone structure from API.');
    } finally {
      setIsImporting(false);
    }
  }

  async function handleSaveSchema() {
    setErrorMsg('');
    setStatusMsg('');

    const validFields = fields.filter((field) => field.key.trim() !== '');
    if (!schemaName.trim()) {
      setErrorMsg('Please give your schema a name before saving.');
      return;
    }
    if (validFields.length === 0) {
      setErrorMsg('Add at least one valid field before saving.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingSchemaId) {
        await updateSchema(editingSchemaId, { name: schemaName, fields: validFields, rowCount });
        setStatusMsg(`Updated schema "${schemaName}" in Firestore.`);
      } else {
        const newId = await createSchema(currentUser.uid, {
          name: schemaName,
          fields: validFields,
          rowCount,
        });
        setEditingSchemaId(newId);
        setStatusMsg(`Saved "${schemaName}" to your cloud library!`);
      }

      const refreshedSchemas = await getUserSchemas(currentUser.uid);
      setSavedSchemas(sortSchemasByName(refreshedSchemas));
    } catch {
      setErrorMsg('Failed to save schema to Firestore.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleLoadSchema(schema) {
    const savedRowCount = schema.rowCount || 5;
    setEditingSchemaId(schema.id);
    setSchemaName(schema.name);
    setFields(schema.fields);
    setRowCount(savedRowCount);
    setGeneratedData(generateDataset(schema.fields, savedRowCount));
    setStatusMsg(`Loaded "${schema.name}" into studio.`);
    setErrorMsg('');
  }

  function handleNewSchema() {
    setEditingSchemaId(null);
    setSchemaName('Untitled Kenyan Schema');
    setFields(DEFAULT_FIELDS);
    setRowCount(5);
    setGeneratedData(generateDataset(DEFAULT_FIELDS, 5));
    setStatusMsg('');
    setErrorMsg('');
  }

  async function handleDeleteSchema(id, name) {
    try {
      await deleteSchema(id);
      setSavedSchemas((schemas) => schemas.filter((schema) => schema.id !== id));
      if (editingSchemaId === id) handleNewSchema();
      setStatusMsg(`Deleted schema "${name}".`);
    } catch {
      setErrorMsg('Failed to delete schema.');
    }
  }

  function handleCopyJson() {
    navigator.clipboard.writeText(JSON.stringify(generatedData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadJson() {
    const blob = new Blob([JSON.stringify(generatedData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (schemaName || 'safe-data-box')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    link.href = url;
    link.download = `${safeName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const columns = generatedData.length > 0 ? Object.keys(generatedData[0]) : [];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-1.5">
            <Database className="h-5 w-5 text-amber-500" />
          </span>
          <span className="text-lg font-bold tracking-tight">Safe Data Box</span>
          <span className="hidden rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-amber-400 md:inline-block">
            Generator Studio
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-400 sm:inline sm:text-sm">
            {currentUser?.displayName || currentUser?.email}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs transition hover:bg-slate-700 sm:text-sm"
          >
            <LogOut className="h-4 w-4 text-amber-400" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-12">
        <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-4 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
              <FolderOpen className="h-4 w-4 text-amber-500" />
              Saved Schemas
            </h2>
            <button
              type="button"
              onClick={handleNewSchema}
              className="flex cursor-pointer items-center gap-1 rounded bg-slate-800 px-2 py-1 text-xs text-amber-400 hover:bg-slate-700"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          </div>

          {loadingSchemas ? (
            <p className="py-4 text-xs text-slate-500">Loading cloud templates...</p>
          ) : savedSchemas.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 px-2 py-6 text-center">
              <p className="text-xs text-slate-400">No saved schemas yet.</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Build a schema and click Save to store it in Firestore.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {savedSchemas.map((schema) => (
                <li
                  key={schema.id}
                  className={`flex items-center justify-between gap-2 rounded-xl border p-2.5 text-xs transition ${
                    editingSchemaId === schema.id
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleLoadSchema(schema)}
                    className="flex-1 cursor-pointer truncate text-left"
                  >
                    <span className="block truncate font-medium text-slate-200">{schema.name}</span>
                    <span className="text-[11px] text-slate-500">
                      {schema.fields?.length || 0} fields · {schema.rowCount || 5} rows
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${schema.name}`}
                    onClick={() => handleDeleteSchema(schema.id, schema.name)}
                    className="cursor-pointer rounded p-1.5 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="space-y-6 lg:col-span-9">
          {statusMsg && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {statusMsg}
              </span>
              <button
                type="button"
                onClick={() => setStatusMsg('')}
                className="cursor-pointer text-xs underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-400" />
              <div>
                <h2 className="font-semibold">Clone a REST API schema</h2>
                <p className="text-xs text-slate-400">
                  Import field names and infer generator types from a JSON response.
                </p>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {SAMPLE_API_PRESETS.map((preset) => (
                <button
                  key={`${preset.label}-${preset.url}`}
                  type="button"
                  onClick={() => setApiUrl(preset.url)}
                  className="cursor-pointer rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleImportFromApi} className="flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                required
                value={apiUrl}
                onChange={(event) => setApiUrl(event.target.value)}
                aria-label="REST API URL"
                placeholder="https://example.com/api"
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isImporting}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 text-amber-400 ${isImporting ? 'animate-spin' : ''}`} />
                {isImporting ? 'Inspecting API...' : 'Import Keys'}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-400" />
                <div>
                  <h1 className="font-semibold">Schema Builder</h1>
                  <p className="text-xs text-slate-400">
                    Configure fields and generate safe synthetic records.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  aria-label="Schema name"
                  value={schemaName}
                  onChange={(event) => setSchemaName(event.target.value)}
                  placeholder="Enter schema name..."
                  className="min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-slate-100 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveSchema}
                  disabled={isSaving}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : editingSchemaId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">Fields</h2>
                <p className="text-xs text-slate-500">
                  Choose a key and the type of synthetic value to generate.
                </p>
              </div>
              <div className="flex items-end gap-2">
                <label className="text-xs text-slate-400">
                  Rows
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={rowCount}
                    onChange={(event) => setRowCount(Number(event.target.value))}
                    className="ml-2 w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={`${index}-${field.key}`} className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    aria-label={`Field key ${index + 1}`}
                    value={field.key}
                    onChange={(event) => handleFieldChange(index, 'key', event.target.value)}
                    placeholder="field_name"
                    className="col-span-5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 focus:border-amber-500 focus:outline-none sm:text-sm"
                  />
                  <select
                    aria-label={`Field type ${index + 1}`}
                    value={field.type}
                    onChange={(event) => handleFieldChange(index, 'type', event.target.value)}
                    className="col-span-6 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none sm:text-sm"
                  >
                    {FIELD_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label={`Remove field ${index + 1}`}
                    onClick={() => handleRemoveField(index)}
                    disabled={fields.length === 1}
                    className="col-span-1 flex cursor-pointer justify-center rounded-lg p-2 text-slate-500 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddField}
              className="mt-3 flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:border-amber-500/50 hover:text-amber-300"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </button>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Generated Data</h2>
                <p className="text-xs text-slate-400">
                  {generatedData.length} synthetic {generatedData.length === 1 ? 'record' : 'records'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    aria-pressed={viewMode === 'table'}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      viewMode === 'table'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Table className="h-3.5 w-3.5" />
                    Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('json')}
                    aria-pressed={viewMode === 'json'}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      viewMode === 'json'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    JSON
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium hover:bg-slate-700"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium hover:bg-slate-700"
                >
                  <Download className="h-3.5 w-3.5 text-slate-400" />
                  Download
                </button>
              </div>
            </div>

            <div className="overflow-x-auto p-4">
              {viewMode === 'table' ? (
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                      {columns.map((column) => (
                        <th key={column} className="whitespace-nowrap px-3 py-2.5 font-medium">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {generatedData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-800/40">
                        {columns.map((column) => (
                          <td key={column} className="whitespace-nowrap px-3 py-2.5 text-slate-200">
                            {String(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <pre className="max-h-[32rem] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-emerald-300">
                  {JSON.stringify(generatedData, null, 2)}
                </pre>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

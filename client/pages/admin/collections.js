import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { FolderKanban, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminCollections() {
  const [collections, setCollections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [collsRes, deptsRes] = await Promise.all([
        api.get('/collections'),
        api.get('/departments'),
      ]);
      setCollections(collsRes.data.data || []);
      setDepartments(deptsRes.data.data || []);
      if (deptsRes.data.data?.length > 0) {
        setDepartmentId(deptsRes.data.data[0]._id);
      }
    } catch (err) {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !code || !departmentId) return;
    try {
      await api.post('/collections', { name, code, departmentId, description });
      setName('');
      setCode('');
      setDescription('');
      loadData();
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this knowledge base collection?')) {
      try {
        await api.delete(`/collections/${id}`);
        loadData();
      } catch (err) {}
    }
  };

  return (
    <>
      <Head>
        <title>Knowledge Base Collections | EduQuery AI</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-purple-600" /> Multiple Document Collections
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage independent knowledge bases mapped to college departments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <form onSubmit={handleCreate} className="console-card p-5 space-y-4 h-fit">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600" /> Create New Collection
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Collection Name</label>
                <input
                  type="text"
                  required
                  className="console-input text-xs"
                  placeholder="e.g. Examination Regulations"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Collection Code</label>
                <input
                  type="text"
                  required
                  className="console-input text-xs"
                  placeholder="e.g. EXAM-REG"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Assign Department</label>
                <select
                  className="console-input text-xs"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  className="console-input text-xs"
                  placeholder="Scope of documents in this collection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="console-btn-primary w-full text-xs py-2">
                Create Collection
              </button>
            </form>

            <div className="md:col-span-2 console-card overflow-hidden">
              <div className="console-card-header">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Active Collections</h3>
                <span className="text-xs font-mono text-slate-400">{collections.length} Collections</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {collections.map((col) => (
                  <div key={col._id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                        <span>{col.name}</span>
                        <span className="text-[10px] font-mono bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                          {col.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{col.description || 'No description'}</p>
                      <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        Department: {col.departmentId?.name || 'General'}
                      </div>
                    </div>

                    <button onClick={() => handleDelete(col._id)} className="console-btn-danger">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

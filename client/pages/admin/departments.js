import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Building2, Plus, Trash2 } from 'lucide-react';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch (err) {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !code) return;
    try {
      await api.post('/departments', { name, code, description });
      setName('');
      setCode('');
      setDescription('');
      loadDepartments();
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this department?')) {
      try {
        await api.delete(`/departments/${id}`);
        loadDepartments();
      } catch (err) {}
    }
  };

  return (
    <>
      <Head>
        <title>Departments Management | EduQuery AI</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-sky-600" /> College Departments
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Department-wise knowledge bases and document filtering scope
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <form onSubmit={handleCreate} className="console-card p-5 space-y-4 h-fit">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-600" /> Add New Department
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  className="console-input text-xs"
                  placeholder="e.g. Data Science & AI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Code</label>
                <input
                  type="text"
                  required
                  className="console-input text-xs"
                  placeholder="e.g. DS"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  className="console-input text-xs"
                  placeholder="Department details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="console-btn-primary w-full text-xs py-2">
                Add Department
              </button>
            </form>

            <div className="md:col-span-2 console-card overflow-hidden">
              <div className="console-card-header">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Configured Departments</h3>
                <span className="text-xs font-mono text-slate-400">{departments.length} Departments</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {departments.map((dept) => (
                  <div key={dept._id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                        <span>{dept.name}</span>
                        <span className="text-[10px] font-mono bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                          {dept.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{dept.description || 'No description'}</p>
                    </div>

                    <button onClick={() => handleDelete(dept._id)} className="console-btn-danger">
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

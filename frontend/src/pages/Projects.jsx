import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { Plus, Search, MapPin, Calendar, DollarSign, Users, TrendingUp, MoreVertical, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700',
  planning: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-amber-100 text-amber-700',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-100 text-red-700',
};

const initialForm = {
  name: '', number: '', description: '', location: '',
  address: '', start_date: '', end_date: '', budget: '',
  status: 'active', phase: 'Construction', client_name: '',
  contract_type: 'Lump Sum', manager_name: ''
};

export default function Projects() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
    if (searchParams.get('new')) setShowModal(true);
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, budget: parseFloat(form.budget) || 0 };
      await api.post('/projects', payload);
      toast.success('Project created!');
      setShowModal(false);
      setForm(initialForm);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create project');
    } finally { setSaving(false); }
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.number?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-4 lg:p-6 fade-in max-w-[1440px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{fontFamily:'Space Grotesk'}}>Projects</h1>
          <p className="text-slate-500 text-sm">{projects.length} total projects</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Plus size={16} /> New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..." className="pl-9" data-testid="table-search-input" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'planning', 'on_hold', 'completed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === s ? 'bg-orange-500 text-white border-orange-500' :
                'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen size={48} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-1">No projects found</h3>
          <p className="text-slate-400 text-sm mb-4">Create your first project to get started</p>
          <Button onClick={() => setShowModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus size={16} className="mr-2" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-all cursor-pointer border-slate-200"
              onClick={() => navigate(`/projects/${p.id}`)} data-testid={`table-row-${p.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs ${STATUS_COLORS[p.status]}`}>{p.status}</Badge>
                      <span className="text-xs text-slate-400 font-mono-code">{p.number}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate">{p.name}</h3>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {p.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="truncate">{p.location}</span>
                    </div>
                  )}
                  {p.client_name && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Users size={12} className="text-slate-400" />
                      <span className="truncate">{p.client_name}</span>
                    </div>
                  )}
                  {p.budget > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <DollarSign size={12} className="text-slate-400" />
                      <span>${p.budget?.toLocaleString()}</span>
                    </div>
                  )}
                  {p.end_date && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={12} className="text-slate-400" />
                      <span>Due: {new Date(p.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span>Progress</span>
                    <span className="font-medium">{p.progress || 0}%</span>
                  </div>
                  <Progress value={p.progress || 0} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{fontFamily:'Space Grotesk'}}>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Project Name *</Label>
                <Input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))}
                  placeholder="Downtown Office Tower" required className="mt-1" />
              </div>
              <div>
                <Label>Project Number</Label>
                <Input value={form.number} onChange={e => setForm(p=>({...p,number:e.target.value}))}
                  placeholder="SP-2024-001" className="mt-1" />
              </div>
              <div>
                <Label>Phase</Label>
                <select value={form.phase} onChange={e => setForm(p=>({...p,phase:e.target.value}))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {['Preconstruction','Design','Construction','Closeout'].map(ph => (
                    <option key={ph}>{ph}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Client / Owner Name</Label>
                <Input value={form.client_name} onChange={e => setForm(p=>({...p,client_name:e.target.value}))}
                  placeholder="ABC Development Corp" className="mt-1" />
              </div>
              <div>
                <Label>Contract Type</Label>
                <select value={form.contract_type} onChange={e => setForm(p=>({...p,contract_type:e.target.value}))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {['Lump Sum','GMP','Cost Plus','Unit Price','T&M'].map(ct => (
                    <option key={ct}>{ct}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Location</Label>
                <Input value={form.location} onChange={e => setForm(p=>({...p,location:e.target.value}))}
                  placeholder="San Francisco, CA" className="mt-1" />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={form.address} onChange={e => setForm(p=>({...p,address:e.target.value}))}
                  placeholder="123 Main St" className="mt-1" />
              </div>
              <div>
                <Label>Budget ($)</Label>
                <Input type="number" value={form.budget} onChange={e => setForm(p=>({...p,budget:e.target.value}))}
                  placeholder="5000000" className="mt-1" />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(p=>({...p,start_date:e.target.value}))}
                  className="mt-1" />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.end_date} onChange={e => setForm(p=>({...p,end_date:e.target.value}))}
                  className="mt-1" />
              </div>
              <div>
                <Label>Project Manager</Label>
                <Input value={form.manager_name} onChange={e => setForm(p=>({...p,manager_name:e.target.value}))}
                  placeholder="John Smith" className="mt-1" />
              </div>
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {['active','planning','on_hold','completed'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1).replace('_',' ')}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))}
                  placeholder="Brief project description..." rows={3}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
                {saving ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

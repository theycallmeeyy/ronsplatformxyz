import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';

export default function AdminDashboard() {
  const { users, toggleUserRole, toggleUserBlock, deleteUser } = useAuth();
  const { items, addContent, updateContent, deleteContent, toggleTrending, analyticsItems, trafficByDay, getProviderStatus, getProviderReliability } = useContent();

  const [activeTab, setActiveTab] = useState('content'); // 'content', 'trending', or 'users'
  const trendingItems = items.filter((item) => item.isTrending);

  // Add/Edit Content Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Movies');
  const [type, setType] = useState('movie');
  const [url, setUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('4.8');
  const [year, setYear] = useState('2024');
  const [isTrending, setIsTrending] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('Movies');
    setType('movie');
    setUrl('');
    setEmbedUrl('');
    setBannerUrl('');
    setDescription('');
    setRating('4.8');
    setYear('2024');
    setIsTrending(false);
    setIsRecommended(false);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setCategory(item.category || 'Movies');
    setType(item.type || 'movie');
    setUrl(item.url || '');
    setEmbedUrl(item.embedUrl || '');
    setBannerUrl(item.bannerUrl || '');
    setDescription(item.description || '');
    setRating(item.rating || '4.8');
    setYear(item.year || '2024');
    setIsTrending(Boolean(item.isTrending));
    setIsRecommended(Boolean(item.isRecommended));
    setShowModal(true);
  };

  const handleSaveContent = (e) => {
    e.preventDefault();
    const contentData = {
      title,
      category,
      type,
      url,
      embedUrl,
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80',
      description,
      rating,
      year,
      isTrending,
      isRecommended
    };

    if (editingItem) {
      updateContent(editingItem.id, contentData);
    } else {
      addContent(contentData);
    }
    setShowModal(false);
  };

  const exportAnalyticsCsv = () => {
    const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [
      ['Rank', 'Provider', 'Category', 'Clicks', 'Monthly reliability'],
      ...analyticsItems.map((item, index) => [index + 1, item.title, item.category, item.clickCount, getProviderReliability(item) ?? 'No checks'])
    ];
    const csv = rows.map((row) => row.map(escapeCell).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `ronkws-provider-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="pt-24 md:pt-28 px-5 md:px-12 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase border border-amber-500/30">
              Admin Mode
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Control Dashboard
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage streaming services, platform content, and user permissions in real time.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-[0_4px_14px_rgba(124,58,237,0.4)] flex items-center justify-center gap-1.5 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Content
        </button>
      </section>

      {/* Real-time Dashboard Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs font-semibold text-zinc-400 uppercase">Total Items</span>
          <p className="text-2xl font-black text-white">{items.length}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs font-semibold text-zinc-400 uppercase">Active Categories</span>
          <p className="text-2xl font-black text-purple-300">8</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs font-semibold text-zinc-400 uppercase">Registered Users</span>
          <p className="text-2xl font-black text-amber-300">{users.length}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs font-semibold text-zinc-400 uppercase">Total Views</span>
          <p className="text-2xl font-black text-emerald-400">14.8M</p>
        </div>
      </section>

      <section className="glass-card rounded-3xl border border-white/10 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-300">insights</span>
              Provider Analytics
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Most-clicked platforms from this device.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">{analyticsItems.reduce((total, item) => total + item.clickCount, 0)} total opens</span>
            <button onClick={exportAnalyticsCsv} className="rounded-xl bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20">Export CSV</button>
          </div>
        </div>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-end gap-2 h-32">
            {trafficByDay.map((day) => {
              const maxClicks = Math.max(...trafficByDay.map((entry) => entry.clicks), 1);
              return (
                <div key={day.label} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                  <span className="text-[10px] text-zinc-400">{day.clicks}</span>
                  <div className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-purple-700 to-cyan-400" style={{ height: `${Math.max(8, (day.clicks / maxClicks) * 78)}%` }} />
                  <span className="text-[10px] font-semibold text-zinc-500">{day.label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">Daily provider opens, last 7 days ({trafficByDay.reduce((total, day) => total + day.clicks, 0)} this week)</p>
        </div>
        <div className="divide-y divide-white/5">
          {analyticsItems.slice(0, 5).map((item, index) => {
            const status = getProviderStatus(item);
            return (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <span className="w-5 text-xs font-bold text-zinc-500">{index + 1}</span>
                <img src={item.bannerUrl} alt="" className="h-9 w-12 rounded-lg bg-zinc-900 object-contain" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] ${status.tone}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                  {getProviderReliability(item) !== null && <span className="ml-2 text-[10px] text-zinc-500">{getProviderReliability(item)}% monthly</span>}
                </span>
                <span className="text-sm font-bold text-purple-300">{item.clickCount}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('content')}
          className={`font-bold text-sm pb-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'content'
              ? 'text-purple-300 border-purple-500'
              : 'text-zinc-400 border-transparent hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">video_library</span>
          Content Catalog ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`font-bold text-sm pb-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'trending'
              ? 'text-purple-300 border-purple-500'
              : 'text-zinc-400 border-transparent hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
          Top Trending ({trendingItems.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`font-bold text-sm pb-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'text-purple-300 border-purple-500'
              : 'text-zinc-400 border-transparent hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">group</span>
          Users Management ({users.length})
        </button>
      </div>

      {/* Content Management Table */}
      {activeTab === 'content' && (
        <section className="glass-card rounded-3xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-zinc-400 font-bold uppercase">
                <tr>
                  <th className="p-4">Item Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Year</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-900/10 transition-colors">
                    <td className="p-4 font-bold flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                        <img src={item.bannerUrl} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-bold text-white truncate max-w-xs">{item.title}</span>
                    </td>
                    <td className="p-4 font-semibold text-purple-300">{item.category}</td>
                    <td className="p-4 font-semibold text-amber-300">★ {item.rating}</td>
                    <td className="p-4 font-medium text-zinc-400">{item.year}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => toggleTrending(item.id)}
                        className={`p-2 ${item.isTrending ? 'bg-emerald-600/20 text-emerald-200 hover:bg-emerald-600' : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600'} rounded-lg transition-colors`}
                        title={item.isTrending ? 'Unset Trending' : 'Mark as Trending'}
                      >
                        <span className="material-symbols-outlined text-[16px]">trending_up</span>
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white rounded-lg transition-colors"
                        title="Edit Content"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => deleteContent(item.id)}
                        className="p-2 bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                        title="Delete Content"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* User Management Table */}
      {activeTab === 'trending' && (
        <section className="glass-card rounded-3xl overflow-hidden border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Manage Top Trending</h2>
            <p className="text-sm text-zinc-400 mt-1">Review and update the items currently marked as trending. Changes are saved permanently in the app catalog.</p>
          </div>

          {trendingItems.length === 0 ? (
            <div className="p-8 text-center text-zinc-300">
              <span className="material-symbols-outlined text-5xl text-purple-400 mb-4">local_fire_department</span>
              <h3 className="text-lg font-bold text-white mb-2">No Trending Items</h3>
              <p className="text-sm text-zinc-400">Mark content as trending from the content table to add items to this list.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-zinc-400 font-bold uppercase">
                  <tr>
                    <th className="p-4">Item Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Year</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-200">
                  {trendingItems.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-900/10 transition-colors">
                      <td className="p-4 font-bold flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                          <img src={item.bannerUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-bold text-white truncate max-w-xs">{item.title}</span>
                      </td>
                      <td className="p-4 font-semibold text-purple-300">{item.category}</td>
                      <td className="p-4 font-semibold text-amber-300">★ {item.rating}</td>
                      <td className="p-4 font-medium text-zinc-400">{item.year}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => toggleTrending(item.id)}
                          className="p-2 bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                          title="Remove from Trending"
                        >
                          <span className="material-symbols-outlined text-[16px]">highlight_off</span>
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white rounded-lg transition-colors"
                          title="Edit Content"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'users' && (
        <section className="glass-card rounded-3xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-zinc-400 font-bold uppercase">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-purple-900/10 transition-colors">
                    <td className="p-4 font-bold flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-purple-950">
                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-bold text-white">{u.name}</span>
                    </td>
                    <td className="p-4 font-medium text-zinc-300">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-purple-600/20 text-purple-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => toggleUserRole(u.id)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-purple-300 rounded-lg text-xs font-semibold border border-white/10 transition-colors"
                      >
                        Toggle Role
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                        title="Delete User Account"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Add / Edit Content Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#181622] border border-white/15 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? 'Edit Content Item' : 'Add New Content Item'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveContent} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#181622] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Movies">Movies</option>
                    <option value="TV Shows">TV Shows</option>
                    <option value="Anime">Anime</option>
                    <option value="Manga">Manga</option>
                    <option value="Live TV">Live TV</option>
                    <option value="Sports">Sports</option>
                    <option value="Apps">Apps</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Year</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Direct Stream / Website URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Video Embed Trailer URL</label>
                <input
                  type="text"
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Poster / Banner Image URL</label>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 bg-white/5 border border-white/10 rounded-2xl p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 accent-purple-600"
                  />
                  Mark as Trending
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 bg-white/5 border border-white/10 rounded-2xl p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecommended}
                    onChange={(e) => setIsRecommended(e.target.checked)}
                    className="w-4 h-4 accent-purple-600"
                  />
                  Mark as Recommended
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs py-3 rounded-xl border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-3 rounded-xl"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

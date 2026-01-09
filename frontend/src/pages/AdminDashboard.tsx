import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { api } from '../lib/api';
import { Loader2, Search, Filter, Calendar, FileText, Download, MessageSquare, Plus, LogOut } from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

export default function AdminDashboard() {
    const [minRating, setMinRating] = useState<number | ''>('');
    const [search, setSearch] = useState('');
    const [month, setMonth] = useState('');
    const [sentiment, setSentiment] = useState('');
    const [aspect, setAspect] = useState('');
    const [downloading, setDownloading] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    // Generate last 12 months for filter
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toISOString().slice(0, 7); // YYYY-MM
    });

    const { data: metrics, isLoading, error } = useQuery({
        queryKey: ['analytics', minRating, search, month, sentiment, aspect],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (minRating) params.append('min_rating', minRating.toString());
            if (search) params.append('search', search);
            if (month) params.append('month', month);
            if (sentiment) params.append('sentiment', sentiment);
            if (aspect) params.append('aspect', aspect);

            const res = await api.get(`/analytics/dashboard?${params.toString()}`);
            return res.data;
        }
    });

    const { data: reviews } = useQuery({
        queryKey: ['reviews', minRating, search, month, sentiment, aspect],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (minRating) params.append('min_rating', minRating.toString());
            if (search) params.append('search', search);
            if (month) params.append('month', month);
            if (sentiment) params.append('sentiment', sentiment);
            if (aspect) params.append('aspect', aspect);

            const res = await api.get(`/reviews/?${params.toString()}`);
            return res.data;
        }
    });

    const { data: weeklyInsight } = useQuery({
        queryKey: ['weekly-insight'],
        queryFn: async () => {
            const res = await api.get('/analytics/weekly-insight');
            return res.data;
        }
    });

    const handleDownloadReport = async () => {
        if (!month) {
            alert("Please select a month first");
            return;
        }
        setDownloading(true);
        try {
            const params = new URLSearchParams();
            if (minRating) params.append('min_rating', minRating.toString());
            if (search) params.append('search', search);
            if (sentiment) params.append('sentiment', sentiment);
            if (aspect) params.append('aspect', aspect);

            const res = await api.get(`/analytics/report/${month}?${params.toString()}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${month}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error("Download failed", e);
            alert("Failed to download report");
        } finally {
            setDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin text-blue-400" size={48} />
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <div className="flex flex-col justify-center items-center h-96 gap-4">
                <p className="text-red-500 font-medium">Failed to load dashboard data.</p>
                <p className="text-sm text-slate-400">{(error as any)?.message || 'Unknown error'}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="glass-button bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50"
                >
                    Retry
                </button>
                <button
                    onClick={handleLogout}
                    className="glass-button bg-slate-100 hover:bg-slate-200 text-slate-600"
                >
                    Logout
                </button>
            </div>
        );
    }

    const ratingData = metrics?.rating_distribution
        ? Object.entries(metrics.rating_distribution).map(([rating, count]) => ({ rating: `${rating} Star`, count }))
        : [];

    return (
        <div className="space-y-8">
            {/* Header & Report Gen */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800">Analytics Overview</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadReport}
                        disabled={downloading || !month}
                        className="glass-button flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {downloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                        {month ? `Download ${month} Report` : 'Select Month to Download Report'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="glass-button flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                        title="Logout"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6">
                    <h3 className="text-slate-500 text-sm font-medium">Total Reviews</h3>
                    <p className="text-4xl font-bold mt-2 text-slate-800">{metrics?.total_reviews}</p>
                </div>
                <div className="glass-panel p-6">
                    <h3 className="text-slate-500 text-sm font-medium">Average Rating</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-4xl font-bold text-slate-800">{metrics?.average_rating}</p>
                        <span className="text-sm text-yellow-500">/ 5.0</span>
                    </div>
                </div>
                <div className="glass-panel p-6 md:col-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
                    <h3 className="text-indigo-700 text-sm font-bold flex items-center gap-2">
                        <FileText size={16} /> Weekly AI Insight
                    </h3>
                    <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                        {weeklyInsight?.summary || "Generating weekly comparison..."}
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Monthly Sentiment Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics?.monthly_trend}>
                                <defs>
                                    <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#1e293b' }}
                                    itemStyle={{ color: '#1e293b' }}
                                    labelStyle={{ color: '#64748b' }}
                                />
                                <Area type="monotone" dataKey="positive" stackId="1" stroke="#22c55e" fill="url(#colorPos)" name="Positive" />
                                <Area type="monotone" dataKey="neutral" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.3} name="Neutral" />
                                <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="url(#colorNeg)" name="Negative" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Rating Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ratingData}>
                                <XAxis dataKey="rating" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#1e293b' }}
                                    itemStyle={{ color: '#1e293b' }}
                                    labelStyle={{ color: '#64748b' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {ratingData.map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Reviews List */}
            <div className="glass-panel p-6">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                    <h3 className="text-lg font-bold">Recent Reviews</h3>

                    <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search content..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="glass-input w-full pl-10 bg-slate-50 border-slate-200"
                            />
                        </div>

                        <div className="relative w-40">
                            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="glass-input w-full pl-10 appearance-none bg-slate-50 border-slate-200 cursor-pointer"
                            >
                                <option value="">All Months</option>
                                {monthOptions.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative w-40">
                            <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <select
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : '')}
                                className="glass-input w-full pl-10 appearance-none bg-slate-50 border-slate-200 cursor-pointer"
                            >
                                <option value="">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>

                        <div className="relative w-40">
                            <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <select
                                value={sentiment}
                                onChange={(e) => setSentiment(e.target.value)}
                                className="glass-input w-full pl-10 appearance-none bg-slate-50 border-slate-200 cursor-pointer"
                            >
                                <option value="">Sentiment</option>
                                <option value="Positive">Positive</option>
                                <option value="Neutral">Neutral</option>
                                <option value="Negative">Negative</option>
                            </select>
                        </div>

                        <div className="relative w-40">
                            <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <select
                                value={aspect}
                                onChange={(e) => setAspect(e.target.value)}
                                className="glass-input w-full pl-10 appearance-none bg-slate-50 border-slate-200 cursor-pointer"
                            >
                                <option value="">Aspect</option>
                                <option value="Service">Service</option>
                                <option value="Food">Food</option>
                                <option value="Ambience">Ambience</option>
                                <option value="Time">Waiting Time</option>
                                <option value="Price">Price</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {reviews?.map((review: any) => (
                        <ReviewItem key={review.id} review={review} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ReviewItem({ review }: { review: any }) {
    const [showNotes, setShowNotes] = useState(false);
    const [newNote, setNewNote] = useState('');
    const queryClient = useQueryClient();

    const { data: notes } = useQuery({
        queryKey: ['notes', review.id],
        queryFn: async () => {
            if (!showNotes) return [];
            const res = await api.get(`/reviews/${review.id}/notes`);
            return res.data;
        },
        enabled: showNotes
    });

    const addNoteMutation = useMutation({
        mutationFn: async (content: string) => {
            return api.post(`/reviews/${review.id}/notes?note_content=${encodeURIComponent(content)}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes', review.id] });
            setNewNote('');
        }
    });

    return (
        <div className="bg-white/40 rounded-lg p-4 transition md:flex gap-6 hover:bg-white/60 border border-white/50">
            <div className="flex-shrink-0 mb-4 md:mb-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${review.rating >= 4 ? 'bg-green-100 text-green-600' :
                    review.rating <= 2 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                    {review.rating}
                </div>
                <div className="mt-2 text-center text-xs font-semibold text-slate-500">
                    {review.sentiment}
                </div>
            </div>
            <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                    <p className="text-slate-700">{review.content}</p>
                    <button onClick={() => setShowNotes(!showNotes)} className="text-slate-400 hover:text-blue-600 transition">
                        <MessageSquare size={18} />
                    </button>
                </div>

                {/* Aspects Tags */}
                {review.aspects && (
                    <div className="flex gap-2 text-xs">
                        {(() => {
                            try {
                                return JSON.parse(review.aspects).map((a: string) => (
                                    <span key={a} className="bg-slate-200 px-2 py-0.5 rounded text-slate-600">{a}</span>
                                ));
                            } catch (e) { return null; }
                        })()}
                    </div>
                )}

                {review.summary && (
                    <div className="text-sm text-slate-600 bg-slate-100 p-2 rounded border border-slate-200">
                        <span className="text-blue-600 font-semibold">AI Summary: </span>
                        {review.summary}
                    </div>
                )}

                {/* Admin Notes Section */}
                {showNotes && (
                    <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-sm font-bold text-slate-700 mb-2">Internal Notes</h4>
                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                            {notes?.map((note: any) => (
                                <div key={note.id} className="text-xs bg-yellow-50 p-2 rounded border border-yellow-100 text-slate-700">
                                    <span className="font-semibold text-slate-500 block mb-0.5">
                                        {new Date(note.created_at).toLocaleString()}
                                    </span>
                                    {note.content}
                                </div>
                            ))}
                            {notes?.length === 0 && <p className="text-xs text-slate-400 italic">No notes yet.</p>}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add private note..."
                                className="glass-input flex-1 text-sm py-1"
                                onKeyDown={(e) => e.key === 'Enter' && newNote && addNoteMutation.mutate(newNote)}
                            />
                            <button
                                onClick={() => newNote && addNoteMutation.mutate(newNote)}
                                disabled={addNoteMutation.isPending}
                                className="glass-button p-2 text-blue-600"
                            >
                                {addNoteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="text-xs text-slate-400 whitespace-nowrap">
                {new Date(review.createdAt).toLocaleDateString()}
            </div>
        </div>
    );
}

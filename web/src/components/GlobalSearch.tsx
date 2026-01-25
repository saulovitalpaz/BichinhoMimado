import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Dog, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
    type: 'pet' | 'tutor' | 'bill';
    id: number;
    title: string;
    subtitle: string;
}

import { API_BASE_URL } from '../config';

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const handleSelectResult = (result: SearchResult) => {
        if (result.type === 'pet') {
            navigate(`/clinical`);
        } else if (result.type === 'tutor') {
            navigate(`/clientes`);
        } else if (result.type === 'bill') {
            navigate(`/finance`);
        }
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div ref={searchRef} className="relative w-64">
            <div className="relative group">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Buscar pet, tutor ou conta..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600/30 transition-all shadow-sm"
                />
                {query && (
                    <button onClick={() => { setQuery(''); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isOpen && (query.trim() || results.length > 0) && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50 custom-scrollbar">
                    {loading ? (
                        <div className="p-8 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            {results.map((result, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelectResult(result)}
                                    className="w-full px-4 py-3 flex items-center space-x-4 hover:bg-slate-50 transition-colors text-left group"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.type === 'pet' ? 'bg-indigo-50 text-indigo-600' :
                                        result.type === 'tutor' ? 'bg-emerald-50 text-emerald-600' :
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                        {result.type === 'pet' ? <Dog className="w-5 h-5" /> :
                                            result.type === 'tutor' ? <User className="w-5 h-5" /> :
                                                <FileText className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-none truncate">{result.title}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{result.subtitle}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : query.trim() ? (
                        <div className="p-8 text-center">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum resultado</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;

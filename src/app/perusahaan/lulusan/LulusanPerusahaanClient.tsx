"use client";
import { useEffect, useState } from "react";
import { Search, Loader2, Phone, Briefcase, GraduationCap, MapPin, Users, Mail } from "lucide-react";
import CVDownloadButton from "@/components/CVDownloadButton";

export default function LulusanPerusahaanClient() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterJurusan, setFilterJurusan] = useState("");
    const [jurusans, setJurusans] = useState<any[]>([]);

    useEffect(() => {
        async function init() {
            // Fetch lulusan
            const res = await fetch("/api/perusahaan/lulusan");
            const json = await res.json();
            setData(Array.isArray(json) ? json : []);

            // Deduplicate jurusans for filtering
            if (Array.isArray(json)) {
                const uniqueJurusans = new Map();
                json.forEach(l => {
                    if (l.jurusan) {
                        uniqueJurusans.set(l.jurusan.id, l.jurusan);
                    }
                });
                setJurusans(Array.from(uniqueJurusans.values()));
            }
            setLoading(false);
        }
        init();
    }, []);

    const getStatusText = (status: string) => {
        switch (status) {
            case "BEKERJA": return "Bekerja";
            case "KULIAH": return "Melanjutkan Pendidikan";
            case "WIRAUSAHA": return "Wirausaha";
            case "BELUM_BEKERJA": return "Belum/Tidak Bekerja";
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "BEKERJA": return "text-blue-600 bg-blue-100";
            case "KULIAH": return "text-indigo-600 bg-indigo-100";
            case "WIRAUSAHA": return "text-orange-600 bg-orange-100";
            case "BELUM_BEKERJA": return "text-gray-600 bg-gray-100";
            default: return "text-gray-600 bg-gray-100";
        }
    };

    const filtered = data.filter((item) => {
        const matchSearch = !search ||
            item.nama.toLowerCase().includes(search.toLowerCase()) ||
            item.jurusan?.nama.toLowerCase().includes(search.toLowerCase());

        const matchJurusan = !filterJurusan || item.jurusanId === filterJurusan;

        return matchSearch && matchJurusan;
    });

    return (
        <div className="space-y-6">
            {/* Toolbars */}
            <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                <h2 className="font-bold text-gray-800">Daftar Lulusan</h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <select
                        value={filterJurusan}
                        onChange={(e) => setFilterJurusan(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D704D]"
                    >
                        <option value="">Semua Jurusan</option>
                        {jurusans.map(j => (
                            <option key={j.id} value={j.id}>{j.nama}</option>
                        ))}
                    </select>

                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama kandidat..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D704D] w-full sm:w-64"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#0D704D]" size={30} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.length === 0 ? (
                        <div className="col-span-full bg-white rounded-xl shadow p-12 text-center">
                            <Users size={40} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium text-lg">Tidak ada kandidat ditemukan.</p>
                            <p className="text-gray-400 text-sm mt-1">Coba sesuaikan filter pencarian.</p>
                        </div>
                    ) : (
                        filtered.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col hover:shadow-lg transition">
                                <div className="p-5 flex-1 relative">
                                    {/* Status Badge */}
                                    {item.tracerStudy?.status && (
                                        <div className="absolute top-4 right-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(item.tracerStudy.status)}`}>
                                                {getStatusText(item.tracerStudy.status)}
                                            </span>
                                        </div>
                                    )}

                                    <h3 className="font-bold text-gray-800 text-lg pr-20">{item.nama}</h3>
                                    <div className="flex items-center gap-1.5 text-sm text-[#0D704D] font-medium mt-1 mb-4">
                                        <GraduationCap size={15} /> {item.jurusan?.nama || "Tidak diketahui"}
                                        {item.tahunLulus && <span className="text-gray-400 font-normal">({item.tahunLulus})</span>}
                                    </div>

                                    <div className="space-y-2 mt-4 text-sm text-gray-600">
                                        <div className="flex items-start gap-2">
                                            <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" />
                                            <span className="line-clamp-1" title={item.alamat || "-"}>{item.alamat || "-"}</span>
                                        </div>
                                        {item.user?.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail size={15} className="shrink-0 text-gray-400" />
                                                <span className="truncate">{item.user.email}</span>
                                            </div>
                                        )}
                                        {item.noHp && (
                                            <div className="flex items-center gap-2">
                                                <Phone size={15} className="shrink-0 text-gray-400" />
                                                <span>{item.noHp}</span>
                                            </div>
                                        )}
                                    </div>

                                </div>

                                <div className="bg-gray-50 px-5 py-3 border-t flex justify-between items-center">
                                    <div className="text-xs text-gray-500 font-medium">
                                        {item._count?.portofolio > 0
                                            ? <span className="bg-emerald-100 text-[#0D704D] px-2 py-0.5 rounded">{item._count.portofolio} Portofolio</span>
                                            : "Belum ada portofolio"}
                                    </div>

                                    <CVDownloadButton
                                        lulusanId={item.id}
                                        label="Lihat CV"
                                        className="flex items-center gap-1.5 text-sm text-white bg-[#0D704D] px-3 py-1.5 rounded-lg hover:bg-[#0a5c3f] disabled:opacity-60 transition font-medium"
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

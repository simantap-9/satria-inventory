import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ClipboardCheck, 
  FileText, 
  CreditCard, 
  Search, 
  Plus, 
  Download, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Inbox,
  Save,
  Settings,
  Printer,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Eye,
  UploadCloud,
  FileBarChart,
  PlusCircle,
  MinusCircle,
  Camera,
  Users,
  Loader,
  Link as LinkIcon
} from 'lucide-react';

// --- KONFIGURASI PERMANEN DATABASE ---
const API_URL = "https://script.google.com/macros/s/AKfycbxZB99JRguVXTYYYmmDGYaITex1pb4quxnHXZRvZs3h6z-Vz8ynUsWgaWE4C5Zg7szp/exec";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  const [appSettings, setAppSettings] = useState({
    logo: null,
    appName: 'SATRIA',
    subTitle: 'Sistem Tertib Rapi Informatif Aset',
    institution: 'SMA Negeri 9 Mataram',
    signerName: 'MOH. HELMY ADHA',
    signerRole: 'STAF SARPRAS UNIT PERSEDIAAN HABIS PAKAI',
    signerNIP: '1980110182025211058',
    address: 'Jl. Pejanggik No. 123, Mataram'
  });

  // --- STATE DATA ---
  const [products, setProducts] = useState([
    { id: 1, kode: 'S9-ATK-001', nama: 'Kertas HVS A4', jenis: 'ATK', satuan: 'Rim', min_stok: 10, stok: 0, status: 'Habis' },
    { id: 2, kode: 'S9-ATK-002', nama: 'Kertas HVS F4', jenis: 'ATK', satuan: 'Rim', min_stok: 10, stok: 0, status: 'Habis' },
    { id: 3, kode: 'S9-ATK-003', nama: 'Pulpen', jenis: 'ATK', satuan: 'Pcs', min_stok: 24, stok: 0, status: 'Habis' },
    { id: 4, kode: 'S9-ATK-004', nama: 'Pensil', jenis: 'ATK', satuan: 'Pcs', min_stok: 24, stok: 0, status: 'Habis' },
    { id: 5, kode: 'S9-ATK-005', nama: 'Spidol Whiteboard', jenis: 'ATK', satuan: 'Pcs', min_stok: 12, stok: 0, status: 'Habis' },
    { id: 6, kode: 'S9-ATK-006', nama: 'Spidol Permanen', jenis: 'ATK', satuan: 'Pcs', min_stok: 12, stok: 0, status: 'Habis' },
    { id: 7, kode: 'S9-ATK-007', nama: 'Penghapus', jenis: 'ATK', satuan: 'Pcs', min_stok: 10, stok: 0, status: 'Habis' },
    { id: 8, kode: 'S9-ATK-008', nama: 'Tipe-X', jenis: 'ATK', satuan: 'Pcs', min_stok: 10, stok: 0, status: 'Habis' },
    { id: 9, kode: 'S9-ATK-009', nama: 'Stabilo', jenis: 'ATK', satuan: 'Pcs', min_stok: 10, stok: 0, status: 'Habis' },
    { id: 10, kode: 'S9-ATK-010', nama: 'Gunting', jenis: 'ATK', satuan: 'Pcs', min_stok: 5, stok: 0, status: 'Habis' },
    { id: 11, kode: 'S9-ATK-011', nama: 'Cutter', jenis: 'ATK', satuan: 'Pcs', min_stok: 5, stok: 0, status: 'Habis' },
    { id: 12, kode: 'S9-ATK-012', nama: 'Stapler', jenis: 'ATK', satuan: 'Pcs', min_stok: 5, stok: 0, status: 'Habis' },
    { id: 13, kode: 'S9-ATK-013', nama: 'Isi Stapler', jenis: 'ATK', satuan: 'Box', min_stok: 10, stok: 0, status: 'Habis' },
    { id: 14, kode: 'S9-ATK-014', nama: 'Lem Kertas', jenis: 'ATK', satuan: 'Pcs', min_stok: 10, stok: 0, status: 'Habis' },
    { id: 15, kode: 'S9-ATK-015', nama: 'Lakban Bening', jenis: 'ATK', satuan: 'Rol', min_stok: 10, stok: 0, status: 'Habis' }
  ]);
  const [transactions, setTransactions] = useState([]);
  const [units, setUnits] = useState([
    { id: 1, nama: 'Kepala Sekolah' },
    { id: 2, nama: 'Tata Usaha' },
    { id: 3, nama: 'Sarana Prasarana' },
    { id: 4, nama: 'Kurikulum' },
    { id: 5, nama: 'Kesiswaan' }
  ]);
  const [opnameHistory, setOpnameHistory] = useState([]); 

  const fetchData = async () => {
    if (!API_URL) return;
    setIsLoading(true);
    try {
      const [prodRes, transRes, unitRes, opnameRes] = await Promise.all([
        fetch(`${API_URL}?action=getProducts`).catch(() => ({ json: () => [] })),
        fetch(`${API_URL}?action=getTransactions`).catch(() => ({ json: () => [] })),
        fetch(`${API_URL}?action=getUnits`).catch(() => ({ json: () => [] })),
        fetch(`${API_URL}?action=getOpname`).catch(() => ({ json: () => [] }))
      ]);

      const prodData = await prodRes.json();
      const transData = await transRes.json();
      const unitData = await unitRes.json();
      const opnameData = await opnameRes.json();

      if (Array.isArray(prodData) && prodData.length > 0) setProducts(prodData);
      if (Array.isArray(transData) && transData.length > 0) setTransactions(transData);
      if (Array.isArray(unitData) && unitData.length > 0) setUnits(unitData);
      if (Array.isArray(opnameData) && opnameData.length > 0) setOpnameHistory(opnameData);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#1e3a8a] text-white transition-transform duration-300 ease-in-out shadow-xl flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-blue-800 bg-[#172e6e]">
          <h1 className="font-bold text-xl">{appSettings.appName}</h1>
          <p className="text-[10px] text-blue-300">{appSettings.institution}</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-blue-800'}`}>
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('produk')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'produk' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-blue-800'}`}>
            <Package size={20} /> <span>Daftar Produk</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-8 relative">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        )}
        
        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><LayoutDashboard className="text-blue-800" /> Dashboard Overview</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Total Macam Produk</p>
                  <h3 className="text-3xl font-bold text-blue-900">{products.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Transaksi Terhitung</p>
                  <h3 className="text-3xl font-bold text-green-600">{transactions.length}</h3>
                </div>
              </div>
            </>
          )}

          {activeTab === 'produk' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-bold text-gray-800">Daftar Inventaris SMAN 9 Mataram</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[#1e3a8a] text-white">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Kode</th>
                      <th className="px-6 py-4 font-semibold">Nama Barang</th>
                      <th className="px-6 py-4 font-semibold">Kategori</th>
                      <th className="px-6 py-4 font-semibold text-center">Stok Saat Ini</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-blue-900">{p.kode}</td>
                        <td className="px-6 py-4 text-gray-800">{p.nama}</td>
                        <td className="px-6 py-4 text-gray-500">{p.jenis}</td>
                        <td className="px-6 py-4 text-center font-bold">{p.stok} {p.satuan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
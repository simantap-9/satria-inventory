import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ArrowDownLeft, ArrowUpRight, ClipboardCheck, 
  FileText, Menu, X, Plus, Loader, Settings, Clock, PlusCircle, 
  AlertTriangle, Inbox, CheckCircle, FileBarChart, CreditCard, Search,
  Download, Pencil, Trash2, Filter, TrendingUp, TrendingDown, Save,
  Printer, Upload, Image as ImageIcon, XCircle, Eye, UploadCloud,
  MinusCircle, Camera, Users, Link as LinkIcon
} from 'lucide-react';

// --- KONFIGURASI PERMANEN DATABASE ---
const API_URL = "https://script.google.com/macros/s/AKfycbxZB99JRguVXTYYYmmDGYaITex1pb4quxnHXZRvZs3h6z-Vz8ynUsWgaWE4C5Zg7szp/exec";

const App = () => {
  // --- STATE UTAMA ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  // Pegangan (Ref) untuk navigasi lancar
  const mainContentRef = useRef(null);
  
  // Refs untuk input file
  const logoInputRef = useRef(null);
  const appLogoInputRef = useRef(null);

  // --- STATE PENGATURAN ---
  const [appSettings, setAppSettings] = useState({
    logo: null,
    appName: 'SATRIA 9', // Diubah sesuai permintaan
    subTitle: 'Sistem Tertib Rapi Informatif Aset', // Tagline
    institution: 'SMA Negeri 9 Mataram',
    signerName: 'MOH. HELMY ADHA',
    signerRole: 'STAF SARPRAS UNIT PERSEDIAAN HABIS PAKAI',
    signerNIP: '1980110182025211058',
    address: 'Jl. Pejanggik No. 123, Mataram',
    appLogo: null
  });

  // --- STATE DATA ---
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [opnameHistory, setOpnameHistory] = useState([]);
  const [units, setUnits] = useState([
    { id: 1, nama: 'Kepala Sekolah' }, { id: 2, nama: 'Tata Usaha' }, { id: 3, nama: 'Sarana Prasarana' },
    { id: 4, nama: 'Kurikulum' }, { id: 5, nama: 'Kesiswaan' }, { id: 6, nama: 'Humas' }
  ]);

  // --- STATE MODAL & FORM ---
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  
  // Data untuk Cetak & Edit
  const [printData, setPrintData] = useState(null); 
  const [printType, setPrintType] = useState('transaction');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [selectedStockCardProduct, setSelectedStockCardProduct] = useState('');

  // Form Transaksi
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionRecipient, setTransactionRecipient] = useState('');
  const [transactionNote, setTransactionNote] = useState('');
  const [transactionItems, setTransactionItems] = useState([{ barang: '', jumlah: '', satuan: 'Pcs' }]);

  // Form Opname
  const [opnameDate, setOpnameDate] = useState(new Date().toISOString().split('T')[0]);
  const [opnameNote, setOpnameNote] = useState('');
  const [opnameItems, setOpnameItems] = useState([]);

  // Form Produk
  const [productForm, setProductForm] = useState({
    kode: '', nama: '', jenis: 'ATK', satuan: 'Pcs', min_stok: 5, stok: 0, status: 'Tersedia'
  });

  // Form Unit
  const [unitForm, setUnitForm] = useState({ nama: '' });

  // Navigasi Otomatis ke Atas
  useEffect(() => {
    if (mainContentRef.current) mainContentRef.current.scrollTo(0, 0);
  }, [activeTab]);

  // --- FUNGSI AMBIL DATA ---
  const fetchData = async () => {
    if (!API_URL) return;
    setIsLoading(true);
    try {
      const [prodRes, transRes, opRes] = await Promise.all([
        fetch(`${API_URL}?action=getProducts`).then(r => r.json()).catch(() => []),
        fetch(`${API_URL}?action=getTransactions`).then(r => r.json()).catch(() => []),
        fetch(`${API_URL}?action=getOpname`).then(r => r.json()).catch(() => [])
      ]);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
      setTransactions(Array.isArray(transRes) ? transRes : []);
      setOpnameHistory(Array.isArray(opRes) ? opRes : []);
    } catch (error) {
      console.error("Database Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HANDLER UPLOAD LOGO ---
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppSettings(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAppLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppSettings(prev => ({ ...prev, appLogo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- HANDLER TRANSAKSI ---
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    const type = activeTab === 'barang_masuk' ? 'in' : 'out';
    const count = transactions.filter(t => t.type === type).length + 1;
    const romawi = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"][new Date().getMonth()];
    const kode = `${type === 'in' ? 'BM' : 'BK'}/${String(count).padStart(3,'0')}/${romawi}/SMAN9/${new Date().getFullYear()}`;

    setIsLoading(true);
    try {
      for (let item of transactionItems) {
        if (!item.barang || !item.jumlah) continue;
        const payload = {
          id: Date.now(), tanggal: transactionDate, barang: item.barang, 
          jumlah: parseInt(item.jumlah), type: type, satuan: 'Pcs',
          kode: kode, penerima: type === 'out' ? transactionRecipient : '-', 
          keterangan: transactionNote, foto: ''
        };
        await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'addTransaction', payload }), mode: "no-cors" });
      }
      await fetchData();
      setIsTransactionModalOpen(false);
      setTransactionItems([{ barang: '', jumlah: '', satuan: 'Pcs' }]);
      setTransactionNote('');
      setTransactionRecipient('');
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  // --- HANDLER OPNAME ---
  const openOpnameModal = () => {
    const items = products.map(p => ({
      kode: p.kode, nama: p.nama, satuan: p.satuan,
      stokSistem: parseInt(p.stok || 0),
      stokFisik: parseInt(p.stok || 0) 
    }));
    setOpnameItems(items);
    setIsOpnameModalOpen(true);
  };

  const handleOpnameSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const itemsProcessed = opnameItems.map(item => ({
        ...item,
        selisih: parseInt(item.stokFisik) - item.stokSistem,
        status: parseInt(item.stokFisik) === item.stokSistem ? 'Sesuai' : (parseInt(item.stokFisik) > item.stokSistem ? 'Lebih' : 'Kurang')
      }));

      const kode = `SO/${String(opnameHistory.length + 1).padStart(3,'0')}/SMAN9/${new Date().getFullYear()}`;
      
      const payload = {
        id: Date.now(), kode, tanggal: opnameDate, keterangan: opnameNote,
        totalSesuai: itemsProcessed.filter(i => i.status === 'Sesuai').length,
        totalSelisih: itemsProcessed.filter(i => i.status !== 'Sesuai').length,
        items: JSON.stringify(itemsProcessed)
      };

      await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'addOpname', payload }), mode: "no-cors" });
      await fetchData();
      setIsOpnameModalOpen(false);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  // --- HANDLER CETAK ---
  const handlePrint = (data, type) => {
    setPrintData({ ...data, type });
    setIsPrintModalOpen(true);
  };

  // --- HANDLER LAINNYA ---
  const handleOpenAddProduct = () => { setEditingProduct(null); setIsProductModalOpen(true); };
  const handleEditProduct = (p) => { setEditingProduct(p); setProductForm(p); setIsProductModalOpen(true); };
  const handleDeleteProduct = (id) => { if(confirm("Hapus produk?")) alert("Hapus via DB Admin"); };
  const handleProductSubmit = async (e) => { e.preventDefault(); /* Logic simpan produk */ setIsProductModalOpen(false); };
  
  const handleOpenAddUnit = () => { setEditingUnit(null); setUnitForm({nama:''}); setIsUnitModalOpen(true); };
  const handleEditUnit = (u) => { setEditingUnit(u); setUnitForm(u); setIsUnitModalOpen(true); };
  const handleDeleteUnit = (id) => { if(confirm("Hapus unit?")) alert("Hapus via DB Admin"); };
  const handleUnitSubmit = async (e) => { e.preventDefault(); /* Logic simpan unit */ setIsUnitModalOpen(false); };
  
  const handleExportData = () => { alert("Export CSV"); };
  const handleImportProductCSV = () => {}; 
  const handleImportCSV = () => {}; 
  
  const handleProductInputChange = (e) => setProductForm({...productForm, [e.target.name]: e.target.value});
  const handleTransactionItemChange = (idx, field, val) => { const n = [...transactionItems]; n[idx][field] = val; setTransactionItems(n); };
  const handleTransactionItemPhotoChange = () => {}; 
  const addTransactionItemRow = () => setTransactionItems([...transactionItems, { barang: '', jumlah: '', satuan: 'Pcs' }]);
  const removeTransactionItemRow = (idx) => { const n = [...transactionItems]; n.splice(idx, 1); setTransactionItems(n); };

  const getStockCardData = () => {
     if (!selectedStockCardProduct) return [];
     const productTransactions = transactions
       .filter(t => t.barang === selectedStockCardProduct)
       .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
     
     let saldo = 0;
     return productTransactions.map(t => {
       const masuk = t.type === 'in' ? parseInt(t.jumlah) : 0;
       const keluar = t.type === 'out' ? parseInt(t.jumlah) : 0;
       saldo = saldo + masuk - keluar;
       return { ...t, masuk, keluar, saldo };
     });
  };

  const NavItem = ({ id, label, icon }) => (
    <button onClick={() => { setActiveTab(id); if (window.innerWidth < 768) setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === id ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-100 hover:bg-blue-800'}`}>
      {icon} <span className="capitalize">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#1e3a8a] text-white transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* HEADER SIDEBAR (UPDATED) */}
        <div className="p-6 border-b border-blue-800 bg-[#172e6e]">
          <div className="flex items-center gap-3">
             <div className={`rounded-lg overflow-hidden ${appSettings.logo ? 'bg-white p-1' : 'p-2 bg-blue-500'}`}>
                {appSettings.logo ? <img src={appSettings.logo} className="w-8 h-8 object-contain" /> : <Package size={24} className="text-white" />}
             </div>
             <div>
                <h1 className="font-black text-2xl tracking-tighter uppercase leading-none">{appSettings.appName}</h1>
             </div>
          </div>
          <div className="mt-3">
             <p className="text-[10px] font-medium text-blue-200 leading-tight">{appSettings.subTitle}</p>
             <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">{appSettings.institution}</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem id="dashboard" label="Dashboard" icon={<LayoutDashboard size={18}/>} />
          <NavItem id="produk" label="Daftar Produk" icon={<Package size={18}/>} />
          <NavItem id="barang_masuk" label="Barang Masuk" icon={<ArrowDownLeft size={18}/>} />
          <NavItem id="barang_keluar" label="Barang Keluar" icon={<ArrowUpRight size={18}/>} />
          <NavItem id="stok_opname" label="Stok Opname" icon={<ClipboardCheck size={18}/>} />
          <NavItem id="laporan_opname" label="Laporan Opname" icon={<FileBarChart size={18}/>} />
          <NavItem id="kartu_stok" label="Kartu Stok" icon={<CreditCard size={18}/>} />
          <NavItem id="unit_penerima" label="Unit Penerima" icon={<Users size={18}/>} />
        </nav>
        <div className="p-4 border-t border-blue-800">
          <NavItem id="pengaturan" label="Pengaturan" icon={<Settings size={18}/>} />
        </div>
      </aside>

      {/* Main Area */}
      <main ref={mainContentRef} className="flex-1 flex flex-col min-w-0 overflow-auto scroll-smooth">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu size={24}/></button>
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">{activeTab.replace('_', ' ')}</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full"><Clock size={14}/> {new Date().toLocaleDateString('id-ID')}</div>
        </header>

        <div className="p-4 md:p-8 flex-1">
          {isLoading && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60"><Loader className="animate-spin text-blue-600" size={32}/></div>}

          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* --- DASHBOARD --- */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                <StatCard label="Total Produk" value={products.length} color="blue" icon={<Package/>} />
                <StatCard label="Transaksi Masuk" value={transactions.filter(t=>t.type==='in').length} color="green" icon={<ArrowDownLeft/>} />
                <StatCard label="Transaksi Keluar" value={transactions.filter(t=>t.type==='out').length} color="orange" icon={<ArrowUpRight/>} />
              </div>
            )}

            {/* --- PRODUK --- */}
            {activeTab === 'produk' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Master Data Inventaris</h3>
                    <button onClick={handleOpenAddProduct} className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline"><Plus size={14}/> Tambah</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#1e3a8a] text-white">
                      <tr><th className="px-6 py-4 uppercase text-[10px]">Kode</th><th className="px-6 py-4 uppercase text-[10px]">Nama Barang</th><th className="px-6 py-4 text-center uppercase text-[10px]">Stok</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.length > 0 ? products.map((p, i) => (
                        <tr key={i} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 font-mono font-black text-blue-900">{p.kode}</td>
                          <td className="px-6 py-4 font-bold text-gray-700">{p.nama}</td>
                          <td className="px-6 py-4 text-center font-black text-lg">{p.stok || 0}</td>
                        </tr>
                      )) : <tr><td colSpan="3" className="p-12 text-center text-gray-300 italic font-bold">Data tidak ditemukan di Google Sheets...</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- BARANG MASUK / KELUAR --- */}
            {(activeTab === 'barang_masuk' || activeTab === 'barang_keluar') && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-black uppercase tracking-widest text-[10px] text-gray-400">Riwayat {activeTab}</h2>
                  <div className="flex gap-2">
                     <button onClick={handleExportData} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg hover:bg-green-700 flex items-center gap-2"><Download size={14}/> CSV</button>
                     <button onClick={() => setIsTransactionModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><PlusCircle size={16}/> INPUT DATA</button>
                  </div>
                </div>
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-4 uppercase text-[10px]">Tanggal</th>
                        <th className="p-4 uppercase text-[10px]">No. Bukti</th>
                        <th className="p-4 uppercase text-[10px]">Barang</th>
                        <th className="p-4 text-center uppercase text-[10px]">Qty</th>
                        <th className="p-4 text-center uppercase text-[10px]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions.filter(t => t.type === (activeTab === 'barang_masuk' ? 'in' : 'out')).length > 0 ? (
                        transactions.filter(t => t.type === (activeTab === 'barang_masuk' ? 'in' : 'out')).map((t, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-gray-500 font-medium">{t.tanggal}</td>
                            <td className="p-4 font-mono text-xs font-bold text-blue-800">{t.kode}</td>
                            <td className="p-4 font-bold text-gray-800">{t.barang}</td>
                            <td className={`p-4 text-center font-black ${t.type === 'in' ? 'text-green-600' : 'text-red-500'}`}>
                              {t.type === 'in' ? '+' : '-'}{t.jumlah}
                            </td>
                            <td className="p-4 text-center">
                              <button onClick={() => handlePrint({ header: t, items: [t] }, 'transaction')} className="p-2 bg-gray-100 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                                <Printer size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="5" className="p-10 text-center text-gray-300 italic font-bold">Belum ada riwayat transaksi.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- STOK OPNAME --- */}
            {activeTab === 'stok_opname' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 animate-in fade-in duration-300">
                 <div className="flex justify-between items-center mb-6">
                  <h2 className="font-black uppercase tracking-widest text-[10px] text-gray-400">Pemeriksaan Stok</h2>
                  <button onClick={openOpnameModal} className="bg-orange-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2">
                    <ClipboardCheck size={16}/> MULAI OPNAME
                  </button>
                </div>
                <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50">
                  <CheckCircle size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-bold">Tekan tombol di atas untuk memulai pencocokan stok fisik.</p>
                </div>
              </div>
            )}

            {/* --- LAPORAN OPNAME --- */}
            {activeTab === 'laporan_opname' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
                 <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Riwayat Laporan Opname</h3>
                    <button onClick={handleExportData} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Download size={12}/> CSV</button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-[#1e3a8a] text-white">
                        <tr>
                          <th className="p-4 uppercase text-[10px]">Kode Dokumen</th>
                          <th className="p-4 uppercase text-[10px]">Tanggal</th>
                          <th className="p-4 text-center uppercase text-[10px]">Sesuai</th>
                          <th className="p-4 text-center uppercase text-[10px]">Selisih</th>
                          <th className="p-4 text-center uppercase text-[10px]">Cetak</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {opnameHistory.length > 0 ? opnameHistory.map((op, i) => (
                           <tr key={i} className="hover:bg-blue-50">
                             <td className="p-4 font-mono font-bold text-blue-900">{op.kode}</td>
                             <td className="p-4 text-gray-600">{op.tanggal}</td>
                             <td className="p-4 text-center font-bold text-green-600">{op.totalSesuai}</td>
                             <td className="p-4 text-center font-bold text-red-500">{op.totalSelisih}</td>
                             <td className="p-4 text-center">
                                <button onClick={() => handlePrint(op, 'opname')} className="p-2 bg-gray-100 rounded-lg hover:bg-blue-100 text-blue-600"><Printer size={16}/></button>
                             </td>
                           </tr>
                        )) : <tr><td colSpan="5" className="p-12 text-center text-gray-300 italic font-bold">Belum ada riwayat opname.</td></tr>}
                      </tbody>
                    </table>
                 </div>
              </div>
            )}
            
            {/* --- KARTU STOK --- */}
            {activeTab === 'kartu_stok' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Pilih Barang</label>
                  <select 
                    className="w-full p-3 border-2 border-gray-100 rounded-xl font-bold text-slate-700 bg-gray-50 focus:border-blue-500 outline-none"
                    value={selectedStockCardProduct} 
                    onChange={(e) => setSelectedStockCardProduct(e.target.value)}
                  >
                    <option value="">-- Pilih Barang untuk Melihat Kartu Stok --</option>
                    {products.map(p => <option key={p.id} value={p.nama}>{p.kode} - {p.nama}</option>)}
                  </select>
                </div>
                {selectedStockCardProduct && (
                   <div className="overflow-x-auto border border-gray-100 rounded-xl">
                      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                         <h3 className="font-bold text-gray-800">{selectedStockCardProduct}</h3>
                         <button onClick={handleExportData} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold flex gap-1"><Download size={12}/> Unduh</button>
                      </div>
                      <table className="w-full text-left text-sm border-collapse">
                         <thead className="bg-[#1e3a8a] text-white"><tr><th className="p-3 border-b">Tanggal</th><th className="p-3 border-b">No. Bukti</th><th className="p-3 border-b">Keterangan</th><th className="p-3 border-b text-center">Masuk</th><th className="p-3 border-b text-center">Keluar</th><th className="p-3 border-b text-center">Saldo</th></tr></thead>
                         <tbody className="divide-y divide-gray-100">
                           {getStockCardData().length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-gray-400 italic">Belum ada mutasi barang.</td></tr> : 
                             getStockCardData().map((row, idx) => (
                               <tr key={idx} className="hover:bg-gray-50">
                                 <td className="p-3 border-r border-gray-100">{row.tanggal}</td><td className="p-3 border-r border-gray-100 font-mono text-xs">{row.kode}</td><td className="p-3 border-r border-gray-100 text-xs">{row.keterangan}</td><td className="p-3 border-r border-gray-100 text-center font-bold text-green-600">{row.masuk || '-'}</td><td className="p-3 border-r border-gray-100 text-center font-bold text-red-500">{row.keluar || '-'}</td><td className="p-3 text-center font-black bg-gray-50">{row.saldo}</td>
                               </tr>
                             ))}
                         </tbody>
                      </table>
                   </div>
                )}
              </div>
            )}

            {/* --- UNIT PENERIMA --- */}
            {activeTab === 'unit_penerima' && (
               <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Daftar Unit Penerima</h3>
                    <button onClick={handleOpenAddUnit} className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline"><Plus size={14}/> Tambah</button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-[#1e3a8a] text-white"><tr><th className="p-4 w-12 text-center">No</th><th className="p-4">Nama Unit</th><th className="p-4 text-center">Aksi</th></tr></thead>
                       <tbody className="divide-y divide-gray-100">
                          {units.map((u, i) => (
                             <tr key={i} className="hover:bg-blue-50">
                                <td className="p-4 text-center text-gray-500">{i+1}</td>
                                <td className="p-4 font-bold text-gray-800">{u.nama}</td>
                                <td className="p-4 text-center"><div className="flex justify-center gap-2"><button onClick={()=>handleEditUnit(u)} className="p-1.5 text-blue-600 bg-blue-50 rounded"><Pencil size={14}/></button><button onClick={()=>handleDeleteUnit(u.id)} className="p-1.5 text-red-600 bg-red-50 rounded"><Trash2 size={14}/></button></div></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               </div>
            )}

            {/* --- PENGATURAN --- */}
            {activeTab === 'pengaturan' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
                <h2 className="font-black uppercase tracking-widest text-[10px] text-gray-400 mb-6 border-b pb-4">Identitas & Logo</h2>
                <div className="grid grid-cols-2 gap-6 mb-6">
                   <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-500">Logo Sekolah (Kiri)</label>
                      <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center relative hover:bg-gray-50 cursor-pointer" onClick={()=>logoInputRef.current.click()}>
                         {appSettings.logo ? <img src={appSettings.logo} className="h-full object-contain" /> : <div className="text-center text-gray-300"><UploadCloud/><span className="text-[10px]">Upload</span></div>}
                         <input type="file" ref={logoInputRef} className="hidden" onChange={handleLogoUpload} accept="image/*" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-500">Logo Aplikasi/Pemda (Kanan)</label>
                      <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center relative hover:bg-gray-50 cursor-pointer" onClick={()=>appLogoInputRef.current.click()}>
                         {appSettings.appLogo ? <img src={appSettings.appLogo} className="h-full object-contain" /> : <div className="text-center text-gray-300"><UploadCloud/><span className="text-[10px]">Upload</span></div>}
                         <input type="file" ref={appLogoInputRef} className="hidden" onChange={(e)=>{
                            const file = e.target.files[0];
                            if(file){ const reader = new FileReader(); reader.onloadend=()=>setAppSettings(p=>({...p, appLogo:reader.result})); reader.readAsDataURL(file); }
                         }} accept="image/*" />
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div><label className="block text-[10px] font-bold text-gray-500 mb-1">NAMA PENANDATANGAN</label><input type="text" value={appSettings.signerName} onChange={(e)=>setAppSettings({...appSettings, signerName: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm outline-none" /></div>
                   <div><label className="block text-[10px] font-bold text-gray-500 mb-1">NIPPPK</label><input type="text" value={appSettings.signerNIP} onChange={(e)=>setAppSettings({...appSettings, signerNIP: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm outline-none" /></div>
                   <div><label className="block text-[10px] font-bold text-gray-500 mb-1">JABATAN</label><input type="text" value={appSettings.signerRole} onChange={(e)=>setAppSettings({...appSettings, signerRole: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm outline-none" /></div>
                   <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all mt-4">SIMPAN PENGATURAN</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* --- MODAL INPUT TRANSAKSI (MULTI-ITEM) --- */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
            <div className="px-8 py-6 bg-[#1e3a8a] text-white flex justify-between items-center font-bold">
              <span className="tracking-tighter uppercase">INPUT DATA {activeTab === 'barang_masuk' ? 'MASUK' : 'KELUAR'}</span>
              <button onClick={() => setIsTransactionModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleTransactionSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tanggal</label>
                  <input type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold bg-gray-50/50 outline-none focus:border-blue-500" required />
                </div>
                {activeTab === 'barang_keluar' && (
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Penerima</label>
                     <select value={transactionRecipient} onChange={(e) => setTransactionRecipient(e.target.value)} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold bg-gray-50/50 outline-none focus:border-blue-500" required>
                        <option value="">- Pilih Unit -</option>
                        {units.map(u => <option key={u.id} value={u.nama}>{u.nama}</option>)}
                     </select>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                 {transactionItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-end bg-gray-50 p-3 rounded-2xl border border-dashed border-gray-200">
                       <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Barang</label>
                          <input list="pL" className="w-full border-2 border-white p-2 rounded-xl font-bold text-sm shadow-sm" placeholder="Cari..." value={item.barang} onChange={(e)=>handleTransactionItemChange(idx, 'barang', e.target.value)} required />
                       </div>
                       {activeTab === 'barang_masuk' && (
                          <div className="space-y-1 text-center">
                             <label className="text-[10px] font-bold text-gray-400 uppercase">Foto</label>
                             <label className="block p-2 bg-white rounded-xl border cursor-pointer hover:bg-blue-50">
                                <Camera size={18} className={item.foto ? "text-green-500" : "text-gray-400"} />
                                <input type="file" accept="image/*" className="hidden" onChange={(e)=>handleTransactionItemPhotoChange(idx, e)} />
                             </label>
                          </div>
                       )}
                       <div className="w-20 space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center block">Qty</label>
                          <input type="number" className="w-full border-2 border-white p-2 rounded-xl text-center font-black text-blue-600 shadow-sm" value={item.jumlah} onChange={(e)=>handleTransactionItemChange(idx, 'jumlah', e.target.value)} required />
                       </div>
                       {transactionItems.length > 1 && (
                          <button type="button" onClick={() => removeTransactionItemRow(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                       )}
                    </div>
                 ))}
              </div>
              
              <button type="button" onClick={addTransactionItemRow} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline"><PlusCircle size={14}/> Tambah Baris Barang</button>

              <div className="space-y-1 pt-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Keterangan (Opsional)</label>
                 <input type="text" value={transactionNote} onChange={(e)=>setTransactionNote(e.target.value)} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold bg-gray-50/50 outline-none focus:border-blue-500" placeholder="Contoh: Pengadaan Rutin" />
              </div>

              <datalist id="pL">{products.map((p, i) => <option key={i} value={p.nama} />)}</datalist>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 active:scale-95 transition-all mt-2 uppercase tracking-widest text-[11px]">
                SIMPAN DATA
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL INPUT OPNAME --- */}
      {isOpnameModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-white/20">
              <div className="px-6 py-5 bg-orange-600 text-white flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg flex items-center gap-2"><ClipboardCheck size={20} /> FORMULIR STOK OPNAME</h3>
                <button onClick={() => setIsOpnameModalOpen(false)}><X size={20} /></button>
              </div>
              <div className="p-4 bg-gray-50 border-b flex gap-4 shrink-0">
                 <input type="date" value={opnameDate} onChange={(e)=>setOpnameDate(e.target.value)} className="border p-2 rounded-lg font-bold" />
                 <input type="text" placeholder="Catatan Opname..." value={opnameNote} onChange={(e)=>setOpnameNote(e.target.value)} className="border p-2 rounded-lg font-bold flex-1" />
              </div>
              <div className="flex-1 overflow-auto p-4">
                 <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-100 sticky top-0">
                       <tr><th className="p-3 border">Kode</th><th className="p-3 border">Barang</th><th className="p-3 border text-center">Stok Sistem</th><th className="p-3 border text-center w-32 bg-orange-50">Stok Fisik</th><th className="p-3 border text-center">Selisih</th></tr>
                    </thead>
                    <tbody>
                       {opnameItems.map((item, i) => {
                          const selisih = (parseInt(item.stokFisik)||0) - item.stokSistem;
                          return (
                             <tr key={i} className="border-b">
                                <td className="p-3 border font-mono text-xs">{item.kode}</td>
                                <td className="p-3 border font-bold">{item.nama}</td>
                                <td className="p-3 border text-center">{item.stokSistem}</td>
                                <td className="p-3 border text-center bg-orange-50">
                                   <input type="number" className="w-20 p-1 border rounded text-center font-black" value={item.stokFisik} onChange={(e) => {
                                      const n = [...opnameItems]; n[i].stokFisik = e.target.value; setOpnameItems(n);
                                   }} />
                                </td>
                                <td className={`p-3 border text-center font-black ${selisih !== 0 ? 'text-red-600' : 'text-green-600'}`}>{selisih > 0 ? `+${selisih}` : selisih}</td>
                             </tr>
                          )
                       })}
                    </tbody>
                 </table>
              </div>
              <div className="p-4 border-t bg-white flex justify-end gap-3 shrink-0">
                 <button onClick={() => setIsOpnameModalOpen(false)} className="px-6 py-3 border rounded-xl font-bold">Batal</button>
                 <button onClick={handleOpnameSubmit} className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg">SIMPAN HASIL OPNAME</button>
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL CETAK NOTA --- */}
      {isPrintModalOpen && printData && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-white w-full max-w-2xl h-[90vh] flex flex-col rounded-none shadow-2xl">
              <div className="p-4 bg-gray-100 border-b flex justify-between items-center shrink-0">
                 <h3 className="font-bold flex items-center gap-2"><Printer size={18}/> Pratinjau Cetak</h3>
                 <div className="flex gap-2">
                    <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-bold">Cetak Sekarang</button>
                    <button onClick={() => setIsPrintModalOpen(false)} className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm font-bold">Tutup</button>
                 </div>
              </div>
              <div className="flex-1 overflow-auto bg-gray-500 p-8 flex justify-center">
                 <div className="bg-white w-[210mm] min-h-[148mm] p-10 shadow-xl text-black" id="print-area">
                    {/* Header Kop */}
                    <div className="border-b-2 border-black pb-4 mb-6 flex items-center gap-4">
                       <div className="w-20 h-20 flex items-center justify-center">
                          {appSettings.logo ? <img src={appSettings.logo} className="w-full h-full object-contain"/> : <div className="text-xs text-gray-300 font-bold">LOGO</div>}
                       </div>
                       <div className="flex-1 text-center">
                          <h1 className="text-2xl font-black uppercase tracking-widest mb-1">{appSettings.institution}</h1>
                          <p className="text-sm font-serif">{appSettings.address}</p>
                       </div>
                       <div className="w-20 h-20 flex items-center justify-center">
                          {appSettings.appLogo ? <img src={appSettings.appLogo} className="w-full h-full object-contain"/> : null}
                       </div>
                    </div>

                    {/* Isi Nota */}
                    <div className="text-center mb-8">
                       <h2 className="text-lg font-bold uppercase underline mb-1">
                          {printData.type === 'opname' ? 'BERITA ACARA STOK OPNAME' : `BUKTI ${printData.header?.type === 'in' ? 'PENERIMAAN' : 'PENGELUARAN'} BARANG`}
                       </h2>
                       <p className="text-sm font-mono">Nomor: {printData.kode || printData.header?.kode}</p>
                    </div>

                    {/* Tabel Item */}
                    {printData.type === 'opname' ? (
                       <table className="w-full border-collapse border border-black text-xs mb-8">
                          <thead>
                             <tr className="bg-gray-100">
                                <th className="border border-black p-2">Kode</th><th className="border border-black p-2">Barang</th>
                                <th className="border border-black p-2 text-center">Sistem</th><th className="border border-black p-2 text-center">Fisik</th>
                                <th className="border border-black p-2 text-center">Selisih</th>
                             </tr>
                          </thead>
                          <tbody>
                             {JSON.parse(printData.items || '[]').filter(i => i.selisih !== 0).map((item, idx) => (
                                <tr key={idx}>
                                   <td className="border border-black p-2">{item.kode}</td><td className="border border-black p-2">{item.nama}</td>
                                   <td className="border border-black p-2 text-center">{item.stokSistem}</td><td className="border border-black p-2 text-center">{item.stokFisik}</td>
                                   <td className="border border-black p-2 text-center">{item.selisih}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    ) : (
                       <>
                         <div className="mb-4 text-sm flex justify-between">
                            <div><p><b>Tanggal:</b> {printData.header?.tanggal}</p><p><b>Keterangan:</b> {printData.header?.keterangan}</p></div>
                            {printData.header?.type === 'out' && (<div className="text-right"><p><b>Penerima:</b> {printData.header?.penerima}</p></div>)}
                         </div>
                         <table className="w-full border-collapse border border-black text-sm mb-8">
                            <thead><tr className="bg-gray-100"><th className="border border-black p-2 w-10 text-center">No</th><th className="border border-black p-2">Nama Barang</th><th className="border border-black p-2 w-16 text-center">Foto</th><th className="border border-black p-2 w-24 text-center">Jumlah</th><th className="border border-black p-2 w-24 text-center">Satuan</th></tr></thead>
                            <tbody>
                               {printData.items?.map((item, idx) => (
                                  <tr key={idx}>
                                     <td className="border border-black p-2 text-center">{idx + 1}</td>
                                     <td className="border border-black p-2">{item.barang}</td>
                                     <td className="border border-black p-2 text-center">{item.foto ? <img src={item.foto} className="w-8 h-8 object-cover mx-auto"/> : '-'}</td>
                                     <td className="border border-black p-2 text-center font-bold">{item.jumlah}</td>
                                     <td className="border border-black p-2 text-center">{item.satuan}</td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                       </>
                    )}

                    {/* Tanda Tangan */}
                    <div className="flex justify-end mt-12 text-sm">
                       <div className="text-center w-64">
                          <p className="mb-1">Mataram, {new Date(printData.header ? printData.header.tanggal : printData.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                          <p className="font-bold mb-16">{appSettings.signerRole}</p>
                          <p className="font-bold underline">{appSettings.signerName}</p>
                          <p>NIPPPK. {appSettings.signerNIP}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL UNIT PENERIMA --- */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
             <div className="px-6 py-4 bg-[#1e3a8a] text-white flex justify-between items-center"><h3 className="font-bold text-lg flex items-center gap-2"><Users size={20} /> {editingUnit ? 'Edit Unit' : 'Tambah Unit'}</h3><button onClick={() => setIsUnitModalOpen(false)} className="text-white hover:text-gray-200"><X size={20} /></button></div>
            <form onSubmit={handleUnitSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Unit / Divisi</label><input type="text" value={unitForm.nama} onChange={(e) => setUnitForm({ nama: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required placeholder="Contoh: Tata Usaha" /></div>
              <div className="pt-2 flex gap-3"><button type="button" onClick={() => setIsUnitModalOpen(false)} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Batal</button><button type="submit" className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"><Save size={18} /> Simpan</button></div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL INPUT PRODUK --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
             <div className="px-6 py-4 bg-[#1e3a8a] text-white flex justify-between items-center"><h3 className="font-bold text-lg flex items-center gap-2"><Package size={20} /> {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h3><button onClick={() => setIsProductModalOpen(false)} className="text-white hover:text-gray-200"><X size={20} /></button></div>
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Kode Barang</label><input type="text" name="kode" value={productForm.kode} onChange={handleProductInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label><input type="text" name="nama" value={productForm.nama} onChange={handleProductInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label><select name="jenis" value={productForm.jenis} onChange={handleProductInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="ATK">ATK</option><option value="Elektronik">Elektronik</option><option value="Furniture">Furniture</option><option value="Lainnya">Lainnya</option></select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label><select name="satuan" value={productForm.satuan} onChange={handleProductInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="Pcs">Pcs</option><option value="Unit">Unit</option><option value="Box">Box</option><option value="Rim">Rim</option></select></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Min. Stok</label><input type="number" name="min_stok" value={productForm.min_stok} onChange={handleProductInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="0" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label><input type="number" name="stok" value={productForm.stok} onChange={handleProductInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="0" /></div></div>
              <div className="pt-2 flex gap-3"><button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Batal</button><button type="submit" className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"><Save size={18} /> Simpan</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ label, value, color, icon }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50'
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-5 transition-transform hover:scale-[1.02]">
      <div className={`p-4 rounded-xl ${colors[color]}`}>{React.cloneElement(icon, { size: 24 })}</div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black text-gray-800 tracking-tight leading-none">{value}</h3>
      </div>
    </div>
  );
};

export default App;
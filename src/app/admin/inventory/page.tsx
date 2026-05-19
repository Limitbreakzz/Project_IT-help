"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Package, Search } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { Modal } from "@/components/ui/Modal";

export default function InventoryPage() {
  const { items, loading, search, setSearch, saveItem, deleteItem } = useInventory();
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    editMode: false,
    currentItemId: null as string | null,
    name: "",
    quantity: 0,
  });

  const openAdd = () => setModalState({ isOpen: true, editMode: false, currentItemId: null, name: "", quantity: 0 });
  const openEdit = (item: any) => setModalState({ isOpen: true, editMode: true, currentItemId: item.id, name: item.name, quantity: item.quantity });
  const close = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const handleSave = async () => {
    if (!modalState.name) return;
    const success = await saveItem({ 
      id: modalState.currentItemId || undefined, 
      name: modalState.name, 
      quantity: modalState.quantity 
    });
    if (success) close();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบอะไหล่นี้?")) return;
    await deleteItem(id);
  };

  if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-primary-600" /> จัดการคลังอะไหล่ (Inventory)
          </h2>
          <p className="text-slate-500 mt-1">เพิ่ม แก้ไข ลบ อะไหล่สำหรับใช้งานในระบบ IT Helpdesk</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> เพิ่มอะไหล่ใหม่
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input 
            type="text" placeholder="ค้นหาชื่ออะไหล่..." 
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-300"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">ชื่ออะไหล่/อุปกรณ์</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider w-32">จำนวนคงเหลือ</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider w-32 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {items.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">ไม่พบข้อมูลอะไหล่</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.quantity > 5 ? 'bg-green-100 text-green-700' : 
                        item.quantity > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-center gap-3">
                      <button onClick={() => openEdit(item)} className="text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={modalState.isOpen} 
        onClose={close} 
        title={modalState.editMode ? "แก้ไขข้อมูลอะไหล่" : "เพิ่มอะไหล่ใหม่"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ชื่ออะไหล่</label>
            <input 
              type="text" value={modalState.name} 
              onChange={(e) => setModalState(p => ({ ...p, name: e.target.value }))}
              className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="เช่น RAM 8GB, เมาส์"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">จำนวนคงเหลือ</label>
            <input 
              type="number" value={modalState.quantity} 
              onChange={(e) => setModalState(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))}
              className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              min="0"
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={close} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">ยกเลิก</button>
            <button 
              onClick={handleSave} disabled={!modalState.name}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-lg font-bold transition-colors shadow-sm"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

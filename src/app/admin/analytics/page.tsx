"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Lightbulb, XCircle } from "lucide-react";

interface AnalyticsData {
  summary: {
    total: number;
    resolved: number;
    pending: number;
    inProgress: number;
    totalCostEst: number;
  };
  statusDistribution: { status: string; count: number }[];
  priorityDistribution: { priority: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
  monthlyTrends: { month: string; count: number; totalCost: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) {
          throw new Error("ล้มเหลวในการดึงข้อมูลสถิติ");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-200 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
            <XCircle className="w-6 h-6" /> ไม่สามารถดึงข้อมูลได้
          </h2>
          <p>{error || "กรุณาลองใหม่อีกครั้ง"}</p>
        </div>
      </div>
    );
  }

  // Helper values for SVGs
  const maxTrendCount = Math.max(...data.monthlyTrends.map((t) => t.count), 1);
  const totalCategories = data.categoryDistribution.reduce((acc, curr) => acc + curr.count, 0);

  // Status mapping
  const statusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "รอช่างรับงาน";
      case "IN_PROGRESS": return "กำลังซ่อม";
      case "RESOLVED": return "เสร็จสิ้น";
      case "CANCELLED": return "ยกเลิก";
      default: return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-yellow-600 bg-yellow-100";
      case "IN_PROGRESS": return "text-blue-600 bg-blue-100";
      case "RESOLVED": return "text-green-600 bg-green-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  // Priority mapping
  const priorityColor = (prio: string) => {
    switch (prio) {
      case "CRITICAL": return "text-red-600 bg-red-100 border-red-200";
      case "HIGH": return "text-orange-600 bg-orange-100 border-orange-200";
      case "MEDIUM": return "text-blue-600 bg-blue-100 border-blue-200";
      case "LOW": return "text-green-600 bg-green-100 border-green-200";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            แดชบอร์ดวิเคราะห์สถิติ IT Helpdesk
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            ข้อมูลการแจ้งซ่อม อะไหล่ และสถิติวิเคราะห์เชิงลึกโดย AI
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400">
          อัปเดตล่าสุด: {new Date().toLocaleTimeString("th-TH")} น.
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Cards */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-2xl shadow-md text-white flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-85">งานแจ้งทั้งหมด</span>
            <h3 className="text-4xl font-extrabold mt-2">{data.summary.total}</h3>
          </div>
          <p className="text-xs mt-4 opacity-85">เคสไอทีทั้งหมดที่ลงทะเบียน</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:scale-[1.02] transition-transform">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">กำลังรอดำเนินการ</span>
            <h3 className="text-4xl font-extrabold text-yellow-500 mt-2">{data.summary.pending}</h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-yellow-600 font-semibold bg-yellow-50 dark:bg-yellow-950/20 px-3 py-1 rounded-full w-fit">
            <AlertCircle className="w-4 h-4" />
            <span>ต้องการช่างเข้าซ่อมด่วน</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:scale-[1.02] transition-transform">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ดำเนินการเสร็จสิ้น</span>
            <h3 className="text-4xl font-extrabold text-green-500 mt-2">{data.summary.resolved}</h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-semibold bg-green-50 dark:bg-green-950/20 px-3 py-1 rounded-full w-fit">
            <CheckCircle2 className="w-4 h-4" />
            <span>อัตราการแก้ปัญหา {data.summary.total > 0 ? Math.round((data.summary.resolved / data.summary.total) * 100) : 0}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:scale-[1.02] transition-transform">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">งบประมาณประเมินสะสม</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">
              ฿{data.summary.totalCostEst.toLocaleString("th-TH")}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-4">วิเคราะห์งบโดย AI เบื้องต้น</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">แนวโน้มเคสแจ้งซ่อมรายเดือน</h3>
          
          <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-slate-200 dark:border-slate-700 relative">
            {data.monthlyTrends.map((trend, index) => {
              const heightPercent = (trend.count / maxTrendCount) * 80; // Scale to fit max height nicely
              return (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                    {trend.count} เคส (฿{trend.totalCost.toLocaleString()})
                  </div>
                  
                  {/* Visual Bar */}
                  <div 
                    style={{ height: `${Math.max(heightPercent, 5)}%` }} 
                    className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg group-hover:from-primary-600 group-hover:to-primary-500 transition-all duration-300 relative"
                  >
                    <div className="absolute top-[-24px] left-0 right-0 text-center text-xs font-bold text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                      {trend.count}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-semibold truncate max-w-full text-center">
                    {trend.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown (Custom premium pie layout) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">หมวดหมู่ที่เกิดปัญหามากที่สุด</h3>
            
            <div className="space-y-4">
              {data.categoryDistribution.map((item, index) => {
                const percent = totalCategories > 0 ? Math.round((item.count / totalCategories) * 100) : 0;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.category}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-bold">{item.count} เคส ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          index === 0 ? "from-red-500 to-orange-400" :
                          index === 1 ? "from-primary-500 to-primary-400" :
                          "from-emerald-500 to-teal-400"
                        }`}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {data.categoryDistribution.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-10">ไม่มีสถิติหมวดหมู่</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-4 mt-6">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span>AI แนะนำ: ปัญหาหมวดหมู่ส่วนใหญ่วิเคราะห์แล้วพบว่าสามารถเบิกอะไหล่เพื่อรีเซ็ตเครื่องทดแทนได้</span>
          </div>
        </div>
      </div>

      {/* Priority and Status grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority breakdown */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">ระดับความสำคัญของงาน (Priority)</h3>
          <div className="grid grid-cols-2 gap-4">
            {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((prio) => {
              const found = data.priorityDistribution.find((x) => x.priority === prio);
              const count = found ? found.count : 0;
              return (
                <div 
                  key={prio} 
                  className={`p-4 rounded-xl border flex flex-col justify-between ${priorityColor(prio)}`}
                >
                  <span className="text-xs font-bold tracking-wider">{prio}</span>
                  <div className="flex justify-between items-baseline mt-4">
                    <span className="text-3xl font-extrabold">{count}</span>
                    <span className="text-xs opacity-75">รายการ</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status list breakdown */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">สถานะคิวงานซ่อม</h3>
          <div className="space-y-4">
            {["PENDING", "IN_PROGRESS", "RESOLVED"].map((status) => {
              const found = data.statusDistribution.find((x) => x.status === status);
              const count = found ? found.count : 0;
              const percent = data.summary.total > 0 ? Math.round((count / data.summary.total) * 100) : 0;

              return (
                <div key={status} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${
                      status === "PENDING" ? "bg-yellow-500 animate-pulse" :
                      status === "IN_PROGRESS" ? "bg-blue-500" :
                      "bg-green-500"
                    }`}></span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{statusLabel(status)}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-slate-800 dark:text-white">{count}</span>
                    <span className="text-xs text-slate-400 font-medium">({percent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

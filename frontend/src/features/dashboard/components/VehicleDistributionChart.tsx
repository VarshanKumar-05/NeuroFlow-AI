import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Car, Bus, Truck, Bike, Siren } from 'lucide-react';
import { useTrafficStore } from '../../../store/trafficStore';

const iconMap: any = { Car, Bus, Truck, Bike, Siren, Emergency: Siren };

export function VehicleDistributionChart() {
    const { vehicleDistribution, stats } = useTrafficStore();
    
    // Fallback loading data if WebSocket hasn't arrived yet
    const data = vehicleDistribution.length > 0 ? vehicleDistribution : [
        { name: 'Cars', value: 0, count: 0, color: '#00E5FF', icon: 'Car' },
        { name: 'Trucks', value: 0, count: 0, color: '#F59E0B', icon: 'Truck' },
        { name: 'Buses', value: 0, count: 0, color: '#3B82F6', icon: 'Bus' },
        { name: 'Motorcycles', value: 0, count: 0, color: '#10B981', icon: 'Bike' },
        { name: 'Emergency Vehicles', value: 0, count: 0, color: '#EF4444', icon: 'Siren' },
    ];

    const totalCount = stats.totalVehicles;

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-teal-500/20">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Car className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Vehicle Distribution</h3>
                    <p className="text-slate-500 text-sm">Interactive breakdown (Cars, Trucks, Buses, Bikes, Emergency)</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row items-center gap-6">
                {/* Chart Side */}
                <div className="flex-1 relative min-h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={95}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                                itemStyle={{ color: '#38BDF8', fontWeight: 'bold' }}
                                formatter={(value: any, name: any, item: any) => [
                                    `${value}% (${item.payload.count || 0} vehicles)`,
                                    item.payload.name
                                ]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-slate-900">{totalCount.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ROI Vehicles</span>
                    </div>
                </div>

                {/* Custom Legend Side */}
                <div className="w-full sm:w-[150px] shrink-0 space-y-3">
                    {data.map((entry, idx) => {
                        const Icon = iconMap[entry.icon] || Car;
                        return (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors">
                                <div className="flex items-center gap-2 truncate">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                    <Icon className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                                    <span className="text-xs font-semibold text-slate-700 truncate">{entry.name}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900 ml-1">{entry.value}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

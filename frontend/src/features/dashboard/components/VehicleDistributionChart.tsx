import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Car, Bus, Truck, Bike, Ambulance } from 'lucide-react';
import { useTrafficStore } from '../../../store/trafficStore';

const iconMap: any = { Car, Bus, Truck, Bike, Ambulance };

export function VehicleDistributionChart() {
    const { vehicleDistribution } = useTrafficStore();
    
    // Fallback data if WebSocket hasn't populated yet
    const data = vehicleDistribution.length > 0 ? vehicleDistribution : [
        { name: 'Loading', value: 100, color: '#e2e8f0', icon: 'Car' }
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-teal-500/20">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Car className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Vehicle Distribution</h3>
                    <p className="text-slate-500 text-sm">Real-time classification breakdown</p>
                </div>
            </div>

            <div className="flex-1 flex items-center gap-6">
                {/* Chart Side */}
                <div className="flex-1 relative min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                formatter={(value: any) => [`${value}%`, 'Share']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-slate-900">12k</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
                    </div>
                </div>

                {/* Custom Legend Side */}
                <div className="w-[120px] shrink-0 space-y-4">
                    {data.map((entry, idx) => {
                        const Icon = iconMap[entry.icon] || Car;
                        return (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" style={{ color: entry.color }} />
                                    <span className="text-xs font-semibold text-slate-600">{entry.name}</span>
                                </div>
                                <span className="text-sm font-black text-slate-900">{entry.value}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

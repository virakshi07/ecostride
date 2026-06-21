import React, { useState } from 'react';
import { api, calculateEmissions, EQUIVALENCE_FACTORS } from '../api';
import type { EmissionCategory } from '../types';
import { Car, Zap, Leaf, ShoppingBag, Trash2, ShieldAlert } from 'lucide-react';

interface LogActivityProps {
  onActivityLogged: (message: string, subMessage: string) => void;
}

export const LogActivity: React.FC<LogActivityProps> = ({ onActivityLogged }) => {
  const [activeTab, setActiveTab] = useState<EmissionCategory>('transport');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  // Transport State
  const [transportMode, setTransportMode] = useState('car_petrol');
  const [transportDist, setTransportDist] = useState<number | ''>('');

  // Energy State
  const [energyType, setEnergyType] = useState('electricity');
  const [energyQty, setEnergyQty] = useState<number | ''>('');

  // Food State
  const [foodType, setFoodType] = useState('beef');
  const [foodQty, setFoodQty] = useState<number | ''>('');

  // Shopping State
  const [shopCategory, setShopCategory] = useState('electronics');
  const [shopSpend, setShopSpend] = useState<number | ''>('');

  // Waste State
  const [wasteWeight, setWasteWeight] = useState<number | ''>('');
  const [wasteRecyclingRate, setWasteRecyclingRate] = useState<number>(0);

  // Calculate live estimate based on form selections
  const getLiveEstimate = (): number => {
    if (activeTab === 'transport') {
      const qty = Number(transportDist) || 0;
      return calculateEmissions('transport', transportMode, qty);
    }
    if (activeTab === 'energy') {
      const qty = Number(energyQty) || 0;
      return calculateEmissions('energy', energyType, qty);
    }
    if (activeTab === 'food') {
      const qty = Number(foodQty) || 0;
      return calculateEmissions('food', foodType, qty);
    }
    if (activeTab === 'shopping') {
      const qty = Number(shopSpend) || 0;
      return calculateEmissions('shopping', shopCategory, qty);
    }
    if (activeTab === 'waste') {
      const qty = Number(wasteWeight) || 0;
      return calculateEmissions('waste', 'landfill_base', qty, { recyclingRate: wasteRecyclingRate });
    }
    return 0;
  };

  const liveEstimate = getLiveEstimate();

  // Form Reset helper
  const resetForm = (tab: EmissionCategory) => {
    if (tab === 'transport') {
      setTransportDist('');
    } else if (tab === 'energy') {
      setEnergyQty('');
    } else if (tab === 'food') {
      setFoodQty('');
    } else if (tab === 'shopping') {
      setShopSpend('');
    } else if (tab === 'waste') {
      setWasteWeight('');
      setWasteRecyclingRate(0);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let quantity = 0;
    let subtype = '';
    let unit = '';
    let additionalData = null;

    if (activeTab === 'transport') {
      quantity = Number(transportDist);
      subtype = transportMode;
      unit = 'km';
    } else if (activeTab === 'energy') {
      quantity = Number(energyQty);
      subtype = energyType;
      unit = energyType === 'electricity' ? 'kWh' : 'kg';
    } else if (activeTab === 'food') {
      quantity = Number(foodQty);
      subtype = foodType;
      unit = 'kg';
    } else if (activeTab === 'shopping') {
      quantity = Number(shopSpend);
      subtype = shopCategory;
      unit = '$';
    } else if (activeTab === 'waste') {
      quantity = Number(wasteWeight);
      subtype = 'landfill_base';
      unit = 'kg';
      additionalData = { recyclingRate: wasteRecyclingRate };
    }

    if (!quantity || quantity <= 0) {
      alert("Please enter a valid positive quantity.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await api.logActivity({
        category: activeTab,
        subtype,
        quantity,
        unit,
        source: 'manual',
        additionalData
      });

      // Show toast
      const isEco = 
        (activeTab === 'transport' && (subtype === 'bus' || subtype === 'train')) ||
        (activeTab === 'food' && subtype === 'vegetables') ||
        (activeTab === 'waste' && wasteRecyclingRate > 50);

      const coinMsg = isEco ? "+25 Eco-Coins (Eco Bonus!)" : "+10 Eco-Coins";
      
      onActivityLogged(
        "Activity Logged Successfully!",
        `Calculated: ${result.co2e_kg} kg CO₂e. ${coinMsg}`
      );
      
      resetForm(activeTab);
    } catch (err) {
      console.error(err);
      alert("Error saving activity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Relatable equivalence math
  const getEquivalenceText = (co2: number) => {
    if (co2 === 0) return "Enter inputs to calculate equivalence";
    
    // Choose the best unit based on emission scale
    if (co2 < 2) {
      const charges = Math.round(co2 / EQUIVALENCE_FACTORS.phoneCharge);
      return `= charging ${charges} smartphones`;
    }
    
    if (co2 < 20) {
      const km = Math.round(co2 / EQUIVALENCE_FACTORS.carKm);
      return `= driving a gas car ${km} km`;
    }
    
    const trees = (co2 / EQUIVALENCE_FACTORS.tree).toFixed(1);
    return `= planting ${trees} mature trees to offset (absorbed in 1 year)`;
  };

  // Dynamic colors for tabs
  const tabStyles = {
    transport: {
      color: 'text-blue-600 bg-blue-50 border-blue-600',
      activeBorder: 'border-blue-600',
      fill: 'fill-blue-600',
      hover: 'hover:bg-blue-50/50'
    },
    energy: {
      color: 'text-amber-600 bg-amber-50 border-amber-600',
      activeBorder: 'border-amber-600',
      fill: 'fill-amber-600',
      hover: 'hover:bg-amber-50/50'
    },
    food: {
      color: 'text-emerald-600 bg-emerald-50 border-emerald-600',
      activeBorder: 'border-emerald-600',
      fill: 'fill-emerald-600',
      hover: 'hover:bg-emerald-50/50'
    },
    shopping: {
      color: 'text-violet-600 bg-violet-50 border-violet-600',
      activeBorder: 'border-violet-600',
      fill: 'fill-violet-600',
      hover: 'hover:bg-violet-50/50'
    },
    waste: {
      color: 'text-red-600 bg-red-50 border-red-600',
      activeBorder: 'border-red-600',
      fill: 'fill-red-600',
      hover: 'hover:bg-red-50/50'
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Log Daily Activity</h2>
        <p className="text-sm text-slate-500 mt-1">Record your consumption choices to track real-time changes</p>
      </div>

      {/* Main Tabbed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden lg:col-span-2">
          
          {/* Tab Navigation bar */}
          <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar bg-slate-50/50">
            {([
              { id: 'transport', label: 'Transport', icon: <Car className="h-4 w-4" /> },
              { id: 'energy', label: 'Energy', icon: <Zap className="h-4 w-4" /> },
              { id: 'food', label: 'Food', icon: <Leaf className="h-4 w-4" /> },
              { id: 'shopping', label: 'Shopping', icon: <ShoppingBag className="h-4 w-4" /> },
              { id: 'waste', label: 'Waste', icon: <Trash2 className="h-4 w-4" /> }
            ] as const).map(tab => {
              const isActive = activeTab === tab.id;
              const style = tabStyles[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? `${style.color} ${style.activeBorder}` 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Transport Tab Inputs */}
            {activeTab === 'transport' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label htmlFor="transport-mode" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Transport Mode
                  </label>
                  <select
                    id="transport-mode"
                    value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="car_petrol">Petrol Car (0.192 kg CO₂e/km)</option>
                    <option value="car_diesel">Diesel Car (0.171 kg CO₂e/km)</option>
                    <option value="bus">City Bus (0.105 kg CO₂e/km)</option>
                    <option value="train">Commuter Train (0.041 kg CO₂e/km)</option>
                    <option value="flight">Domestic Flight (0.255 kg CO₂e/km)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="transport-dist" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Distance Travelled (km)
                  </label>
                  <input
                    id="transport-dist"
                    type="number"
                    min="0"
                    step="any"
                    value={transportDist}
                    onChange={(e) => setTransportDist(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 15"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                {(transportMode === 'bus' || transportMode === 'train') && (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-xs flex items-center space-x-2">
                    <Leaf className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>Green Nudge:</strong> Public transit reduces emissions by over 50%. You earn double eco-coins for this log!</span>
                  </div>
                )}
              </div>
            )}

            {/* Energy Tab Inputs */}
            {activeTab === 'energy' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label htmlFor="energy-type" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Energy Type
                  </label>
                  <select
                    id="energy-type"
                    value={energyType}
                    onChange={(e) => setEnergyType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="electricity">Electricity (0.475 kg CO₂e/kWh)</option>
                    <option value="lpg">LPG / Bottled Gas (2.300 kg CO₂e/kg)</option>
                    <option value="natural_gas">Natural Gas (2.000 kg CO₂e/m³)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="energy-qty" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    {energyType === 'electricity' ? 'Electricity Used (kWh)' : energyType === 'lpg' ? 'LPG Used (kg)' : 'Gas Used (m³)'}
                  </label>
                  <input
                    id="energy-qty"
                    type="number"
                    min="0"
                    step="any"
                    value={energyQty}
                    onChange={(e) => setEnergyQty(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder={energyType === 'electricity' ? 'e.g. 120' : 'e.g. 5'}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* Food Tab Inputs */}
            {activeTab === 'food' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label htmlFor="food-type" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Food Category
                  </label>
                  <select
                    id="food-type"
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="beef">Beef (27.0 kg CO₂e/kg)</option>
                    <option value="lamb">Lamb (24.0 kg CO₂e/kg)</option>
                    <option value="chicken">Chicken (6.9 kg CO₂e/kg)</option>
                    <option value="dairy">Dairy Products (3.2 kg CO₂e/kg)</option>
                    <option value="vegetables">Grains, Veg & Fruits (1.0 kg CO₂e/kg)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="food-qty" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Quantity Consumed (kg)
                  </label>
                  <input
                    id="food-qty"
                    type="number"
                    min="0"
                    step="any"
                    value={foodQty}
                    onChange={(e) => setFoodQty(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 0.5"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                {foodType === 'vegetables' && (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-xs flex items-center space-x-2">
                    <Leaf className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>Eco Choice:</strong> Swap beef/lamb for plant-based grains/vegetables to save over 95% emissions! Double eco-coins applied.</span>
                  </div>
                )}
                {(foodType === 'beef' || foodType === 'lamb') && (
                  <div className="bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-100 text-xs flex items-center space-x-2">
                    <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <span><strong>Pro Tip:</strong> Animal agriculture (especially beef) has a very high methane output. Swap beef for chicken next time to save ~20 kg CO₂e.</span>
                  </div>
                )}
              </div>
            )}

            {/* Shopping Tab Inputs */}
            {activeTab === 'shopping' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label htmlFor="shop-cat" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Purchase Category
                  </label>
                  <select
                    id="shop-cat"
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  >
                    <option value="electronics">Electronics (0.8 kg CO₂e / $)</option>
                    <option value="fashion">Sustainable Fashion (0.4 kg CO₂e / $)</option>
                    <option value="fast_fashion">Fast Fashion (0.9 kg CO₂e / $)</option>
                    <option value="furniture">Furniture / Household (0.3 kg CO₂e / $)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="shop-spend" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Spend Amount ($)
                  </label>
                  <input
                    id="shop-spend"
                    type="number"
                    min="0"
                    step="any"
                    value={shopSpend}
                    onChange={(e) => setShopSpend(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                {shopCategory === 'fast_fashion' && (
                  <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-100 text-xs flex items-center space-x-2">
                    <ShieldAlert className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span><strong>Footprint Warning:</strong> Fast fashion is resource-intensive and has double the carbon intensity of standard/sustainable clothing.</span>
                  </div>
                )}
              </div>
            )}

            {/* Waste Tab Inputs */}
            {activeTab === 'waste' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label htmlFor="waste-weight" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Waste Disposed (kg)
                  </label>
                  <input
                    id="waste-weight"
                    type="number"
                    min="0"
                    step="any"
                    value={wasteWeight}
                    onChange={(e) => setWasteWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 10"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="waste-recycle" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Recycling Rate (%)
                    </label>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      {wasteRecyclingRate}% Recycled
                    </span>
                  </div>
                  <input
                    id="waste-recycle"
                    type="range"
                    min="0"
                    max="100"
                    value={wasteRecyclingRate}
                    onChange={(e) => setWasteRecyclingRate(parseInt(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                    <span>0% (Landfill)</span>
                    <span>50%</span>
                    <span>100% (Zero Waste)</span>
                  </div>
                </div>
                {wasteRecyclingRate > 75 && (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-xs flex items-center space-x-2">
                    <Leaf className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>Recycling Bonus:</strong> Your recycling reduces effective landfill methane output! Triple eco-coins applied.</span>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => resetForm(activeTab)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all duration-150 cursor-pointer"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-md cursor-pointer transition-all duration-200
                  ${activeTab === 'transport' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' :
                    activeTab === 'energy' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' :
                    activeTab === 'food' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                    activeTab === 'shopping' ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-200' :
                    'bg-red-600 hover:bg-red-700 shadow-red-200'}
                  ${isSubmitting ? 'opacity-55 cursor-not-allowed' : ''}
                `}
              >
                {isSubmitting ? 'Logging...' : 'Log Activity'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Summary / Carbon Calculator preview widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-fit">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase mb-1">Impact Preview</h3>
              <p className="text-xs text-slate-500">Live estimates based on current selection</p>
            </div>

            {/* Giant live value */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Estimated Emissions</span>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-4xl font-black text-slate-800 tracking-tight transition-all duration-300">
                  {liveEstimate.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-500">kg CO₂e</span>
              </div>
            </div>

            {/* Relatable equivalents */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Impact Equivalence</p>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs font-semibold text-emerald-800 leading-relaxed text-center">
                {getEquivalenceText(liveEstimate)}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-[11px] text-slate-400 font-medium leading-normal flex items-start space-x-2">
            <span className="inline-block p-1 bg-slate-100 text-slate-500 rounded font-bold uppercase text-[9px] flex-shrink-0">
              Note
            </span>
            <span>
              All calculations are conducted using official carbon coefficients published in national ESG registries (DEFRA, EPA). Values will update your Sustainability Score and weekly charts immediately.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
export default LogActivity;

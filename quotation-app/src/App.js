import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Calculator, X } from 'lucide-react';

function App() {
  // --- STATE MANAGEMENT ---
  
  // Scenarios defined by user
  const SCENARIOS = {
    NO_TAX_NO_DISC: 'Without Tax - No Discount',
    NO_TAX_GLOBAL_DISC: 'Without Tax - Discount on Total (%)',
    NO_TAX_ITEM_DISC: 'Without Tax - Discount on Each Product (%)',
    TAX_NO_DISC: 'With Tax - No Discount',
    TAX_GLOBAL_DISC: 'With Tax - Discount on Total (%)',
    TAX_ITEM_DISC: 'With Tax - Discount on Each Product (%)',
    TAX_ITEM_WISE: 'Tax is Product Wise (%)'
  };

  const [config, setConfig] = useState({
    scenario: 'TAX_NO_DISC', // Default
    globalDiscountRate: 0,
  });

  const [client, setClient] = useState({
    name: 'Zalak Mam',
    address: 'Ahmedabad',
    quoteNo: 'SB240942 25-26',
    date: new Date().toISOString().split('T')[0],
    advisor: 'Bharat Singh',
    mobile: '+91 95583 09997',
    email: 'contact@sulitdecor.com'
  });

  const [items, setItems] = useState([
    { id: 1, description: 'Living Room Main Fabric', qty: 16, unit: 'Mtr', price: 1155, itemDisc: 0, itemTax: 18 },
    { id: 2, description: 'Living Room Channel', qty: 9.3, unit: 'Rft', price: 285, itemDisc: 0, itemTax: 18 },
    { id: 3, description: 'Living Room Labour', qty: 6, unit: 'Nos', price: 450, itemDisc: 0, itemTax: 18 },
    { id: 4, description: 'Living Room Fitting', qty: 1, unit: 'Nos', price: 355, itemDisc: 0, itemTax: 18 },
    { id: 5, description: 'Bedroom 2 Zebra Blind', qty: 32.2, unit: 'Sqft', price: 475, itemDisc: 0, itemTax: 18 },
  ]);

  const [totals, setTotals] = useState({
    subTotal: 0,
    totalDiscount: 0,
    taxableValue: 0,
    totalTax: 0,
    grandTotal: 0
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [calcData, setCalcData] = useState({
    type: 'curtain', // curtain | blind
    areaName: '',
    width: 0,
    height: 0,
    panna: 6, // Number of widths
    priceFabric: 0,
    priceChannel: 0,
    priceLabour: 0,
    priceBlind: 0,
    priceFitting: 0,
    taxRate: 18
  });

  // --- CALCULATION LOGIC ---

  useEffect(() => {
    calculateQuote();
  }, [items, config]);

  const calculateQuote = () => {
    let subTotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const isTaxScenario = config.scenario.startsWith('TAX');
    const isItemDisc = config.scenario.includes('ITEM_DISC');

    items.forEach(item => {
      const baseAmount = item.qty * item.price;
      
      let itemDiscountAmount = 0;
      let itemTaxAmount = 0;

      if (isItemDisc) {
        itemDiscountAmount = baseAmount * (item.itemDisc / 100);
      }
      
      const amountAfterDisc = baseAmount - itemDiscountAmount;

      if (isTaxScenario) {
        itemTaxAmount = amountAfterDisc * (item.itemTax / 100);
      }

      subTotal += baseAmount;
      if (isItemDisc) {
        totalDiscount += itemDiscountAmount;
      }
      totalTax += itemTaxAmount;
    });

    if (config.scenario.includes('GLOBAL_DISC')) {
      totalDiscount = subTotal * (config.globalDiscountRate / 100);
      
      if (isTaxScenario) {
        totalTax = totalTax * (1 - config.globalDiscountRate / 100);
      }
    }

    let taxableValue = subTotal - totalDiscount;

    setTotals({
      subTotal,
      totalDiscount,
      taxableValue,
      totalTax,
      grandTotal: taxableValue + totalTax
    });
  };

  // --- MODAL CALCULATOR LOGIC ---

  const handleAddFromCalculator = () => {
    const newItems = [];
    const tax = calcData.taxRate;
    const timestamp = Date.now();

    const customRound = (val) => {
      const floorVal = Math.floor(val);
      const decimal = val - floorVal;
      if (decimal <= 0.1001) {
        return floorVal;
      }
      return Math.ceil(val);
    };

    if (calcData.type === 'curtain') {
      const rawFabricQty = ((parseFloat(calcData.height) + 16) / 39.37) * parseFloat(calcData.panna);
      const fabricQty = customRound(rawFabricQty);
      
      const rawChannelQty = parseFloat(calcData.width) / 12;
      const channelQty = customRound(rawChannelQty);

      const labourQty = parseFloat(calcData.panna);

      if (calcData.priceFabric > 0) {
        newItems.push({
          id: timestamp + 1,
          description: `${calcData.areaName} Main Fabric`,
          qty: fabricQty,
          unit: 'Mtr',
          price: parseFloat(calcData.priceFabric),
          itemDisc: 0,
          itemTax: tax
        });
      }
      if (calcData.priceChannel > 0) {
        newItems.push({
          id: timestamp + 2,
          description: `${calcData.areaName} Channel`,
          qty: channelQty,
          unit: 'Rft',
          price: parseFloat(calcData.priceChannel),
          itemDisc: 0,
          itemTax: tax
        });
      }
      if (calcData.priceLabour > 0) {
        newItems.push({
          id: timestamp + 3,
          description: `${calcData.areaName} Labour`,
          qty: labourQty,
          unit: 'Nos',
          price: parseFloat(calcData.priceLabour),
          itemDisc: 0,
          itemTax: tax
        });
      }
      if (calcData.priceFitting > 0) {
        newItems.push({
          id: timestamp + 4,
          description: `${calcData.areaName} Fitting`,
          qty: 1, 
          unit: 'Nos',
          price: parseFloat(calcData.priceFitting),
          itemDisc: 0,
          itemTax: tax
        });
      }

    } else if (calcData.type === 'blind') {
      const rawSqft = (parseFloat(calcData.width) * parseFloat(calcData.height)) / 144;
      const sqft = customRound(rawSqft);
      
      newItems.push({
        id: timestamp,
        description: `${calcData.areaName} Blind`,
        qty: sqft,
        unit: 'Sqft',
        price: parseFloat(calcData.priceBlind),
        itemDisc: 0,
        itemTax: tax
      });

      if (calcData.priceFitting > 0) {
        newItems.push({
          id: timestamp + 1,
          description: `${calcData.areaName} Fitting`,
          qty: 1, 
          unit: 'Nos',
          price: parseFloat(calcData.priceFitting),
          itemDisc: 0,
          itemTax: tax
        });
      }
    }

    setItems([...items, ...newItems]);
    setShowModal(false);
    setCalcData({...calcData, areaName: '', width: 0, height: 0}); 
  };

  const handleAddItem = () => {
    setItems([...items, { 
      id: Date.now(), 
      description: '', 
      qty: 1, 
      unit: 'Mtr', 
      price: 0, 
      itemDisc: 0, 
      itemTax: 18 
    }]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const needsItemDiscountCol = config.scenario.includes('ITEM_DISC');
  const needsItemTaxCol = config.scenario.startsWith('TAX');

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 pb-20 relative">
      {/* --- PRINT STYLES TO HIDE BROWSER HEADER/FOOTER --- */}
      <style>
        {`
          @media print {
            @page {
              margin: 0;
            }
            body {
              margin: 1.5cm;
            }
            .print-no-break {
              break-inside: avoid;
            }
          }
        `}
      </style>

      {/* EDITOR SECTION (No Print) */}
      <div className="print:hidden max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <Calculator className="w-6 h-6" /> Quotation Builder
            </h1>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors text-sm"
              >
                <Plus className="w-4 h-4" /> Calculate from Measurements
              </button>
              <button 
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors text-sm"
              >
                <Printer className="w-4 h-4" /> Print / PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Calculation Scenario</label>
              <select 
                value={config.scenario}
                onChange={(e) => setConfig({...config, scenario: e.target.value})}
                className="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {Object.entries(SCENARIOS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {config.scenario.includes('GLOBAL_DISC') && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Global Discount (%)</label>
                <input 
                  type="number" 
                  value={config.globalDiscountRate}
                  onChange={(e) => setConfig({...config, globalDiscountRate: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Client Name</label>
                <input className="w-full p-2 border rounded" value={client.name} onChange={e => setClient({...client, name: e.target.value})} />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Address</label>
                <input className="w-full p-2 border rounded" value={client.address} onChange={e => setClient({...client, address: e.target.value})} />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Quote No</label>
                <input className="w-full p-2 border rounded" value={client.quoteNo} onChange={e => setClient({...client, quoteNo: e.target.value})} />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Date</label>
                <input type="date" className="w-full p-2 border rounded" value={client.date} onChange={e => setClient({...client, date: e.target.value})} />
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 w-20">Qty</th>
                  <th className="p-3 w-24">Unit</th>
                  <th className="p-3 w-24">Price</th>
                  {needsItemDiscountCol && <th className="p-3 w-20 bg-yellow-50">Disc %</th>}
                  {needsItemTaxCol && <th className="p-3 w-20 bg-blue-50">Tax %</th>}
                  <th className="p-3 w-24 text-right">Total</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => {
                    const baseAmount = item.qty * item.price;
                    const discAmt = needsItemDiscountCol ? baseAmount * (item.itemDisc/100) : 0;
                    const taxBase = baseAmount - discAmt;
                    const taxAmt = needsItemTaxCol ? taxBase * (item.itemTax/100) : 0;
                    const totalLine = taxBase + taxAmt;

                  return (
                  <tr key={item.id} className="hover:bg-gray-50 bg-white">
                    <td className="p-2"><input className="w-full p-1 border rounded" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} /></td>
                    <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value))} /></td>
                    <td className="p-2">
                      <select className="w-full p-1 border rounded" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)}>
                        <option>Mtr</option>
                        <option>Sqft</option>
                        <option>Nos</option>
                        <option>Rft</option>
                        <option>Set</option>
                      </select>
                    </td>
                    <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))} /></td>
                    
                    {needsItemDiscountCol && (
                      <td className="p-2 bg-yellow-50"><input type="number" className="w-full p-1 border rounded bg-white" value={item.itemDisc} onChange={(e) => updateItem(item.id, 'itemDisc', parseFloat(e.target.value))} /></td>
                    )}
                    {needsItemTaxCol && (
                      <td className="p-2 bg-blue-50"><input type="number" className="w-full p-1 border rounded bg-white" value={item.itemTax} onChange={(e) => updateItem(item.id, 'itemTax', parseFloat(e.target.value))} /></td>
                    )}
                    
                    <td className="p-2 font-bold text-gray-700 text-right">
                      {Math.round(totalLine)}
                    </td>
                    <td className="p-2 text-center">
                      <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
           <button onClick={handleAddItem} className="mt-4 flex items-center gap-2 text-gray-500 hover:text-blue-600 font-semibold text-sm transition-colors">
              <Plus size={16} /> Add Manual Row
            </button>
        </div>
      </div>

      {/* CALCULATOR MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2"><Calculator size={18} /> Measurement Calculator</h2>
              <button onClick={() => setShowModal(false)} className="hover:bg-blue-800 p-1 rounded"><X size={20} /></button>
            </div>
            
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button 
                  onClick={() => setCalcData({...calcData, type: 'curtain'})}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${calcData.type === 'curtain' ? 'bg-white shadow text-blue-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Curtains
                </button>
                <button 
                  onClick={() => setCalcData({...calcData, type: 'blind'})}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${calcData.type === 'blind' ? 'bg-white shadow text-blue-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Blinds
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Area / Window Name</label>
                  <input 
                    placeholder="e.g. Living Room Main" 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    value={calcData.areaName}
                    onChange={e => setCalcData({...calcData, areaName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Width (Inches)</label>
                    <input type="number" className="w-full p-2 border rounded" value={calcData.width} onChange={e => setCalcData({...calcData, width: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Height (Inches)</label>
                    <input type="number" className="w-full p-2 border rounded" value={calcData.height} onChange={e => setCalcData({...calcData, height: e.target.value})} />
                  </div>
                </div>

                {calcData.type === 'curtain' && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-4 border border-blue-100">
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">Panna (No. of Widths)</label>
                      <div className="flex gap-2">
                        <input type="number" className="w-full p-2 border rounded" value={calcData.panna} onChange={e => setCalcData({...calcData, panna: e.target.value})} />
                        <span className="flex items-center text-xs text-blue-600 italic whitespace-nowrap">Used for Fabric & Labour</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Fabric Rate</label>
                        <input type="number" placeholder="0" className="w-full p-2 border rounded text-sm" value={calcData.priceFabric} onChange={e => setCalcData({...calcData, priceFabric: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Channel Rate</label>
                        <input type="number" placeholder="0" className="w-full p-2 border rounded text-sm" value={calcData.priceChannel} onChange={e => setCalcData({...calcData, priceChannel: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Labour Rate</label>
                        <input type="number" placeholder="0" className="w-full p-2 border rounded text-sm" value={calcData.priceLabour} onChange={e => setCalcData({...calcData, priceLabour: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Fitting Rate</label>
                        <input type="number" placeholder="0" className="w-full p-2 border rounded text-sm" value={calcData.priceFitting} onChange={e => setCalcData({...calcData, priceFitting: e.target.value})} />
                      </div>
                    </div>
                    <div className="text-[10px] text-blue-600 px-1">
                      * Fabric: (H+16)/39.37 * Panna | Channel: W/12 | Fitting: 1 Nos
                    </div>
                  </div>
                )}

                {calcData.type === 'blind' && (
                   <div className="bg-purple-50 p-4 rounded-lg space-y-4 border border-purple-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-purple-800 mb-1">Rate per Sqft</label>
                          <input type="number" className="w-full p-2 border rounded" value={calcData.priceBlind} onChange={e => setCalcData({...calcData, priceBlind: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-purple-800 mb-1">Fitting Rate (Nos)</label>
                          <input type="number" className="w-full p-2 border rounded" value={calcData.priceFitting} onChange={e => setCalcData({...calcData, priceFitting: e.target.value})} />
                        </div>
                      </div>
                       <div className="text-[10px] text-purple-600 px-1">
                        * Sqft = (Width * Height) / 144 | Fitting = 1 Per Blind
                      </div>
                   </div>
                )}

                {needsItemTaxCol && (
                   <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Applicable Tax (%)</label>
                      <input type="number" className="w-full p-2 border rounded" value={calcData.taxRate} onChange={e => setCalcData({...calcData, taxRate: e.target.value})} />
                   </div>
                )}

              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 text-sm font-semibold hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={handleAddFromCalculator} className="px-6 py-2 bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 rounded-lg shadow-lg">
                Add to Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW / PRINT SECTION */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:w-full print:max-w-none">
        <div className="w-full min-h-[297mm] p-8 md:p-12 relative flex flex-col justify-between">
          
          {/* HEADER */}
          <div>
            <div className="flex justify-between items-start mb-12">
              <div className="w-1/2">
                <h1 className="text-lg font-bold tracking-widest text-gray-900 mb-6">QUOTATION</h1>
                
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="font-bold text-sm text-gray-800">Sulit Decor Private Limited</p>
                  <p>Showroom No.107, Aaron Spectra, Behind Rajpath Club,</p>
                  <p>Rajpath Rangoli Rd, Bodakdev, Ahmedabad, Gujarat, IN 380054</p>
                  <p>E-mail: {client.email}</p>
                  <p>Mo.: {client.mobile}</p>
                </div>

                <div className="mt-6">
                  <p className="text-xs text-gray-500 uppercase">Buyer (Bill To):</p>
                  <p className="font-bold text-gray-800 text-lg">{client.name}</p>
                  <p className="text-sm text-gray-600">{client.address}</p>
                </div>
              </div>

              <div className="w-1/2 flex flex-col items-end">
                <div className="mb-6 text-right">
                  <h2 className="text-4xl font-serif font-bold text-gray-800 tracking-tighter">sulit</h2>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mt-1">Bespoke</p>
                </div>

                <div className="w-64">
                  <div className="flex justify-between text-xs py-1 border-b border-gray-200">
                    <span className="font-bold text-gray-600">QUOT NO.:</span>
                    <span className="text-gray-800">{client.quoteNo}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-gray-200">
                    <span className="font-bold text-gray-600">DATE:</span>
                    <span className="text-gray-800">{client.date}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-gray-200">
                    <span className="font-bold text-gray-600">SALES ADVISOR:</span>
                    <span className="text-gray-800">{client.advisor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="mb-8">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-t-2 border-b-2 border-gray-800">
                    <th className="py-2 text-left w-12 text-gray-600">Sr.No.</th>
                    <th className="py-2 text-left text-gray-600">DESCRIPTION</th>
                    <th className="py-2 text-center w-16 text-gray-600">QTY</th>
                    <th className="py-2 text-center w-16 text-gray-600">UNIT</th>
                    <th className="py-2 text-right w-24 text-gray-600">PRICE</th>
                    {needsItemDiscountCol && <th className="py-2 text-right w-20 text-gray-600">DISC %</th>}
                    {needsItemTaxCol && <th className="py-2 text-right w-20 text-gray-600">TAX %</th>}
                    <th className="py-2 text-right w-28 text-gray-600">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {items.map((item, index) => {
                    const base = item.qty * item.price;
                    let displayTotal = base;
                    if (needsItemDiscountCol) displayTotal = base - (base * (item.itemDisc/100));
                    
                    return (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 text-left">{index + 1}</td>
                        <td className="py-3 text-left font-medium">{item.description}</td>
                        <td className="py-3 text-center">{item.qty}</td>
                        <td className="py-3 text-center">{item.unit}</td>
                        <td className="py-3 text-right">{item.price}</td>
                        {needsItemDiscountCol && <td className="py-3 text-right">{item.itemDisc}%</td>}
                        {needsItemTaxCol && <td className="py-3 text-right">{item.itemTax}%</td>}
                        <td className="py-3 text-right">{Math.round(displayTotal)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* TOTALS */}
            <div className="flex justify-end mb-12">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="font-bold text-gray-600">Sub Total</span>
                  <span className="font-bold text-gray-800">{formatCurrency(totals.subTotal)}</span>
                </div>
                
                {config.scenario.includes('GLOBAL_DISC') && totals.totalDiscount > 0 && (
                  <div className="flex justify-between py-1 text-green-700">
                    <span className="">Discount ({config.globalDiscountRate}%)</span>
                    <span>- {formatCurrency(totals.totalDiscount)}</span>
                  </div>
                )}

                 {config.scenario.includes('ITEM_DISC') && totals.totalDiscount > 0 && (
                  <div className="flex justify-between py-1 text-green-700">
                    <span className="">Total Discount</span>
                    <span>- {formatCurrency(totals.totalDiscount)}</span>
                  </div>
                )}
                
                {(totals.totalDiscount > 0 || totals.totalTax > 0) && (
                   <div className="flex justify-between py-1 border-t border-gray-200">
                    <span className="font-bold text-gray-600">Taxable Value</span>
                    <span className="font-bold text-gray-800">{formatCurrency(totals.taxableValue)}</span>
                  </div>
                )}

                {totals.totalTax > 0 && (
                  <div className="flex justify-between py-1 text-gray-600">
                    <span>GST (Total)</span>
                    <span>+ {formatCurrency(totals.totalTax)}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-2 border-t-2 border-gray-800 text-base">
                  <span className="font-bold text-gray-900">Grand Total</span>
                  <span className="font-bold text-blue-900">{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER / TERMS (Prevent Splitting) */}
          <div className="mt-auto print-no-break" style={{ breakInside: 'avoid' }}>
            <div className="grid grid-cols-2 gap-8 text-[10px] text-gray-600 border-t border-gray-300 pt-4 leading-relaxed">
              <div>
                <p className="font-bold text-gray-800 mb-1">Payment Terms:</p>
                <ul className="list-disc pl-3 mb-2 space-y-1">
                  <li>After confirming your order, an initial payment of 50% of the material cost is required.</li>
                  <li>The remaining amount should be paid before we deliver the product.</li>
                  <li>Hardware and Labour costs can be paid on premise after product installation.</li>
                </ul>
                <p className="mb-2">We are punctual and we expect the same. So in case of an outstanding payment, the product will be delivered once the full payment is made.</p>
                
                <p className="font-bold text-gray-800 mb-1 mt-2">Government Guidelines:</p>
                <p>We comply with government guidelines; therefore, GST will apply on purchases.</p>
              </div>

              <div>
                 <p className="font-bold text-gray-800 mb-1">Return & Replacement Terms:</p>
                 <ul className="list-disc pl-3 mb-2 space-y-1">
                   <li>We are Service Providers, so we do not provide any Guarantee or Warranty on materials after delivery and installation.</li>
                   <li>However, we will coordinate with the manufacturer if return/replacement is allowed.</li>
                   <li>Products will not be changed, cancelled, or exchanged after your Final Confirmation.</li>
                 </ul>
                 
                 <div className="mt-6 flex justify-between items-end">
                   <div>
                     <p className="font-bold text-gray-800">Sulit Decor Private Limited</p>
                     <p className="mt-6 border-t border-gray-400 w-24 pt-1">Authorized Signatory</p>
                   </div>
                   <div className="text-right">
                      <p className="font-bold text-lg text-gray-800">www.sulitdecor.com</p>
                      <p className="text-gray-400 italic">Thank you...</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}

export default App;
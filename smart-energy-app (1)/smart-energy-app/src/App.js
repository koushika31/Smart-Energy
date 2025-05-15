import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function App() {
  const [solarData, setSolarData] = useState(Array(10).fill(0));
  const [windData, setWindData] = useState(Array(10).fill(0));
  const [usageData, setUsageData] = useState(Array(10).fill(0));
  const [view, setView] = useState('resource');
  const [submittedResource, setSubmittedResource] = useState(false);
  const [submittedUsage, setSubmittedUsage] = useState(false);
  const [compareClicked, setCompareClicked] = useState(false);

  const generateRandomData = () => Array.from({ length: 10 }, () => Math.floor(Math.random() * 60) + 20);

  useEffect(() => {
    const solar = generateRandomData();
    const wind = generateRandomData();
    const usage = generateRandomData();

    setSolarData(solar);
    setWindData(wind);
    setUsageData(usage);

    fetch('http://localhost:5000/api/energy/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ solar, wind, usage })
    })
      .then(res => res.json())
      .then(data => console.log('Auto-saved:', data.message))
      .catch(err => console.error('Auto-save error:', err));
  }, []);

  const sendDataToBackend = () => {
    fetch('http://localhost:5000/api/energy/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ solar: solarData, wind: windData, usage: usageData })
    })
      .then(res => res.json())
      .then(data => alert(data.message))
      .catch(err => console.error('Error:', err));
  };

  const solarHasData = solarData.some(v => v > 0);
  const windHasData = windData.some(v => v > 0);
  const usageHasData = usageData.some(v => v > 0);

  const handleInputChange = (type, index, value) => {
    const updated = type === 'solar' ? [...solarData] : type === 'wind' ? [...windData] : [...usageData];
    updated[index] = Number(value);
    type === 'solar' ? setSolarData(updated)
      : type === 'wind' ? setWindData(updated)
      : setUsageData(updated);
  };

  const forecastEnergy = () =>
    usageData.map(v => Math.max(0, v + Math.floor(Math.random() * 20 - 10)));

  const netEnergyStatus = () => {
    const totalGenerated = solarData.map((val, i) => val + windData[i]);
    const net = totalGenerated.map((val, i) => val - usageData[i]);
    return { totalGenerated, net };
  };

  const { totalGenerated, net } = netEnergyStatus();
  const totalGenSum = totalGenerated.reduce((a, b) => a + b, 0);
  const totalUseSum = usageData.reduce((a, b) => a + b, 0);
  const solarAvg = (solarData.reduce((a, b) => a + b, 0) / solarData.length).toFixed(2);
  const windAvg = (windData.reduce((a, b) => a + b, 0) / windData.length).toFixed(2);

  return (
    <div className="min-h-screen p-6" style={{
      backgroundImage: 'url(https://images.unsplash.com/photo-1600788907410-1ef9fbe8b8cd)',
      backgroundSize: 'cover',
      backdropFilter: 'blur(6px)',
      backgroundPosition: 'center'
    }}>
      <div className="bg-black/60 p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-white mb-6">⚡ Smart Energy Dashboard</h1>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button className={`px-4 py-2 rounded ${view === 'resource' ? 'bg-green-600 text-white' : 'bg-white text-black'}`} onClick={() => setView('resource')}>1️⃣ Renewable Tracking</button>
          <button className={`px-4 py-2 rounded ${view === 'consumption' ? 'bg-green-600 text-white' : 'bg-white text-black'}`} onClick={() => {
            if (solarHasData && windHasData) setView('consumption');
            else alert("Please enter both solar and wind data first!");
          }}>2️⃣ Energy Consumption</button>
          <button className={`px-4 py-2 rounded ${view === 'forecast' ? 'bg-green-600 text-white' : 'bg-white text-black'}`} onClick={() => {
            if (usageHasData) {
              fetch('http://localhost:5000/api/energy/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ solar: solarData, wind: windData, usage: usageData })
              })
                .then(res => res.json())
                .then(data => console.log('Auto-saved on compare:', data.message))
                .catch(err => console.error('Auto-save error on compare:', err));
              setCompareClicked(true);
              setSubmittedUsage(true);
              setView('forecast');
            } else alert("Please enter usage data and compare first!");
          }}>3️⃣ Forecasting</button>
          <button className={`px-4 py-2 rounded ${view === 'budget' ? 'bg-green-600 text-white' : 'bg-white text-black'}`} onClick={() => {
            if (usageHasData && solarHasData && windHasData) setView('budget');
            else alert("Generate and compare data first!");
          }}>4️⃣ Budget Estimation</button>
          <button className={`px-4 py-2 rounded ${view === 'user' ? 'bg-green-600 text-white' : 'bg-white text-black'}`} onClick={() => {
            if (usageHasData && submittedResource && compareClicked) setView('user');
            else alert("Complete all previous steps to unlock suggestions.");
          }}>5️⃣ User Engagement</button>
        </div>

        {/* Renewable Tracking View */}
        {view === 'resource' && (
          <>
            <h2 className="text-xl font-bold text-white mb-4">🌞 Solar & 🌬️ Wind Tracking</h2>
            <h3 className="text-white font-semibold">Solar</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {solarData.map((val, idx) => (
                <input key={`solar-${idx}`} type="number" value={val}
                  onChange={(e) => handleInputChange('solar', idx, e.target.value)}
                  className="w-16 p-1 rounded bg-white" />
              ))}
            </div>
            <Line data={{
              labels: solarData.map((_, i) => `T${i + 1}`),
              datasets: [{ label: 'Solar Output (kWh)', data: solarData, borderColor: 'orange', fill: false }]
            }} />

            <h3 className="text-white font-semibold mt-6">Wind</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {windData.map((val, idx) => (
                <input key={`wind-${idx}`} type="number" value={val}
                  onChange={(e) => handleInputChange('wind', idx, e.target.value)}
                  className="w-16 p-1 rounded bg-white" />
              ))}
            </div>
            <Line data={{
              labels: windData.map((_, i) => `T${i + 1}`),
              datasets: [{ label: 'Wind Output (kWh)', data: windData, borderColor: 'skyblue', fill: false }]
            }} />
            <p className="text-white mt-4">🔍 Average Solar: {solarAvg} kWh/day | Average Wind: {windAvg} kWh/day</p>
            <div className="flex justify-center mt-6">
              <button onClick={() => {
                if (solarHasData && windHasData) {
                  setSubmittedResource(true);
                  setView('consumption');
                } else {
                  alert('Please make sure both Solar and Wind data are entered before proceeding!');
                }
              }} className="mt-4 px-6 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 font-bold">
                ➡️ Go to Usage
              </button>
            </div>
          </>
        )}

        {/* Energy Consumption View */}
        {view === 'consumption' && submittedResource && (
          <>
            <h2 className="text-xl text-white font-bold mb-4">⚡ Usage Entry</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {usageData.map((val, idx) => (
                <input key={`usage-${idx}`} type="number" value={val}
                  onChange={(e) => handleInputChange('usage', idx, e.target.value)}
                  className="w-16 p-1 rounded bg-white" />
              ))}
            </div>
            <Line data={{
              labels: usageData.map((_, i) => `T${i + 1}`),
              datasets: [{ label: 'Usage (kWh)', data: usageData, borderColor: 'green', fill: false }]
            }} />
            <div className="flex justify-center">
              <button onClick={() => {
                if (usageHasData) {
                  setCompareClicked(true);
                  setSubmittedUsage(true);
                  setView('forecast');
                } else {
                  alert("Please enter usage data before comparing!");
                }
              }} className="mt-4 px-4 py-2 bg-blue-400 rounded font-bold">Compare Generated & Used ➡️</button>
            </div>
          </>
        )}

        {/* Forecasting View */}
        {view === 'forecast' && submittedUsage && compareClicked && (
          <>
            <h2 className="text-xl text-white font-bold mb-4">🔮 Forecasting & Optimization</h2>
            <Line data={{
              labels: usageData.map((_, i) => `T${i + 1}`),
              datasets: [
                { label: 'Current Usage (kWh)', data: usageData, borderColor: 'green', fill: false },
                { label: 'Forecasted Usage (kWh)', data: forecastEnergy(), borderColor: 'red', borderDash: [5, 5], fill: false },
                { label: 'Total Generated (kWh)', data: totalGenerated, borderColor: 'blue', fill: false }
              ]
            }} />
            {totalGenSum >= totalUseSum ? (
              <div className="bg-green-600 text-white p-3 mt-4 rounded">✅ Excellent! Your generation exceeds usage. Consider battery storage.</div>
            ) : (
              <div className="bg-red-600 text-white p-3 mt-4 rounded">⚠️ Warning! Usage is greater than generation. Reduce load or upgrade generation.</div>
            )}
            <div className="flex justify-center">
              <button onClick={() => setView('budget')}
                className="mt-6 px-4 py-2 bg-orange-500 rounded font-bold">Go to Budget Estimation 💰</button>
            </div>
          </>
        )}

        {/* Budget View */}
        {view === 'budget' && (
          <>
            <h2 className="text-xl text-white font-bold mb-4">💰 Budget Estimation</h2>
            <ul className="text-white list-disc ml-5">
              <li>Per Day Estimate: ₹2,100</li>
              <li>Per Month Estimate: ₹63,000</li>
              <li>Used: ₹1,92,000 | Remaining: ₹70,924 from Total ₹2,62,924</li>
            </ul>
          </>
        )}

        {/* User Engagement View */}
        {view === 'user' && submittedUsage && submittedResource && compareClicked && (
          <>
            <h2 className="text-xl text-white font-bold mb-4">🧠 Smart Suggestions</h2>
            <ul className="text-white list-disc ml-5">
              {solarData.some(v => v < 40) && <li>☀️ Boost solar by cleaning panels and ensuring sunlight exposure.</li>}
              {windData.some(v => v < 30) && <li>🌬️ Weak wind input — consider alternate energy on low-wind days.</li>}
              {usageData.some((v, i) => (solarData[i] + windData[i]) < v) && <li>⚠️ Your consumption is higher than generation. Turn off unused appliances.</li>}
              {usageData.every((v, i) => (solarData[i] + windData[i]) >= v) && <li>✅ You are maintaining balanced energy usage. Keep it up!</li>}
              {forecastEnergy().some((v, i) => v > usageData[i]) && <li>🔮 Forecast predicts peak usage — use devices smartly during daytime.</li>}
              {totalUseSum > 600 && <li>🔋 Consider installing backup batteries or smart grid solutions.</li>}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

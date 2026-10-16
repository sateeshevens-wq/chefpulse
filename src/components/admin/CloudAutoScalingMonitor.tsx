import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Cpu,
  Zap,
  Activity,
  Layers,
  Globe,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  BarChart2,
} from 'lucide-react';
import { playAlertChime } from '../../utils/sound';

export const CloudAutoScalingMonitor: React.FC = () => {
  const [activeContainers, setActiveContainers] = useState(12);
  const [targetMaxContainers, setTargetMaxContainers] = useState(120);
  const [incomingReqPerSec, setIncomingReqPerSec] = useState(1850);
  const [cpuUtilizationPercent, setCpuUtilizationPercent] = useState(48);
  const [p99LatencyMs, setP99LatencyMs] = useState(38);
  const [isSimulatingSpike, setIsSimulatingSpike] = useState(false);
  const [simulatedSpikeType, setSimulatedSpikeType] = useState<string | null>(null);

  // Regional Read-Replica Telemetry across India
  const [replicas, setReplicas] = useState([
    {
      region: 'South Hub (Bengaluru)',
      zoneCode: 'in-south-1a',
      latencyMs: 12,
      health: 'OPTIMAL',
      qps: 780,
      replicationLagMs: 2.1,
      coverage: 'Karnataka, TN, Kerala, Telangana, AP',
    },
    {
      region: 'West Hub (Mumbai Master)',
      zoneCode: 'in-west-1a',
      latencyMs: 14,
      health: 'OPTIMAL (PRIMARY_WRITER)',
      qps: 1120,
      replicationLagMs: 0.0,
      coverage: 'Maharashtra, Gujarat, Goa',
    },
    {
      region: 'North Hub (Delhi NCR)',
      zoneCode: 'in-north-1b',
      latencyMs: 16,
      health: 'OPTIMAL',
      qps: 640,
      replicationLagMs: 3.4,
      coverage: 'Delhi NCR, Punjab, UP, Rajasthan',
    },
    {
      region: 'East Hub (Kolkata)',
      zoneCode: 'in-east-1a',
      latencyMs: 21,
      health: 'OPTIMAL',
      qps: 310,
      replicationLagMs: 4.2,
      coverage: 'West Bengal, Odisha, Bihar, Assam',
    },
  ]);

  const handleSimulateViralLaunchSpike = () => {
    setIsSimulatingSpike(true);
    setSimulatedSpikeType('Day-1 Nationwide Viral Spike');
    playAlertChime('accepted');

    // Simulate immediate surge
    setIncomingReqPerSec(48500);
    setCpuUtilizationPercent(86);
    setP99LatencyMs(118);

    // Auto-scaler kicks in within 1 second
    setTimeout(() => {
      setActiveContainers(74);
      setCpuUtilizationPercent(58);
      setP99LatencyMs(44);
      setReplicas((prev) =>
        prev.map((r) => ({
          ...r,
          qps: r.qps * 8,
          latencyMs: r.latencyMs + 2,
        }))
      );
    }, 1500);
  };

  const handleSimulateMumbaiSurge = () => {
    setIsSimulatingSpike(true);
    setSimulatedSpikeType('Mumbai Monsoon SOS Spike');
    playAlertChime('incoming_gig');

    setIncomingReqPerSec(24000);
    setCpuUtilizationPercent(72);
    setP99LatencyMs(62);

    setTimeout(() => {
      setActiveContainers(42);
      setCpuUtilizationPercent(51);
      setP99LatencyMs(41);
      setReplicas((prev) =>
        prev.map((r) =>
          r.zoneCode.includes('in-west')
            ? { ...r, qps: 8400, latencyMs: 16 }
            : { ...r, qps: r.qps * 2 }
        )
      );
    }, 1200);
  };

  const handleResetToBaseline = () => {
    setIsSimulatingSpike(false);
    setSimulatedSpikeType(null);
    setActiveContainers(12);
    setIncomingReqPerSec(1850);
    setCpuUtilizationPercent(48);
    setP99LatencyMs(38);
    setReplicas([
      {
        region: 'South Hub (Bengaluru)',
        zoneCode: 'in-south-1a',
        latencyMs: 12,
        health: 'OPTIMAL',
        qps: 780,
        replicationLagMs: 2.1,
        coverage: 'Karnataka, TN, Kerala, Telangana, AP',
      },
      {
        region: 'West Hub (Mumbai Master)',
        zoneCode: 'in-west-1a',
        latencyMs: 14,
        health: 'OPTIMAL (PRIMARY_WRITER)',
        qps: 1120,
        replicationLagMs: 0.0,
        coverage: 'Maharashtra, Gujarat, Goa',
      },
      {
        region: 'North Hub (Delhi NCR)',
        zoneCode: 'in-north-1b',
        latencyMs: 16,
        health: 'OPTIMAL',
        qps: 640,
        replicationLagMs: 3.4,
        coverage: 'Delhi NCR, Punjab, UP, Rajasthan',
      },
      {
        region: 'East Hub (Kolkata)',
        zoneCode: 'in-east-1a',
        latencyMs: 21,
        health: 'OPTIMAL',
        qps: 310,
        replicationLagMs: 4.2,
        coverage: 'West Bengal, Odisha, Bihar, Assam',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold uppercase tracking-wider">
                DAY-1 NATIONWIDE READY
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Google Cloud Run & Spanner Replicas
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
              <Server size={20} className="text-amber-400" />
              <span>Auto-Scaling Cloud Infrastructure & Regional Replicas</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Guarantees sub-second map loading & 100% uptime during unpredictable viral traffic spikes across India.
            </p>
          </div>

          {/* Spike Simulator Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateViralLaunchSpike}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Zap size={14} />
              <span>Simulate 50k req/s Launch Spike</span>
            </button>
            <button
              type="button"
              onClick={handleSimulateMumbaiSurge}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>🌧️ Monsoon Surge</span>
            </button>
            {isSimulatingSpike && (
              <button
                type="button"
                onClick={handleResetToBaseline}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Cluster Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
            <span className="text-neutral-400 text-[11px] font-medium">Active Cloud Run Containers</span>
            <div className="text-2xl font-black font-mono text-white flex items-center gap-2">
              <span>{activeContainers}</span>
              <span className="text-[10px] text-neutral-500 font-normal">/ {targetMaxContainers} max</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">Auto-Scales on &gt;70% CPU</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
            <span className="text-neutral-400 text-[11px] font-medium">Pan-India Ingress Traffic</span>
            <div className="text-2xl font-black font-mono text-amber-400">
              {incomingReqPerSec.toLocaleString('en-IN')} <span className="text-xs text-neutral-500">req/s</span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono">
              {isSimulatingSpike ? '🔥 High Surge Ingested' : 'Normal Equilibrium'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
            <span className="text-neutral-400 text-[11px] font-medium">Fleet CPU Utilization</span>
            <div className="text-2xl font-black font-mono text-white">
              {cpuUtilizationPercent}%
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full ${
                  cpuUtilizationPercent > 75 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${cpuUtilizationPercent}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
            <span className="text-neutral-400 text-[11px] font-medium">P99 Map Query Latency</span>
            <div className="text-2xl font-black font-mono text-emerald-400 flex items-center gap-1.5">
              <span>{p99LatencyMs} ms</span>
              <span className="text-[10px] text-emerald-400 font-normal">Sub-second ✓</span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono">Nearest GeoDNS Edge</div>
          </div>
        </div>
      </div>

      {/* Pan-India Multi-Region Read Replicas Table */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-amber-400" />
            <h4 className="text-sm font-bold text-white">
              Distributed Regional Read-Replicas Across India
            </h4>
          </div>
          <span className="text-xs text-neutral-400">Zero Cross-State Network Penalty</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2.5 px-3">Regional Replica Hub</th>
                <th className="py-2.5 px-3">Edge Latency</th>
                <th className="py-2.5 px-3">Read Load (QPS)</th>
                <th className="py-2.5 px-3">Replication Lag</th>
                <th className="py-2.5 px-3">States Covered</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {replicas.map((rep) => (
                <tr key={rep.region} className="hover:bg-neutral-950/40">
                  <td className="py-3 px-3 font-bold text-white font-sans">
                    <div>{rep.region}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{rep.zoneCode}</div>
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">
                    {rep.latencyMs} ms
                  </td>
                  <td className="py-3 px-3 text-amber-300 font-bold">
                    {rep.qps.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-neutral-300">
                    {rep.replicationLagMs} ms
                  </td>
                  <td className="py-3 px-3 text-neutral-400 font-sans text-[11px]">
                    {rep.coverage}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      ✓ {rep.health}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import { AlertTriangle, Luggage, PlaneLanding, ShieldAlert, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

const Card = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 ${className}`}>
    {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
    {children}
  </div>
);

const Badge = ({ children, className = "" }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
    {children}
  </span>
);

const StatCard = ({ icon: Icon, title, value, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600"
  };

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-16 -mt-16`}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <Icon className={`text-${color}-500`} size={24} />
          {trend && (
            <div className="flex items-center text-green-600 text-sm font-medium">
              <TrendingUp size={16} className="mr-1" />
              {trend}
            </div>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );
};

const ProgressBar = ({ percentage, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    green: "bg-green-500"
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div 
        className={`h-full ${colorClasses[color]} transition-all duration-500 ease-out rounded-full`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const StaticDashboardIncidents = () => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const incidentTypes = [
    { icon: Luggage, label: "Perte de bagage", percentage: 42, color: "blue" },
    { icon: Luggage, label: "Bagage endommagé", percentage: 21, color: "yellow" },
    { icon: ShieldAlert, label: "Vol de bagage", percentage: 8, color: "red" },
    { icon: PlaneLanding, label: "Retard de livraison", percentage: 17, color: "purple" }
  ];

  const terminals = [
    { name: "Terminal 1", count: 54 },
    { name: "Terminal 2", count: 33 },
    { name: "Terminal 3", count: 27 },
    { name: "Terminal International", count: 89 }
  ];

  const criticalityLevels = [
    { level: "Critique", percentage: 12, color: "red", icon: AlertTriangle },
    { level: "Moyen", percentage: 48, color: "yellow", icon: AlertTriangle },
    { level: "Faible", percentage: 40, color: "green", icon: AlertTriangle }
  ];

  const recentIncidents = [
    { id: "9481", type: "Perte de bagage", terminal: "T1", status: "open", statusLabel: "Ouvert" },
    { id: "9479", type: "Vol de bagage", terminal: "P2 Parking", status: "progress", statusLabel: "En cours" },
    { id: "9475", type: "Bagage endommagé", terminal: "T3", status: "closed", statusLabel: "Résolu" },
    { id: "9472", type: "Retard de livraison", terminal: "T2", status: "progress", statusLabel: "En cours" },
    { id: "9468", type: "Perte de bagage", terminal: "TI", status: "open", statusLabel: "Ouvert" }
  ];

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-red-100 text-red-700 border-red-200",
      progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
      closed: "bg-green-100 text-green-700 border-green-200"
    };
    return colors[status] || colors.open;
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: XCircle,
      progress: Clock,
      closed: CheckCircle
    };
    const Icon = icons[status];
    return Icon ? <Icon size={14} className="mr-1" /> : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Tableau de bord en temps réel
            </h1>
          </div>
        </div>

        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={AlertTriangle}
            title="Incidents du jour"
            value="78"
            trend="+12%"
            color="blue"
          />
          <StatCard 
            icon={XCircle}
            title="Incidents ouverts"
            value="124"
            color="orange"
          />
          <StatCard 
            icon={CheckCircle}
            title="Incidents résolus (24h)"
            value="56"
            trend="+8%"
            color="green"
          />
          <StatCard 
            icon={Clock}
            title="Délai moyen de résolution"
            value="2h 14min"
            trend="-5%"
            color="purple"
          />
        </div>

        {/* Incident Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Types d'incidents */}
          <Card title="Répartition par type" className="lg:col-span-1">
            <div className="space-y-5">
              {incidentTypes.map((incident, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${incident.color}-100 group-hover:scale-110 transition-transform`}>
                        <incident.icon size={20} className={`text-${incident.color}-600`} />
                      </div>
                      <span className="font-medium text-gray-700">{incident.label}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{incident.percentage}%</span>
                  </div>
                  <ProgressBar percentage={incident.percentage} color={incident.color} />
                </div>
              ))}
            </div>
          </Card>

          {/* Incidents par terminal */}
          <Card title="Incidents par terminal" className="lg:col-span-1">
            <div className="space-y-4">
              {terminals.map((terminal, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <span className="font-medium text-gray-700">{terminal.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-20">
                      <ProgressBar 
                        percentage={(terminal.count / 89) * 100} 
                        color="blue" 
                      />
                    </div>
                    <span className="text-xl font-bold text-gray-900 w-8 text-right">
                      {terminal.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Criticité */}
          <Card title="Criticité des incidents" className="lg:col-span-1">
            <div className="space-y-5">
              {criticalityLevels.map((level, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <level.icon className={`text-${level.color}-600 group-hover:scale-110 transition-transform`} size={20} />
                      <span className="font-medium text-gray-700">{level.level}</span>
                    </div>
                    <Badge className={`bg-${level.color}-100 text-${level.color}-700 border border-${level.color}-200`}>
                      {level.percentage}%
                    </Badge>
                  </div>
                  <ProgressBar percentage={level.percentage} color={level.color} />
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Recent Incidents Table */}
        <Card title="Incidents récents">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Type d'incident</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Terminal</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentIncidents.map((incident, index) => (
                  <tr 
                    key={index}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`border-b border-gray-100 transition-all ${
                      hoveredRow === index ? 'bg-blue-50 scale-[1.01]' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono font-semibold text-gray-900">#{incident.id}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{incident.type}</td>
                    <td className="py-4 px-4">
                      <Badge className="bg-gray-100 text-gray-700 border border-gray-200">
                        {incident.terminal}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`flex items-center w-fit border ${getStatusColor(incident.status)}`}>
                        {getStatusIcon(incident.status)}
                        {incident.statusLabel}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default StaticDashboardIncidents;
// Speedometer Gauge Component - Pure SVG Implementation
// Original working version - DO NOT MODIFY
import React from 'react';
import './SpeedometerGauge.css';

const SpeedometerGauge = ({ metric, title, subtitle }) => {
  if (!metric) {
    return (
      <div className="speedometer-gauge unavailable">
        <h3>{title}</h3>
        <p className="subtitle">{subtitle}</p>
        <div className="gauge-unavailable">
          <p>Data not available</p>
        </div>
      </div>
    );
  }

  const { value, normalizedValue, colorZone, status, riskLevel, interpretation } = metric;

  // SVG gauge parameters
  const size = 280;
  const center = size / 2;
  const radius = 100;
  const strokeWidth = 20;
  const startAngle = -135; // Start from bottom-left
  const endAngle = 135;    // End at bottom-right
  const totalAngle = endAngle - startAngle;

  // Calculate arc path
  const polarToCartesian = (angle) => {
    const angleInRadians = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angleInRadians),
      y: center + radius * Math.sin(angleInRadians),
    };
  };

  const createArcPath = (start, end) => {
    const startPoint = polarToCartesian(start);
    const endPoint = polarToCartesian(end);
    const largeArcFlag = end - start <= 180 ? 0 : 1;
    return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;
  };

  // Define color zones
  const zones = [
    { start: -135, end: -81, color: '#10b981', label: 'Good' },           // 0-20
    { start: -81, end: -27, color: '#fbbf24', label: 'Borderline' },      // 20-40
    { start: -27, end: 27, color: '#f97316', label: 'Moderate' },         // 40-60
    { start: 27, end: 81, color: '#ef4444', label: 'High' },              // 60-80
    { start: 81, end: 135, color: '#991b1b', label: 'Very High' }         // 80-100
  ];

  // Calculate needle angle based on normalized value (0-100)
  const needleAngle = startAngle + (normalizedValue / 100) * totalAngle;
  const needleEnd = polarToCartesian(needleAngle);

  // Get current zone color
  const zoneColors = {
    green: '#10b981',
    greenishyellow: '#84cc16',
    yellow: '#fbbf24',
    orange: '#f97316',
    red: '#ef4444',
    darkred: '#991b1b'
  };

  const currentColor = zoneColors[colorZone] || '#6b7280';

  return (
    <div className="speedometer-gauge">
      <h3 className="gauge-title">{title}</h3>
      {subtitle && <p className="gauge-subtitle">{subtitle}</p>}
      
      <div className="gauge-svg-container">
        <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
            strokeDasharray={`${Math.PI * radius} ${Math.PI * radius}`}
            strokeDashoffset={Math.PI * radius * 0.5}
          />
          
          {/* Color zones */}
          {zones.map((zone, index) => (
            <path
              key={index}
              d={createArcPath(zone.start, zone.end)}
              fill="none"
              stroke={zone.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={0.3}
            />
          ))}
          
          {/* Active progress arc */}
          <path
            d={createArcPath(startAngle, needleAngle)}
            fill="none"
            stroke={currentColor}
            strokeWidth={strokeWidth + 2}
            strokeLinecap="round"
            className="progress-arc"
          />
          
          {/* Center circle */}
          <circle
            cx={center}
            cy={center}
            r={15}
            fill={currentColor}
            className="center-circle"
          />
          
          {/* Needle */}
          <line
            x1={center}
            y1={center}
            x2={needleEnd.x}
            y2={needleEnd.y}
            stroke={currentColor}
            strokeWidth={4}
            strokeLinecap="round"
            className="needle"
          />
          
          {/* Value text */}
          <text
            x={center}
            y={center + 50}
            textAnchor="middle"
            fontSize="32"
            fontWeight="bold"
            fill={currentColor}
            className="value-text"
          >
            {value}
          </text>
          
          {/* Status text */}
          <text
            x={center}
            y={center + 75}
            textAnchor="middle"
            fontSize="14"
            fill="#6b7280"
          >
            {status}
          </text>
        </svg>
      </div>
      
      {/* Risk level badge */}
      <div className="gauge-footer">
        <div className="risk-badge" style={{ backgroundColor: currentColor }}>
          {riskLevel} Risk
        </div>
      </div>
      
      {/* Interpretation */}
      {interpretation && (
        <div className="gauge-interpretation">
          <p>{interpretation}</p>
        </div>
      )}
      
      {/* Zone labels */}
      <div className="gauge-zones">
        <div className="zone-label zone-start">
          <span style={{ color: '#10b981' }}>●</span> Good
        </div>
        <div className="zone-label zone-end">
          <span style={{ color: '#991b1b' }}>●</span> Critical
        </div>
      </div>
    </div>
  );
};

export default SpeedometerGauge;


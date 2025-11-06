// Enhanced Speedometer Gauge Component using react-speedometer library
// OPTIONAL ALTERNATIVE - Does not replace existing SpeedometerGauge.js
import React from 'react';
import Speedometer, {
  Background,
  Arc,
  Needle,
  Progress,
  Marks,
  Indicator,
} from 'react-speedometer';
import './EnhancedSpeedometerGauge.css';

const EnhancedSpeedometerGauge = ({ metric, title, subtitle }) => {
  if (!metric) {
    return (
      <div className="enhanced-speedometer-gauge unavailable">
        <h3>{title}</h3>
        <p className="subtitle">{subtitle}</p>
        <div className="gauge-unavailable">
          <p>Data not available</p>
        </div>
      </div>
    );
  }

  const { value, normalizedValue, colorZone, status, riskLevel, unit, interpretation } = metric;

  // Get zone colors
  const zoneColors = {
    green: '#10b981',
    greenishyellow: '#84cc16',
    yellow: '#fbbf24',
    orange: '#f97316',
    red: '#ef4444',
    darkred: '#991b1b'
  };

  const currentColor = zoneColors[colorZone] || '#6b7280';

  // Define color stops for gradient arc
  const getArcColor = (value) => {
    if (value < 20) return zoneColors.green;
    if (value < 40) return zoneColors.yellow;
    if (value < 60) return zoneColors.orange;
    if (value < 80) return zoneColors.red;
    return zoneColors.darkred;
  };

  return (
    <div className="enhanced-speedometer-gauge">
      <h3 className="gauge-title">{title}</h3>
      {subtitle && <p className="gauge-subtitle">{subtitle}</p>}
      
      <div className="gauge-container">
        <Speedometer 
          value={normalizedValue} 
          max={100} 
          width={300} 
          height={200} 
          fontFamily="Arial"
          angle={180}
        >
          <Background angle={180} color="#f3f4f6" />
          
          {/* Colored arc segments */}
          <Arc 
            arcWidth={20} 
            color="#10b981"
            opacity={normalizedValue >= 0 && normalizedValue < 20 ? 1 : 0.3}
          />
          <Arc 
            arcWidth={20} 
            color="#fbbf24"
            opacity={normalizedValue >= 20 && normalizedValue < 40 ? 1 : 0.3}
          />
          <Arc 
            arcWidth={20} 
            color="#f97316"
            opacity={normalizedValue >= 40 && normalizedValue < 60 ? 1 : 0.3}
          />
          <Arc 
            arcWidth={20} 
            color="#ef4444"
            opacity={normalizedValue >= 60 && normalizedValue < 80 ? 1 : 0.3}
          />
          <Arc 
            arcWidth={20} 
            color="#991b1b"
            opacity={normalizedValue >= 80 ? 1 : 0.3}
          />
          
          {/* Progress arc highlighting current position */}
          <Progress 
            arcWidth={24} 
            color={currentColor}
            opacity={0.8}
          />
          
          {/* Needle */}
          <Needle 
            baseOffset={40} 
            circleRadius={15}
            color={currentColor}
          />
          
          {/* Marks */}
          <Marks 
            step={20} 
            lineHeight={10}
            lineWidth={2}
            color="#6b7280"
          />
          
          {/* Value indicator at bottom */}
          <Indicator>
            {(displayValue, textProps) => (
              <text 
                {...textProps} 
                fontSize={42} 
                fill={currentColor}
                fontWeight="bold"
                x={150} 
                y={180} 
                textAnchor="middle" 
                fontFamily="Arial"
              >
                {value} {unit}
              </text>
            )}
          </Indicator>
        </Speedometer>
        
        {/* Status badges */}
        <div className="gauge-status">
          <div className="status-badge" style={{ backgroundColor: currentColor }}>
            {status}
          </div>
          <div className="risk-level" style={{ color: currentColor }}>
            {riskLevel} Risk
          </div>
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
          <span style={{ color: zoneColors.green }}>●</span> Good
        </div>
        <div className="zone-label zone-end">
          <span style={{ color: zoneColors.darkred }}>●</span> Critical
        </div>
      </div>
    </div>
  );
};

export default EnhancedSpeedometerGauge;


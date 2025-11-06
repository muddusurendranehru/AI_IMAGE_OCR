# ⚡ HOMA-IQ Score - Quick Start Guide

## What You Need to Know

**HOMA-IQ** is an automatic clinical risk calculator that gives each lab report a **health score from 0-100** based on metabolic parameters.

---

## 🎯 Quick Reference

| Score | What It Means | Action Needed |
|-------|---------------|---------------|
| **80-100** 🟢 | Excellent health | Keep it up! |
| **60-79** 🔵 | Good health | Minor tweaks |
| **40-59** 🟠 | Moderate risk | Lifestyle changes |
| **20-39** 🔴 | High risk | See doctor soon |
| **0-19** 🔴 | Very high risk | Urgent care needed |

---

## 📊 What It Measures

✅ **Blood Sugar** (Glucose, HbA1c)  
✅ **Cholesterol** (Total, HDL, LDL)  
✅ **Triglycerides**  
✅ **Insulin Resistance** (HOMA-IR if insulin available)  

---

## 🚀 How It Works

```
1. Upload lab report image
2. OCR extracts lab values automatically
3. HOMA-IQ calculates score instantly
4. Dashboard shows color-coded score
5. View details for full assessment
```

---

## 👁️ What You'll See

### On Dashboard (Report Cards)
- **Score Badge**: Top-right corner, color-coded
- **Alert Banner**: If any values are abnormal
- **Quick Status**: Instant visual feedback

### In Detail View (Click "View Details")
1. **Large Score Display**: Circular, animated, color-coded
2. **Risk Level**: Clear assessment (Excellent/Good/Moderate/High/Very High)
3. **Abnormal Parameters**: Red-highlighted list of what needs attention
4. **HOMA-IR**: Insulin resistance calculation (if applicable)
5. **Detailed Table**: All lab values with individual scores
6. **Recommendations**: Tailored clinical guidance

---

## 🎨 Color Guide

- 🟢 **Green**: Excellent (80-100) - All good!
- 🔵 **Blue**: Good (60-79) - Doing well
- 🟠 **Orange**: Moderate (40-59) - Needs attention
- 🔴 **Red**: High Risk (20-39) - Important
- 🔴 **Dark Red**: Very High (0-19) - Urgent

---

## 📝 Example Scores

### Healthy Patient
```
Glucose: 90 mg/dL ✅
Cholesterol: 180 mg/dL ✅
HDL: 55 mg/dL ✅
LDL: 95 mg/dL ✅
→ HOMA-IQ: 92/100 (Excellent) 🟢
```

### Pre-Diabetic Patient
```
Glucose: 130 mg/dL ⚠️
HbA1c: 6.0% ⚠️
Cholesterol: 240 mg/dL ⚠️
→ HOMA-IQ: 48/100 (Moderate Risk) 🟠
```

### High-Risk Patient
```
Glucose: 160 mg/dL ⚠️
Cholesterol: 280 mg/dL ⚠️
LDL: 190 mg/dL ⚠️
Triglycerides: 300 mg/dL ⚠️
→ HOMA-IQ: 28/100 (High Risk) 🔴
```

---

## ⚡ Key Features

### ✅ Automatic
- Calculates immediately after OCR
- No manual input needed
- Real-time assessment

### ✅ Visual
- Color-coded scores
- Animated displays
- Easy-to-read tables

### ✅ Actionable
- Clear recommendations
- Identifies abnormal values
- Prioritizes attention areas

### ✅ Clinical
- Based on medical guidelines
- Includes HOMA-IR calculation
- Evidence-based ranges

---

## 🎓 Medical Context

### HOMA-IR (Insulin Resistance)
If both glucose and insulin are available, the system calculates HOMA-IR:

**Formula**: (Glucose × Insulin) / 405

**Interpretation**:
- **<1.9**: Normal insulin sensitivity ✅
- **1.9-2.9**: Early insulin resistance ⚠️
- **>2.9**: Insulin resistant 🔴

### Why It Matters
- Predicts Type 2 diabetes risk
- Indicates metabolic syndrome
- Guides treatment decisions

---

## 💡 Tips for Staff

1. **Don't ignore orange/red scores** - They need follow-up
2. **Click "View Details"** - See exactly what's abnormal
3. **Read recommendations** - Tailored to risk level
4. **Use for patient education** - Visual scores help communication
5. **Track over time** - Monitor improvement/deterioration

---

## 🔍 Finding the Score

### In Report List
Look for the **colored badge** in the top-right of each report card:
```
┌─────────────────────────┐
│ Blood Test      [85]    │ ← Score badge (green)
│                 HOMA-IQ │
│                Excellent│
│                         │
│ Patient: John Doe       │
│ ...                     │
└─────────────────────────┘
```

### In Detail View
Large circular score at the top:
```
       ┌─────┐
       │  85 │  ← Big, color-coded
       │ /100│
       └─────┘
     Excellent
```

---

## 🚨 Alert System

### Red Alert Banner
Appears on report card if ANY parameter is abnormal:
```
⚠️ 3 parameter(s) need attention
```

### Abnormal Parameters List
In detail view, shows:
```
⚠️ Parameters Requiring Attention:
┌──────────────────────────────────┐
│ GLUCOSE: 145 mg/dL (Diabetic)   │
│ LDL: 180 mg/dL (High)            │
│ TRIGLYCERIDES: 250 mg/dL (High)  │
└──────────────────────────────────┘
```

---

## 📱 Mobile View

Fully responsive - works on:
- Desktop computers
- Tablets
- Smartphones
- Touch screens

All elements adapt to screen size while maintaining functionality.

---

## 🎉 Benefits

### For Doctors
✅ Instant risk assessment  
✅ No calculations needed  
✅ Clear abnormal value alerts  
✅ Clinical decision support  

### For Patients
✅ Easy-to-understand scores  
✅ Visual health status  
✅ Motivates lifestyle changes  
✅ Tracks progress over time  

### For Hospital
✅ Faster workflow  
✅ Reduced errors  
✅ Better documentation  
✅ Improved patient care  

---

## ❓ FAQ

**Q: What if not all parameters are available?**  
A: Score calculated based on available parameters. Minimum 1 parameter needed.

**Q: Is the score a diagnosis?**  
A: No, it's a screening tool. Always use clinical judgment and full patient context.

**Q: Can I customize the ranges?**  
A: Yes, reference ranges are configurable in the backend service.

**Q: What if OCR misses a value?**  
A: You can manually edit the report (future feature). Currently, reupload with clearer image.

**Q: Is this clinically validated?**  
A: Based on established guidelines from ADA, AHA, and NCEP. Not a replacement for clinical assessment.

---

## 📚 More Information

- **Full Documentation**: See [HOMA_IQ_FEATURE.md](HOMA_IQ_FEATURE.md)
- **Technical Details**: Backend implementation, API specs
- **Clinical References**: Medical guidelines, formulas
- **Testing Guide**: How to test with sample data

---

## 🚀 Getting Started

1. **Upload a lab report** with metabolic parameters
2. **Wait for OCR** to process
3. **See the score** appear automatically
4. **Click "View Details"** for full assessment
5. **Use the insights** for clinical decisions

**That's it! The system does the rest.** 🎉

---

**Quick Start Version**: 1.0  
**For**: Medical Staff, Hospital Admins, Clinicians  
**Feature**: HOMA-IQ Clinical Score System


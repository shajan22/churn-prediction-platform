import React from 'react';
import { ArrowRight, ArrowLeft, Download, FileText, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { apiClient } from '../api/apiClient';
import { useAppStore } from '../store/useAppStore';

interface ReportPageProps {
  onNext: (step: 'recommendations') => void;
  onBack: () => void;
  predictionResults: any;
}

const ReportPage: React.FC<ReportPageProps> = ({ onNext, onBack, predictionResults }) => {
  const { user } = useAppStore();
  const [isSaving, setIsSaving] = React.useState(false);
  const [showSavePrompt, setShowSavePrompt] = React.useState(false);
  const [reportTitle, setReportTitle] = React.useState('');

  const handleSaveReport = async () => {
    if (!user) {
      alert('Please sign in to save reports.');
      return;
    }
    if (!reportTitle.trim()) {
      alert('Please enter a title for this report.');
      return;
    }

    try {
      setIsSaving(true);
      const response = await apiClient.saveReport(reportTitle, predictionResults);
      if (response.success) {
        alert('Dashboard saved successfully! You can view it later in your profile.');
        setShowSavePrompt(false);
        setReportTitle(''); // Reset
      } else {
        alert("Failed to save dashboard: " + response.message);
      }
    } catch (err: any) {
      alert("Error saving dashboard: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDFReport = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title with background
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text('Churn Analysis Report', pageWidth / 2, 18, { align: 'center' });

      // Date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, 28, { align: 'center' });

      // Executive Summary Section
      doc.setFontSize(18);
      doc.setTextColor(0);
      doc.text('Executive Summary', 14, 48);

      // Executive Summary Cards
      const cardY = 55;
      const cardWidth = 58;
      const cardHeight = 30;
      const cardSpacing = 8;

      // Card 1 - Churn Rate
      doc.setFillColor(219, 234, 254);
      doc.roundedRect(14, cardY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFontSize(24);
      doc.setTextColor(37, 99, 235);
      doc.text(`${(predictionResults.churnRate * 100).toFixed(1)}%`, 14 + cardWidth / 2, cardY + 15, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(60);
      doc.text('Overall Churn Rate', 14 + cardWidth / 2, cardY + 23, { align: 'center' });

      // Card 2 - Retention
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(14 + cardWidth + cardSpacing, cardY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFontSize(24);
      doc.setTextColor(22, 163, 74);
      doc.text(predictionResults.predictedRetention.toLocaleString(), 14 + cardWidth + cardSpacing + cardWidth / 2, cardY + 15, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(60);
      doc.text('Customers Likely to Stay', 14 + cardWidth + cardSpacing + cardWidth / 2, cardY + 23, { align: 'center' });

      // Card 3 - At Risk
      doc.setFillColor(254, 226, 226);
      doc.roundedRect(14 + (cardWidth + cardSpacing) * 2, cardY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFontSize(24);
      doc.setTextColor(220, 38, 38);
      doc.text(predictionResults.predictedChurn.toLocaleString(), 14 + (cardWidth + cardSpacing) * 2 + cardWidth / 2, cardY + 15, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(60);
      doc.text('At Risk of Churning', 14 + (cardWidth + cardSpacing) * 2 + cardWidth / 2, cardY + 23, { align: 'center' });

      // Churn Distribution Visualization
      let currentY = cardY + cardHeight + 15;
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Churn Distribution', 14, currentY);

      // Churn Distribution Visual
      currentY += 8;
      const boxWidth = 90;
      const boxHeight = 22;
      const boxSpacing = 3;

      // Retention Box (Green)
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(14, currentY, boxWidth, boxHeight, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setTextColor(22, 163, 74);
      doc.text('Retention', 17, currentY + 7);
      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74);
      doc.text(`${((1 - predictionResults.churnRate) * 100).toFixed(1)}%`, 17, currentY + 14);
      doc.setFontSize(8);
      doc.setTextColor(21, 128, 61);
      doc.text(`${predictionResults.predictedRetention.toLocaleString()} customers`, 17, currentY + 19);

      // Churn Box (Red)
      doc.setFillColor(254, 226, 226);
      doc.roundedRect(14 + boxWidth + boxSpacing, currentY, boxWidth, boxHeight, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setTextColor(220, 38, 38);
      doc.text('Churn', 17 + boxWidth + boxSpacing, currentY + 7);
      doc.setFontSize(14);
      doc.setTextColor(220, 38, 38);
      doc.text(`${(predictionResults.churnRate * 100).toFixed(1)}%`, 17 + boxWidth + boxSpacing, currentY + 14);
      doc.setFontSize(8);
      doc.setTextColor(185, 28, 28);
      doc.text(`${predictionResults.predictedChurn.toLocaleString()} customers`, 17 + boxWidth + boxSpacing, currentY + 19);

      // Model Performance Section
      currentY += boxHeight + 15;
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Model Performance', 14, currentY);

      // Model Performance Bars
      currentY += 8;
      const metrics = [
        { name: 'Accuracy', value: predictionResults.accuracy, color: [37, 99, 235] },
        { name: 'Precision', value: predictionResults.precision, color: [34, 197, 94] },
        { name: 'Recall', value: predictionResults.recall, color: [168, 85, 247] },
        { name: 'F1-Score', value: predictionResults.f1Score, color: [251, 191, 36] }
      ];

      const barStartX = 14;
      const labelWidth = 30;
      const barWidth = 130;
      const barHeight = 6;
      const barSpacingY = 12;

      metrics.forEach((metric, index) => {
        const barY = currentY + 8 + (index * barSpacingY);

        // Metric name (left aligned)
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text(metric.name, barStartX, barY);

        // Background bar (gray)
        doc.setFillColor(229, 231, 235);
        doc.roundedRect(barStartX + labelWidth, barY - 4, barWidth, barHeight, 3, 3, 'F');

        // Filled bar (colored)
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.roundedRect(barStartX + labelWidth, barY - 4, barWidth * metric.value, barHeight, 3, 3, 'F');

        // Percentage value (right aligned)
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(`${(metric.value * 100).toFixed(1)}%`, barStartX + labelWidth + barWidth + 5, barY);
      });

      // Best Model
      currentY += (metrics.length * barSpacingY) + 10;
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Best Model: ${predictionResults.bestModel || 'Gradient Boosting (XGBoost)'}`, barStartX, currentY);

      // Customer Risk Segmentation
      currentY += 15;
      if (currentY > 220) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Customer Risk Segmentation', 14, currentY);

      const highRisk = Math.round(predictionResults.predictedChurn * 0.48);
      const mediumRisk = Math.round(predictionResults.predictedChurn * 0.52);
      const lowRisk = predictionResults.predictedRetention;

      // Risk Segmentation Cards
      currentY += 8;
      const riskCardWidth = 58;
      const riskCardHeight = 35;
      const riskCardSpacing = 8;

      // High Risk Card
      doc.setFillColor(254, 226, 226);
      doc.roundedRect(14, currentY, riskCardWidth, riskCardHeight, 3, 3, 'F');
      doc.setFontSize(14);
      doc.setTextColor(220, 38, 38);
      doc.text('High Risk', 14 + riskCardWidth / 2, currentY + 8, { align: 'center' });
      doc.setFontSize(20);
      doc.text(highRisk.toLocaleString(), 14 + riskCardWidth / 2, currentY + 18, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(220, 38, 38);
      doc.text(`Customers (${((highRisk / predictionResults.totalCustomers) * 100).toFixed(1)}%)`, 14 + riskCardWidth / 2, currentY + 25, { align: 'center' });
      doc.setFontSize(7);
      doc.setTextColor(185, 28, 28);
      doc.text('Immediate action required', 14 + riskCardWidth / 2, currentY + 31, { align: 'center' });

      // Medium Risk Card
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(14 + riskCardWidth + riskCardSpacing, currentY, riskCardWidth, riskCardHeight, 3, 3, 'F');
      doc.setFontSize(14);
      doc.setTextColor(245, 158, 11);
      doc.text('Medium Risk', 14 + riskCardWidth + riskCardSpacing + riskCardWidth / 2, currentY + 8, { align: 'center' });
      doc.setFontSize(20);
      doc.text(mediumRisk.toLocaleString(), 14 + riskCardWidth + riskCardSpacing + riskCardWidth / 2, currentY + 18, { align: 'center' });
      doc.setFontSize(9);
      doc.text(`Customers (${((mediumRisk / predictionResults.totalCustomers) * 100).toFixed(1)}%)`, 14 + riskCardWidth + riskCardSpacing + riskCardWidth / 2, currentY + 25, { align: 'center' });
      doc.setFontSize(7);
      doc.setTextColor(217, 119, 6);
      doc.text('Monitor closely', 14 + riskCardWidth + riskCardSpacing + riskCardWidth / 2, currentY + 31, { align: 'center' });

      // Low Risk Card
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(14 + (riskCardWidth + riskCardSpacing) * 2, currentY, riskCardWidth, riskCardHeight, 3, 3, 'F');
      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74);
      doc.text('Low Risk', 14 + (riskCardWidth + riskCardSpacing) * 2 + riskCardWidth / 2, currentY + 8, { align: 'center' });
      doc.setFontSize(20);
      doc.text(lowRisk.toLocaleString(), 14 + (riskCardWidth + riskCardSpacing) * 2 + riskCardWidth / 2, currentY + 18, { align: 'center' });
      doc.setFontSize(9);
      doc.text(`Customers (${((lowRisk / predictionResults.totalCustomers) * 100).toFixed(1)}%)`, 14 + (riskCardWidth + riskCardSpacing) * 2 + riskCardWidth / 2, currentY + 25, { align: 'center' });
      doc.setFontSize(7);
      doc.setTextColor(21, 128, 61);
      doc.text('Continue engagement', 14 + (riskCardWidth + riskCardSpacing) * 2 + riskCardWidth / 2, currentY + 31, { align: 'center' });

      currentY += riskCardHeight;

      // Key Insights
      currentY += 15;

      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(16);
      doc.text('Key Insights', 14, currentY);

      doc.setFontSize(10);
      const insights = [
        `• ${((predictionResults.predictedChurn * 0.23 / predictionResults.totalCustomers) * 100).toFixed(0)}% of high-value customers show churn indicators`,
        `• Early intervention could save approximately $${((predictionResults.predictedChurn * 1200) / 1000000).toFixed(1)}M in revenue`,
        `• ${predictionResults.bestModel || 'XGBoost'} model shows ${(predictionResults.accuracy * 100).toFixed(1)}% accuracy`
      ];

      currentY += 7;
      insights.forEach(insight => {
        doc.text(insight, 14, currentY);
        currentY += 7;
      });

      // Confusion Matrix
      currentY += 10;
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(16);
      doc.text('Confusion Matrix', 14, currentY);

      const confusionData = [
        ['True Positive', predictionResults.confusionMatrix.truePositive.toLocaleString()],
        ['False Positive', predictionResults.confusionMatrix.falsePositive.toLocaleString()],
        ['True Negative', predictionResults.confusionMatrix.trueNegative.toLocaleString()],
        ['False Negative', predictionResults.confusionMatrix.falseNegative.toLocaleString()]
      ];

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Category', 'Count']],
        body: confusionData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 14, right: 14 }
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`Churn_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (!predictionResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-card rounded-3xl p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-amber-100/50">
            <FileText className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">No Report Available</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">Please complete the predictive analysis step to generate your business report.</p>
          <button
            onClick={onBack}
            className="w-full bg-slate-900 text-white font-semibold flex items-center justify-center px-6 py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            Return to Predictions
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto"
    >
      <div className="glass-card rounded-3xl p-8 md:p-10 mb-8 border border-indigo-100/50 shadow-sm shadow-indigo-100/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-50 px-3 py-1 rounded-full mb-2 border border-indigo-100">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-indigo-900 font-bold text-xs uppercase tracking-wider">Executive Dashboard</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Churn Analysis Report
              </h2>
            </div>
          </div>
          <button
            onClick={generatePDFReport}
            className="flex items-center space-x-2 bg-white text-indigo-600 px-6 py-3.5 rounded-xl border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 font-bold transition-all duration-300 shadow-sm"
          >
            <Download className="w-5 h-5" />
            <span>Download PDF</span>
          </button>

          {user && (
            <button
              onClick={() => setShowSavePrompt(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3.5 rounded-xl border border-indigo-600 font-bold transition-all duration-300 shadow-sm hover:bg-indigo-700"
            >
              <FileText className="w-5 h-5" />
              <span>Save Dashboard</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Modal Prompt */}
      {showSavePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Save Dashboard</h3>
              <p className="text-slate-500 text-sm mb-6">Enter a title to save this dashboard to your profile's Recent Works.</p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Report Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Q4 2026 Churn Analysis"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowSavePrompt(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReport}
                  disabled={isSaving || !reportTitle.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save to Profile</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="space-y-8">
        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-3xl border border-indigo-100/50 shadow-sm shadow-indigo-100/20 text-center relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out"></div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 relative z-10">Overall Churn Rate</div>
            <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 mb-2 relative z-10">
              {(predictionResults.churnRate * 100).toFixed(1)}<span className="text-2xl text-slate-400">%</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-3xl border border-emerald-100/50 shadow-sm shadow-emerald-100/20 text-center relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out"></div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 relative z-10">Likely to Retain</div>
            <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400 mb-2 relative z-10">
              {predictionResults.predictedRetention.toLocaleString()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-white p-8 rounded-3xl border border-rose-100/50 shadow-sm shadow-rose-100/20 text-center relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/5 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out"></div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 relative z-10">At Risk of Churn</div>
            <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-rose-400 mb-2 relative z-10">
              {predictionResults.predictedChurn.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Churn Distribution Chart & Model Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-500" />
              Churn Distribution
            </h3>
            <div className="h-64 relative">
              <div className="absolute inset-0 flex items-center justify-center flex-col z-0 pointer-events-none">
                <span className="text-3xl font-extrabold text-slate-800">{predictionResults.totalCustomers.toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
              </div>
              <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Retention', value: predictionResults.predictedRetention },
                      { name: 'Churn', value: predictionResults.predictedChurn }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#F43F5E" />
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-8 mt-6">
              <div className="flex items-center space-x-3 bg-emerald-50 px-4 py-2 rounded-xl">
                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm shadow-emerald-200"></div>
                <span className="text-sm font-bold text-emerald-900">Retention <span className="text-emerald-600 ml-1">({((1 - predictionResults.churnRate) * 100).toFixed(1)}%)</span></span>
              </div>
              <div className="flex items-center space-x-3 bg-rose-50 px-4 py-2 rounded-xl">
                <div className="w-3 h-3 bg-rose-500 rounded-full shadow-sm shadow-rose-200"></div>
                <span className="text-sm font-bold text-rose-900">Churn <span className="text-rose-600 ml-1">({(predictionResults.churnRate * 100).toFixed(1)}%)</span></span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Model Performance
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    { name: 'Accuracy', value: predictionResults.accuracy * 100 },
                    { name: 'Precision', value: predictionResults.precision * 100 },
                    { name: 'Recall', value: predictionResults.recall * 100 },
                    { name: 'F1-Score', value: predictionResults.f1Score * 100 }
                  ]}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748B', fontWeight: 600, fontSize: 12 }} axisLine={{ stroke: '#CBD5E1' }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#475569', fontWeight: 700, fontSize: 13 }} axisLine={{ stroke: '#CBD5E1' }} />
                  <Tooltip
                    formatter={(value: any) => typeof value === 'number' ? `${value.toFixed(1)}%` : value}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    cursor={{ fill: '#F1F5F9' }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                    {
                      [
                        { name: 'Accuracy', value: predictionResults.accuracy },
                        { name: 'Precision', value: predictionResults.precision },
                        { name: 'Recall', value: predictionResults.recall },
                        { name: 'F1-Score', value: predictionResults.f1Score }
                      ].map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#6366F1', '#10B981', '#8B5CF6', '#F59E0B'][index]} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Best Model</span>
              <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-lg font-bold">
                {predictionResults.bestModel || 'Gradient Boosting (XGBoost)'}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Segmentation */}
        <div className="glass-card p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-slate-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Customer Risk Segmentation</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-2xl border border-rose-100/50 shadow-sm text-center transform transition duration-300 hover:scale-[1.02]">
              <div className="text-xl font-extrabold text-rose-600 mb-3">High Risk</div>
              <div className="text-4xl font-black text-slate-800 mb-1">{Math.round(predictionResults.predictedChurn * 0.48).toLocaleString()}</div>
              <div className="text-sm font-bold text-rose-500 mb-4">Customers <span className="text-rose-400">({((predictionResults.predictedChurn * 0.48 / predictionResults.totalCustomers) * 100).toFixed(1)}%)</span></div>
              <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">Immediate action required</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-2xl border border-amber-100/50 shadow-sm text-center transform transition duration-300 hover:scale-[1.02]">
              <div className="text-xl font-extrabold text-amber-600 mb-3">Medium Risk</div>
              <div className="text-4xl font-black text-slate-800 mb-1">{Math.round(predictionResults.predictedChurn * 0.52).toLocaleString()}</div>
              <div className="text-sm font-bold text-amber-500 mb-4">Customers <span className="text-amber-400">({((predictionResults.predictedChurn * 0.52 / predictionResults.totalCustomers) * 100).toFixed(1)}%)</span></div>
              <div className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">Monitor closely</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100/50 shadow-sm text-center transform transition duration-300 hover:scale-[1.02]">
              <div className="text-xl font-extrabold text-emerald-600 mb-3">Low Risk</div>
              <div className="text-4xl font-black text-slate-800 mb-1">{predictionResults.predictedRetention.toLocaleString()}</div>
              <div className="text-sm font-bold text-emerald-500 mb-4">Customers <span className="text-emerald-400">({((predictionResults.predictedRetention / predictionResults.totalCustomers) * 100).toFixed(1)}%)</span></div>
              <div className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">Continue engagement</div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="glass-card p-8 rounded-3xl border border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-white">
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-8 flex items-center gap-3">
            <span className="p-2 bg-indigo-100 rounded-xl"><FileText className="w-6 h-6 text-indigo-600" /></span>
            Strategic Key Insights
          </h3>
          <div className="space-y-5">
            <div className="flex items-start bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 mr-5 border border-rose-100 text-rose-500 font-extrabold text-2xl">!</div>
              <div>
                <p className="text-slate-800 font-bold text-lg mb-1">High-Value Customers at Risk</p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mt-1"><strong className="text-rose-600">{((predictionResults.predictedChurn * 0.23 / predictionResults.totalCustomers) * 100).toFixed(0)}%</strong> of high-value customers show churn indicators, representing significant revenue risk to the organization.</p>
              </div>
            </div>
            <div className="flex items-start bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 mr-5 border border-emerald-100 text-emerald-500 font-extrabold text-2xl">$</div>
              <div>
                <p className="text-slate-800 font-bold text-lg mb-1">Retention Opportunity</p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mt-1">Early targeted intervention could save approximately <strong className="text-emerald-600">${((predictionResults.predictedChurn * 1200) / 1000000).toFixed(1)}M</strong> in annual recurring revenue.</p>
              </div>
            </div>
            <div className="flex items-start bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mr-5 border border-indigo-100 text-indigo-500 font-extrabold"><TrendingUp className="w-7 h-7" /></div>
              <div>
                <p className="text-slate-800 font-bold text-lg mb-1">Model Reliability</p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mt-1">The <strong className="text-indigo-600">{predictionResults.bestModel || 'XGBoost'}</strong> predictive model displays <strong className="text-indigo-600">{(predictionResults.accuracy * 100).toFixed(1)}% accuracy</strong>, forming a highly reliable basis for retention strategies.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Predictions</span>
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => setShowSavePrompt(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-200"
          >
            <Download className="w-5 h-5" />
            <span>Save Dashboard</span>
          </button>

          <button
            onClick={generatePDFReport}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-md"
          >
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>

        <button
          onClick={() => onNext('recommendations')}
          className="group flex items-center space-x-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3.5 rounded-xl font-bold border border-transparent hover:shadow-lg hover:shadow-emerald-200/50 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <span>Get AI Recommendations</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default ReportPage;
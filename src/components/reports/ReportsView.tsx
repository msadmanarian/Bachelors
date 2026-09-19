import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Share2,
  TrendingUp,
  Table as TableIcon,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Deposit,
  Expense,
  House,
  MealEntry,
  Member,
  MonthlyHisabReport,
  SpecialMeal,
} from '../../domain/types';
import { useI18n } from '../../i18n';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface ReportsViewProps {
  house: House;
  hisabReport: MonthlyHisabReport;
  members: Member[];
  meals: MealEntry[];
  expenses: Expense[];
  deposits: Deposit[];
  specialMeals?: SpecialMeal[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  house,
  hisabReport,
  members,
  meals,
  expenses,
  deposits,
  specialMeals = [],
}) => {
  const { t, formatCurrency } = useI18n();
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'statement' | 'progressive' | 'settlement'>('statement');

  // Compute days in month
  const [yearStr, monthStr] = hisabReport.monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Progressive Bazar & Meal Rate Breakdown
  const activeBazarExpenses = expenses
    .filter((e) => !e.isDeleted && e.expenseType === 'meal_bazar' && e.monthKey === hisabReport.monthKey)
    .sort((a, b) => a.date.localeCompare(b.date));

  let cumulativeBazar = 0;
  const progressiveTimeline = activeBazarExpenses.map((exp) => {
    cumulativeBazar += exp.amount;
    const mealsUpToDate = meals
      .filter((m) => !m.isDeleted && m.monthKey === hisabReport.monthKey && m.date <= exp.date)
      .reduce((s, m) => s + m.totalMeals, 0);
    const interimRate = mealsUpToDate > 0 ? (cumulativeBazar / mealsUpToDate).toFixed(2) : '0.00';
    return {
      date: exp.date,
      title: exp.title,
      amount: exp.amount,
      cumulativeBazar,
      mealsUpToDate,
      interimRate,
    };
  });

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // --- PAGE 1: Master Settlement Statement ---
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 297, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(house.name || "Bachelors' Meal Manager", 14, 11);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Monthly Hisab Statement — Period: ${hisabReport.monthKey}`, 14, 18);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 235, 18);

      // KPI Boxes
      const kpiData = [
        [
          `Total Group Meals: ${hisabReport.totalMeals}`,
          `Total Bazar Cost: ${house.currency} ${hisabReport.totalMealBazarExpense.toFixed(2)}`,
          `Calculated Meal Rate: ${house.currency} ${hisabReport.mealRate.toFixed(2)} / meal`,
        ],
        [
          `Shared Utilities: ${house.currency} ${hisabReport.totalUtilityExpense.toFixed(2)}`,
          `Total Deposits: ${house.currency} ${hisabReport.totalDeposits.toFixed(2)}`,
          `Fund Cash-in-Hand: ${house.currency} ${hisabReport.cashInHand.toFixed(2)}`,
        ],
      ];

      autoTable(doc, {
        startY: 28,
        head: [],
        body: kpiData,
        theme: 'plain',
        styles: { fontSize: 9.5, fontStyle: 'bold', cellPadding: 2, textColor: [30, 41, 59] },
      });

      // Master Summary Table
      const tableHead = [
        [
          '#',
          'Member Name',
          'Total Meals',
          'Meal Cost',
          'Utility Share',
          'Feast Share',
          'Total Cost',
          'Total Deposits',
          'Net Balance',
          'Status',
        ],
      ];

      const tableBody = hisabReport.membersSummary.map((m, idx) => [
        idx + 1,
        m.memberName,
        m.totalMeals,
        `${house.currency} ${m.mealCost.toFixed(2)}`,
        `${house.currency} ${m.utilityCost.toFixed(2)}`,
        `${house.currency} ${m.feastCost.toFixed(2)}`,
        `${house.currency} ${m.totalCost.toFixed(2)}`,
        `${house.currency} ${m.totalDeposit.toFixed(2)}`,
        `${m.netBalance > 0 ? '+' : ''}${house.currency} ${m.netBalance.toFixed(2)}`,
        m.status.toUpperCase(),
      ]);

      const lastY = (doc as any).lastAutoTable?.finalY || 45;

      autoTable(doc, {
        startY: lastY + 4,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 2.5 },
        foot: [
          [
            'TOTAL',
            `${hisabReport.totalMembers} Members`,
            hisabReport.totalMeals,
            `${house.currency} ${hisabReport.totalMealBazarExpense.toFixed(2)}`,
            `${house.currency} ${hisabReport.totalUtilityExpense.toFixed(2)}`,
            `${house.currency} ${hisabReport.totalFeastExpense.toFixed(2)}`,
            `${house.currency} ${hisabReport.totalGroupExpense.toFixed(2)}`,
            `${house.currency} ${hisabReport.totalDeposits.toFixed(2)}`,
            `${house.currency} ${hisabReport.cashInHand.toFixed(2)}`,
            'RECONCILED',
          ],
        ],
        footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
      });

      // Signatures
      const sigY = (doc as any).lastAutoTable?.finalY || 140;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('________________________________', 25, Math.min(195, sigY + 20));
      doc.text('Prepared By (Mess Manager)', 32, Math.min(200, sigY + 25));

      doc.text('________________________________', 215, Math.min(195, sigY + 20));
      doc.text('Verified By (Members Audited)', 222, Math.min(200, sigY + 25));

      // --- PAGE 2: Detailed Day-by-Day Meal Grid Matrix ---
      doc.addPage('a4', 'landscape');

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 297, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`Daily Meal Matrix Grid (Days 1 to ${daysInMonth}) — ${hisabReport.monthKey}`, 14, 12);

      // Build grid headers
      const gridHeaders = ['Member Name', ...daysArray.map((d) => `${d}`), 'Total'];

      const mealMap = new Map<string, number>();
      for (const m of meals) {
        if (!m.isDeleted && m.monthKey === hisabReport.monthKey) {
          mealMap.set(`${m.memberId}-${m.date}`, m.totalMeals);
        }
      }

      const gridBody = members.filter((m) => !m.isDeleted).map((member) => {
        let memberSum = 0;
        const row = [member.name];
        for (const day of daysArray) {
          const dayStr = day < 10 ? `0${day}` : `${day}`;
          const dateStr = `${hisabReport.monthKey}-${dayStr}`;
          const count = mealMap.get(`${member.id}-${dateStr}`) || 0;
          memberSum += count;
          row.push(count > 0 ? `${count}` : '-');
        }
        row.push(`${memberSum.toFixed(1)}`);
        return row;
      });

      // Day column totals
      const dayTotalsRow = ['Day Total'];
      for (const day of daysArray) {
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const dateStr = `${hisabReport.monthKey}-${dayStr}`;
        let colSum = 0;
        for (const member of members.filter((m) => !m.isDeleted)) {
          colSum += mealMap.get(`${member.id}-${dateStr}`) || 0;
        }
        dayTotalsRow.push(colSum > 0 ? `${colSum.toFixed(1)}` : '-');
      }
      dayTotalsRow.push(`${hisabReport.totalMeals}`);

      autoTable(doc, {
        startY: 24,
        head: [gridHeaders],
        body: gridBody,
        foot: [dayTotalsRow],
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 7, halign: 'center' },
        styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
        columnStyles: { 0: { halign: 'left', fontStyle: 'bold', minCellWidth: 28 } },
        footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', halign: 'center' },
      });

      doc.save(`Hisab_Complete_Report_${house.name.replace(/\s+/g, '_')}_${hisabReport.monthKey}.pdf`);
      showToast('Comprehensive PDF report (Hisab + Meal Grid) downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate PDF', 'error');
    }
  };

  const handleExportExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // --- Sheet 1: Master Hisab Statement ---
      const hisabSheetData = [
        ['Mess / House Name', house.name],
        ['Accounting Period', hisabReport.monthKey],
        ['Generated On', new Date().toLocaleString()],
        [],
        ['KEY ACCOUNTING METRICS'],
        ['Total Meals', hisabReport.totalMeals],
        ['Total Meal Bazar Expense', hisabReport.totalMealBazarExpense],
        ['Meal Rate', hisabReport.mealRate],
        ['Shared Utility Expenses', hisabReport.totalUtilityExpense],
        ['Special Feast Expenses', hisabReport.totalFeastExpense],
        ['Total Group Expenses', hisabReport.totalGroupExpense],
        ['Total Collected Deposits', hisabReport.totalDeposits],
        ['Fund Cash in Hand', hisabReport.cashInHand],
        [],
        [
          'Member Name',
          'Phone',
          'Role',
          'Total Meals',
          'Breakfast',
          'Lunch',
          'Dinner',
          'Meal Cost (BDT)',
          'Utility Share (BDT)',
          'Feast Share (BDT)',
          'Total Cost (BDT)',
          'Total Deposit (BDT)',
          'Net Balance (BDT)',
          'Status',
        ],
        ...hisabReport.membersSummary.map((m) => [
          m.memberName,
          m.phone || '',
          m.role,
          m.totalMeals,
          m.totalBreakfast,
          m.totalLunch,
          m.totalDinner,
          m.mealCost,
          m.utilityCost,
          m.feastCost,
          m.totalCost,
          m.totalDeposit,
          m.netBalance,
          m.status.toUpperCase(),
        ]),
      ];
      const hisabWorksheet = XLSX.utils.aoa_to_sheet(hisabSheetData);
      XLSX.utils.book_append_sheet(workbook, hisabWorksheet, 'Monthly Hisab');

      // --- Sheet 2: Daily Meal Matrix ---
      const mealMap = new Map<string, number>();
      for (const m of meals) {
        if (!m.isDeleted && m.monthKey === hisabReport.monthKey) {
          mealMap.set(`${m.memberId}-${m.date}`, m.totalMeals);
        }
      }

      const gridHeaderRow = ['Member Name', ...daysArray.map((d) => `Day ${d}`), 'Total Meals'];
      const gridRows = members.filter((m) => !m.isDeleted).map((member) => {
        let memberSum = 0;
        const row: any[] = [member.name];
        for (const day of daysArray) {
          const dayStr = day < 10 ? `0${day}` : `${day}`;
          const dateStr = `${hisabReport.monthKey}-${dayStr}`;
          const count = mealMap.get(`${member.id}-${dateStr}`) || 0;
          memberSum += count;
          row.push(count > 0 ? count : 0);
        }
        row.push(memberSum);
        return row;
      });

      const mealGridWorksheet = XLSX.utils.aoa_to_sheet([
        [`Daily Meal Grid Table — ${hisabReport.monthKey}`],
        [],
        gridHeaderRow,
        ...gridRows,
      ]);
      XLSX.utils.book_append_sheet(workbook, mealGridWorksheet, 'Daily Meal Grid');

      // --- Sheet 3: Expenses Ledger ---
      const expenseRows = [
        ['Date', 'Description', 'Category', 'Expense Pool', 'Buyer / Paid By', 'Amount (BDT)', 'Note'],
        ...expenses
          .filter((e) => !e.isDeleted && e.monthKey === hisabReport.monthKey)
          .map((e) => [
            e.date,
            e.title,
            e.category,
            e.expenseType,
            members.find((m) => m.id === e.buyerId)?.name || e.buyerId,
            e.amount,
            e.note || '',
          ]),
      ];
      const expenseWorksheet = XLSX.utils.aoa_to_sheet(expenseRows);
      XLSX.utils.book_append_sheet(workbook, expenseWorksheet, 'Expenses Ledger');

      // --- Sheet 4: Deposits Ledger ---
      const depositRows = [
        ['Date', 'Member Name', 'Payment Method', 'Amount (BDT)', 'Transaction ID / Ref', 'Note'],
        ...deposits
          .filter((d) => !d.isDeleted && d.monthKey === hisabReport.monthKey)
          .map((d) => [
            d.date,
            members.find((m) => m.id === d.memberId)?.name || d.memberId,
            d.method.toUpperCase(),
            d.amount,
            d.trxId || '',
            d.note || '',
          ]),
      ];
      const depositWorksheet = XLSX.utils.aoa_to_sheet(depositRows);
      XLSX.utils.book_append_sheet(workbook, depositWorksheet, 'Deposits Ledger');

      // Write file
      XLSX.writeFile(workbook, `Bachelors_Hisab_Workbook_${hisabReport.monthKey}.xlsx`);
      showToast('Multi-sheet Excel workbook (.xlsx) downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export Excel file', 'error');
    }
  };

  const handleCopyWhatsApp = () => {
    try {
      let text = `📋 *${house.name || "Bachelors' Meal Manager"} — Monthly Hisab (${hisabReport.monthKey})*\n\n`;
      text += `🍽️ *Total Meals:* ${hisabReport.totalMeals}\n`;
      text += `🛒 *Total Bazar:* ${formatCurrency(hisabReport.totalMealBazarExpense)}\n`;
      text += `💡 *Meal Rate:* ${formatCurrency(hisabReport.mealRate)} / meal\n`;
      text += `⚡ *Total Utilities:* ${formatCurrency(hisabReport.totalUtilityExpense)}\n`;
      text += `🍗 *Special Feasts:* ${formatCurrency(hisabReport.totalFeastExpense)}\n`;
      text += `💰 *Total Deposits:* ${formatCurrency(hisabReport.totalDeposits)}\n`;
      text += `💵 *Fund Cash-in-Hand:* ${formatCurrency(hisabReport.cashInHand)}\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `*INDIVIDUAL MEMBER HISAB:*\n`;

      hisabReport.membersSummary.forEach((m) => {
        const sign = m.netBalance > 0 ? '+' : '';
        const statusEmoji = m.status === 'credit' ? '🟢' : m.status === 'due' ? '🔴' : '⚪';
        text += `\n👤 *${m.memberName}*\n`;
        text += `• Meals: ${m.totalMeals} | Cost: ${formatCurrency(m.totalCost)}\n`;
        text += `• Paid: ${formatCurrency(m.totalDeposit)}\n`;
        text += `• Net Balance: ${statusEmoji} *${sign}${formatCurrency(m.netBalance)} (${m.status.toUpperCase()})*\n`;
      });

      if (hisabReport.settlementPlan && hisabReport.settlementPlan.transactions.length > 0) {
        text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
        text += `🤝 *OPTIMAL SETTLE-UP PLAN (MIN TRANSACTIONS):*\n`;
        hisabReport.settlementPlan.transactions.forEach((tx, idx) => {
          text += `${idx + 1}. *${tx.fromMemberName}* ➡️ pays *${tx.formattedAmount}* to *${tx.toMemberName}*\n`;
        });
      }

      text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `_Generated via Bachelors' Meal Manager_`;

      navigator.clipboard.writeText(text);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
      showToast(t('copied'));
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleCopySettlementPlan = () => {
    try {
      const plan = hisabReport.settlementPlan;
      if (!plan || plan.transactions.length === 0) {
        showToast('All accounts are fully settled!');
        return;
      }
      let text = `🤝 *${house.name || "Bachelors' Meal Manager"} — Settle-Up Plan (${hisabReport.monthKey})*\n`;
      text += `_Computed via Greedy Minimum Cash Flow Algorithm (${plan.transactionsCount} transactions)_\n\n`;
      plan.transactions.forEach((tx, idx) => {
        text += `${idx + 1}. *${tx.fromMemberName}* ➡️ pays *${tx.formattedAmount}* to *${tx.toMemberName}*\n`;
      });
      text += `\nTotal Settled: ${formatCurrency(plan.totalSettledAmount)}\n`;
      text += `_Generated via Bachelors' Meal Manager_`;

      navigator.clipboard.writeText(text);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      showToast('Settle-up plan copied to clipboard!');
    } catch (err) {
      showToast('Failed to copy settle-up plan', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Toolbar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
          borderLeft: '4px solid var(--primary)',
        }}
      >
        <div>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--primary)" />
            <span>Monthly Hisab Statement & Reporting — {hisabReport.monthKey}</span>
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Complete audit reconciliation sheet with Excel multi-sheet export, PDF meal grid export, and WhatsApp sharing
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            <Download size={16} />
            <span>PDF (Report + Meal Grid)</span>
          </button>
          <button className="btn btn-secondary" onClick={handleExportExcel}>
            <FileSpreadsheet size={16} color="var(--primary)" />
            <span>Detailed Excel (.xlsx)</span>
          </button>
          <button className="btn btn-accent" onClick={handleCopyWhatsApp}>
            <Share2 size={16} />
            <span>{t('copyWhatsApp')}</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation: Statement vs Progressive Calculation Explainer */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className={`btn ${activeSubTab === 'statement' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('statement')}
        >
          <FileText size={16} />
          <span>Settlement Statement</span>
        </button>
        <button
          className={`btn ${activeSubTab === 'progressive' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('progressive')}
        >
          <TrendingUp size={16} />
          <span>Progressive Bazar & Meal Rate Timeline</span>
        </button>
        <button
          className={`btn ${activeSubTab === 'settlement' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('settlement')}
        >
          <Calculator size={16} />
          <span>Optimal Settle-Up Plan (Min Cash Flow)</span>
        </button>
      </div>

      {activeSubTab === 'settlement' ? (
        /* Settle-Up Plan (Greedy Min Cash Flow Algorithm) */
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  🤝 Optimal Debt Settlement Plan
                </h4>
                <Badge variant="manager">CSC 3110: Greedy Flow Minimization</Badge>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Solves the multi-party Minimum Cash Flow problem in <code style={{ color: 'var(--primary)' }}>O(N log N)</code> time, reducing room transactions to at most <strong style={{ color: 'var(--text-primary)' }}>N - 1</strong> direct payments.
              </p>
            </div>

            <button className="btn btn-accent" onClick={handleCopySettlementPlan}>
              <Share2 size={16} />
              <span>Copy Settle-Up Plan</span>
            </button>
          </div>

          {/* KPI Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            <div className="card" style={{ padding: '14px', background: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Debt Settled</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                {formatCurrency(hisabReport.settlementPlan?.totalSettledAmount || 0)}
              </div>
            </div>

            <div className="card" style={{ padding: '14px', background: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Transactions Needed</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>
                {hisabReport.settlementPlan?.transactionsCount || 0} transfers
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Minimized from max {hisabReport.totalMembers > 1 ? (hisabReport.totalMembers * (hisabReport.totalMembers - 1)) / 2 : 0} pairwise debts
              </div>
            </div>

            <div className="card" style={{ padding: '14px', background: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Settlement Status</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: hisabReport.settlementPlan?.isFullySettled ? 'var(--primary)' : 'var(--warning)', marginTop: '4px' }}>
                {hisabReport.settlementPlan?.isFullySettled ? '✓ Fully Solvable' : 'Partial / Discrepancy'}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          {!hisabReport.settlementPlan || hisabReport.settlementPlan.transactions.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '12px' }}>
              <CheckCircle2 size={40} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
              <h5 style={{ fontSize: '1.1rem', fontWeight: 700 }}>All Accounts Are Fully Settled!</h5>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Every member has paid their exact consumption share. No inter-member transfers are required.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Recommended Direct Transfers ({hisabReport.settlementPlan.transactionsCount})
              </h5>

              {hisabReport.settlementPlan.transactions.map((tx, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    gap: '12px',
                  }}
                >
                  {/* Debtor */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: 'var(--danger)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tx.fromMemberName}</div>
                      <Badge variant="due">Owes (Debtor)</Badge>
                    </div>
                  </div>

                  {/* Transfer Indicator */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      flex: 1,
                      minWidth: '140px',
                    }}
                  >
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {tx.formattedAmount}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      <span>pays direct to</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  {/* Creditor */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px', justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tx.toMemberName}</div>
                      <Badge variant="credit">Receives (Creditor)</Badge>
                    </div>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      ✓
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeSubTab === 'progressive' ? (
        /* Progressive Bazar & Rate Calculation Explainer */
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              📈 How Meal Rate Evolves as Bazars are Added
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Whenever a member buys bazar (e.g. ৳1,500 first, then ৳2,000 later), the progressive meal cost is computed against the cumulative meals consumed up to that period.
            </p>
          </div>

          {progressiveTimeline.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No meal-related bazar entries recorded yet for this month.
            </div>
          ) : (
            <div className="table-container">
              <table className="matrix-table" style={{ textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Bazar Item / Description</th>
                    <th>Purchase Amount</th>
                    <th>Cumulative Bazar Cost</th>
                    <th>Cumulative Meals (Up to Date)</th>
                    <th>Interim Meal Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {progressiveTimeline.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.date}</strong></td>
                      <td>{item.title}</td>
                      <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatCurrency(item.amount)}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(item.cumulativeBazar)}</td>
                      <td>{item.mealsUpToDate} meals</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 800 }}>
                        {house.currency} {item.interimRate} / meal
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Standard Statement View */
        <>
          {/* Key Metric Boxes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Group Meals</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {hisabReport.totalMeals} meals
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                B: {hisabReport.totalBreakfast} | L: {hisabReport.totalLunch} | D: {hisabReport.totalDinner}
              </div>
            </div>

            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Calculated Meal Rate</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                {formatCurrency(hisabReport.mealRate)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {formatCurrency(hisabReport.totalMealBazarExpense)} ÷ {hisabReport.totalMeals}
              </div>
            </div>

            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Group Expenses</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>
                {formatCurrency(hisabReport.totalGroupExpense)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Bazar + Utilities + Feasts
              </div>
            </div>

            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fund Balance (Cash-in-Hand)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--info-text)', marginTop: '2px' }}>
                {formatCurrency(hisabReport.cashInHand)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Deposits ({formatCurrency(hisabReport.totalDeposits)}) - Expenses
              </div>
            </div>
          </div>

          {/* Master Hisab Table */}
          <div className="table-container">
            <table className="matrix-table" style={{ textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>Member Name</th>
                  <th style={{ textAlign: 'center' }}>Total Meals</th>
                  <th>Meal Cost</th>
                  <th>Utility Share</th>
                  <th>Feast Share</th>
                  <th>Total Cost</th>
                  <th>Total Deposits</th>
                  <th>Net Balance</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {hisabReport.membersSummary.map((m, idx) => (
                  <tr key={m.memberId}>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{m.memberName}</div>
                      {m.role === 'manager' && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--info-text)' }}>Manager</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{m.totalMeals}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{formatCurrency(m.mealCost)}</td>
                    <td style={{ color: 'var(--info-text)' }}>{formatCurrency(m.utilityCost)}</td>
                    <td style={{ color: '#ec4899' }}>{formatCurrency(m.feastCost)}</td>
                    <td style={{ fontWeight: 800 }}>{formatCurrency(m.totalCost)}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatCurrency(m.totalDeposit)}</td>
                    <td style={{ fontWeight: 800 }}>
                      <span style={{ color: m.netBalance > 0 ? 'var(--success-text)' : m.netBalance < 0 ? 'var(--danger-text)' : 'inherit' }}>
                        {m.netBalance > 0 ? `+${formatCurrency(m.netBalance)}` : formatCurrency(m.netBalance)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant={m.status}>
                        {m.status === 'credit'
                          ? t('inCredit')
                          : m.status === 'due'
                          ? t('due')
                          : t('settled')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--bg-surface)', fontWeight: 800 }}>
                  <td colSpan={2} style={{ textAlign: 'center' }}>
                    TOTALS
                  </td>
                  <td style={{ textAlign: 'center' }}>{hisabReport.totalMeals}</td>
                  <td style={{ color: 'var(--accent)' }}>{formatCurrency(hisabReport.totalMealBazarExpense)}</td>
                  <td style={{ color: 'var(--info-text)' }}>{formatCurrency(hisabReport.totalUtilityExpense)}</td>
                  <td style={{ color: '#ec4899' }}>{formatCurrency(hisabReport.totalFeastExpense)}</td>
                  <td>{formatCurrency(hisabReport.totalGroupExpense)}</td>
                  <td style={{ color: 'var(--primary)' }}>{formatCurrency(hisabReport.totalDeposits)}</td>
                  <td style={{ color: 'var(--info-text)' }}>{formatCurrency(hisabReport.cashInHand)}</td>
                  <td style={{ textAlign: 'center', color: 'var(--primary)' }}>Reconciled</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

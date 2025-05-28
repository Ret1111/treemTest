import { useState, useEffect } from 'react';
import axios from 'axios';

interface InvestorSummary {
  total_invested_amount: number;
  portfolio_value: number;
  distributions_received: number;
  outstanding_commitments: number;
}

interface Investment {
  id: string;
  project_name: string;
  token_class: string;
  shares_owned: number;
  market_value: number;
  roi_percent: number;
  next_distribution_date: string;
}

type SortField = 'roi_percent' | 'next_distribution_date';
type SortDirection = 'asc' | 'desc';

const INVESTOR_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const API_BASE_URL = 'https://treemtest.onrender.com';

const Dashboard = () => {
  const [summary, setSummary] = useState<InvestorSummary | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('roi_percent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showPayoutAnimation, setShowPayoutAnimation] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [summaryRes, investmentsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/investor-summary/${INVESTOR_ID}`),
          axios.get(`${API_BASE_URL}/api/investments/${INVESTOR_ID}`)
        ]);

        setSummary(summaryRes.data);
        setInvestments(investmentsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handlePayout = async (investmentId: string, marketValue: number) => {
    try {
      setShowPayoutAnimation(investmentId);
      const payoutAmount = marketValue * 0.05;
      await axios.post(`${API_BASE_URL}/api/simulate-payout`, {
        investorId: INVESTOR_ID,
        investmentId,
        payoutAmount
      });

      const [summaryRes, investmentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/investor-summary/${INVESTOR_ID}`),
        axios.get(`${API_BASE_URL}/api/investments/${INVESTOR_ID}`)
      ]);

      setSummary(summaryRes.data);
      setInvestments(investmentsRes.data);
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('Error processing payout');
    } finally {
      setShowPayoutAnimation(null);
    }
  };

  const sortedInvestments = [...investments].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'roi_percent') {
      return (a.roi_percent - b.roi_percent) * multiplier;
    } else {
      return (new Date(a.next_distribution_date).getTime() - new Date(b.next_distribution_date).getTime()) * multiplier;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <div className="text-2xl font-semibold gradient-text">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-content max-w-md w-full mx-4">
          <div className="text-red-400 text-xl font-semibold mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="dashboard-button w-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="nav-bar">
        <div className="nav-content">
          <div className="flex items-center gap-3">
            <div className="logo-container">
              <svg className="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <h1 className="nav-title">Investor Dashboard</h1>
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            className="dashboard-button"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Total Invested Amount</div>
            <div className="metric-value">${summary?.total_invested_amount.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Portfolio Value</div>
            <div className="metric-value">${summary?.portfolio_value.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Distributions Received</div>
            <div className="metric-value">${summary?.distributions_received.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Outstanding Commitments</div>
            <div className="metric-value">${summary?.outstanding_commitments.toLocaleString()}</div>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="sort-buttons">
          <button
            onClick={() => handleSort('roi_percent')}
            className={`dashboard-button ${
              sortField === 'roi_percent' ? 'opacity-100' : 'opacity-80 hover:opacity-100'
            }`}
          >
            Sort by ROI {sortField === 'roi_percent' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('next_distribution_date')}
            className={`dashboard-button ${
              sortField === 'next_distribution_date' ? 'opacity-100' : 'opacity-80 hover:opacity-100'
            }`}
          >
            Sort by Distribution Date {sortField === 'next_distribution_date' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        {/* Investments Table */}
        <div className="table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Token Class</th>
                <th>Shares Owned</th>
                <th>Market Value</th>
                <th>ROI %</th>
                <th>Next Distribution</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedInvestments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No investments found
                  </td>
                </tr>
              ) :
                sortedInvestments.map((investment) => (
                  <tr key={investment.id}>
                    <td className="font-medium">{investment.project_name}</td>
                    <td>{investment.token_class}</td>
                    <td>{investment.shares_owned.toLocaleString()}</td>
                    <td>${investment.market_value.toLocaleString()}</td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        investment.roi_percent >= 10 ? 'bg-green-900/50 text-green-400' :
                        investment.roi_percent >= 5 ? 'bg-blue-900/50 text-blue-400' :
                        'bg-gray-900/50 text-gray-400'
                      }`}>
                        {investment.roi_percent.toFixed(2)}%
                      </span>
                    </td>
                    <td>{new Date(investment.next_distribution_date).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handlePayout(investment.id, investment.market_value)}
                        disabled={showPayoutAnimation === investment.id}
                        className="dashboard-button text-sm"
                      >
                        {showPayoutAnimation === investment.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          'Simulate 5% Payout'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
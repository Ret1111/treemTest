import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading environment variables from:', envPath);
console.log('File exists:', fs.existsSync(envPath));

dotenv.config({ path: envPath });

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Debug environment variables
console.log('Environment variables loaded:', {
  PORT: process.env.PORT,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing'
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Verify environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials:');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

console.log('Initializing Supabase client with URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

// Routes
app.get('/api/investor-summary/:investorId', async (req, res) => {
  try {
    const { investorId } = req.params;
    console.log('Fetching investor summary for:', investorId);
    
    const { data, error } = await supabase
      .from('investor_summary')
      .select('*')
      .eq('investor_id', investorId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Investor summary data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching investor summary:', error);
    res.status(500).json({ error: 'Error fetching investor summary' });
  }
});

app.get('/api/investments/:investorId', async (req, res) => {
  try {
    const { investorId } = req.params;
    console.log('Fetching investments for:', investorId);
    
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('investor_id', investorId);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Investments data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Error fetching investments' });
  }
});

// Simulate payout event
app.post('/api/simulate-payout', async (req, res) => {
  try {
    const { investorId, investmentId, payoutAmount } = req.body;
    console.log('Simulating payout:', { investorId, investmentId, payoutAmount });

    // Get current investment data
    const { data: investment, error: fetchError } = await supabase
      .from('investments')
      .select('market_value')
      .eq('id', investmentId)
      .single();

    if (fetchError) {
      console.error('Error fetching investment:', fetchError);
      throw fetchError;
    }

    // Get current investor summary
    const { data: summary, error: summaryError } = await supabase
      .from('investor_summary')
      .select('distributions_received, portfolio_value')
      .eq('investor_id', investorId)
      .single();

    if (summaryError) {
      console.error('Error fetching summary:', summaryError);
      throw summaryError;
    }

    // Update investment market value
    const { error: updateInvestmentError } = await supabase
      .from('investments')
      .update({
        market_value: investment.market_value - payoutAmount
      })
      .eq('id', investmentId);

    if (updateInvestmentError) {
      console.error('Error updating investment:', updateInvestmentError);
      throw updateInvestmentError;
    }

    // Update investor summary
    const { error: updateSummaryError } = await supabase
      .from('investor_summary')
      .update({
        distributions_received: summary.distributions_received + payoutAmount,
        portfolio_value: summary.portfolio_value - payoutAmount
      })
      .eq('investor_id', investorId);

    if (updateSummaryError) {
      console.error('Error updating summary:', updateSummaryError);
      throw updateSummaryError;
    }

    console.log('Payout simulation completed successfully');
    res.json({ message: 'Payout simulated successfully' });
  } catch (error) {
    console.error('Error simulating payout:', error);
    res.status(500).json({ error: 'Error simulating payout' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Environment:', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Missing',
    supabaseKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing'
  });
}); 
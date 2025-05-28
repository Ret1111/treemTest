"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables
const envPath = path_1.default.resolve(__dirname, '../.env');
console.log('Loading environment variables from:', envPath);
console.log('File exists:', fs_1.default.existsSync(envPath));
dotenv_1.default.config({ path: envPath });
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// CORS configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json());
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
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Routes
app.get('/api/investor-summary/:investorId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { investorId } = req.params;
        console.log('Fetching investor summary for:', investorId);
        const { data, error } = yield supabase
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
    }
    catch (error) {
        console.error('Error fetching investor summary:', error);
        res.status(500).json({ error: 'Error fetching investor summary' });
    }
}));
app.get('/api/investments/:investorId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { investorId } = req.params;
        console.log('Fetching investments for:', investorId);
        const { data, error } = yield supabase
            .from('investments')
            .select('*')
            .eq('investor_id', investorId);
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        console.log('Investments data:', data);
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching investments:', error);
        res.status(500).json({ error: 'Error fetching investments' });
    }
}));
// Simulate payout event
app.post('/api/simulate-payout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { investorId, investmentId, payoutAmount } = req.body;
        console.log('Simulating payout:', { investorId, investmentId, payoutAmount });
        // Get current investment data
        const { data: investment, error: fetchError } = yield supabase
            .from('investments')
            .select('market_value')
            .eq('id', investmentId)
            .single();
        if (fetchError) {
            console.error('Error fetching investment:', fetchError);
            throw fetchError;
        }
        // Get current investor summary
        const { data: summary, error: summaryError } = yield supabase
            .from('investor_summary')
            .select('distributions_received, portfolio_value')
            .eq('investor_id', investorId)
            .single();
        if (summaryError) {
            console.error('Error fetching summary:', summaryError);
            throw summaryError;
        }
        // Update investment market value
        const { error: updateInvestmentError } = yield supabase
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
        const { error: updateSummaryError } = yield supabase
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
    }
    catch (error) {
        console.error('Error simulating payout:', error);
        res.status(500).json({ error: 'Error simulating payout' });
    }
}));
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

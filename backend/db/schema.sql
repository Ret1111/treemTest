-- Create investments table
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_id UUID NOT NULL,
    project_name TEXT NOT NULL,
    token_class TEXT NOT NULL,
    shares_owned INTEGER NOT NULL,
    market_value NUMERIC(10,2) NOT NULL,
    roi_percent NUMERIC(5,2) NOT NULL,
    next_distribution_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create investor_summary table
CREATE TABLE investor_summary (
    investor_id UUID PRIMARY KEY,
    total_invested_amount NUMERIC(12,2) NOT NULL,
    portfolio_value NUMERIC(12,2) NOT NULL,
    distributions_received NUMERIC(12,2) NOT NULL,
    outstanding_commitments NUMERIC(12,2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO investor_summary (
    investor_id,
    total_invested_amount,
    portfolio_value,
    distributions_received,
    outstanding_commitments
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
    150000.00,
    175000.00,
    12000.00,
    5000.00
);

INSERT INTO investments (
    investor_id,
    project_name,
    token_class,
    shares_owned,
    market_value,
    roi_percent,
    next_distribution_date
) VALUES 
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
    'Greenfield Residential Fund',
    'Class A',
    200,
    22000.00,
    8.40,
    '2024-06-15'
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
    'Commercial Office REIT',
    'Preferred',
    150,
    18000.00,
    7.20,
    '2024-07-01'
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
    'Industrial Park Development',
    'Class B',
    300,
    45000.00,
    12.50,
    '2024-06-30'
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
    'Retail Plaza Fund',
    'Common',
    175,
    19500.00,
    6.80,
    '2024-07-15'
); 
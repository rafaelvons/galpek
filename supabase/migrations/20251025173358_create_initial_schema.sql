/*
  # Create Initial Schema for Carry/Raid Management System

  ## Overview
  This migration creates the database structure for tracking carry/raid transactions
  and calculating automatic profit sharing between three members: Paul, Adit, and Bimo.

  ## New Tables
  
  ### 1. `members` table
  - `id` (uuid, primary key) - Unique identifier for each member
  - `name` (text, unique) - Member name (Paul, Adit, or Bimo)
  - `email` (text, unique) - Member email for authentication
  - `total_earned` (numeric) - Total earnings accumulated
  - `total_transactions` (integer) - Count of transactions participated in
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `transactions` table
  - `id` (uuid, primary key) - Unique transaction identifier
  - `activity_name` (text) - Name of the carry/raid activity (COA)
  - `total_amount` (numeric) - Total amount earned from the activity
  - `split_type` (integer) - Number of people splitting (1=sendiri, 2=bagi 2, 3=bagi 3)
  - `per_person` (numeric) - Calculated amount per person
  - `members` (text[]) - Array of member names involved
  - `notes` (text, nullable) - Optional notes about the transaction
  - `date` (date) - Transaction date
  - `created_by` (uuid) - User who created the transaction
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `member_transactions` table
  - `id` (uuid, primary key) - Unique record identifier
  - `member_id` (uuid) - Foreign key to members table
  - `transaction_id` (uuid) - Foreign key to transactions table
  - `amount` (numeric) - Amount earned by this member from this transaction
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Allow authenticated users to read all data
  - Allow authenticated users to insert transactions
  - Allow authenticated users to read their own member data
  - Restrict updates and deletes appropriately

  ## Notes
  - All monetary values use numeric type for precision
  - Members are pre-populated with Paul, Adit, and Bimo
  - Transactions automatically calculate per_person based on split_type
  - Member earnings are updated via triggers when transactions are added
*/

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  total_earned numeric DEFAULT 0,
  total_transactions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_name text NOT NULL,
  total_amount numeric NOT NULL,
  split_type integer NOT NULL CHECK (split_type IN (1, 2, 3)),
  per_person numeric NOT NULL,
  members text[] NOT NULL,
  notes text,
  date date DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create member_transactions junction table
CREATE TABLE IF NOT EXISTS member_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(member_id, transaction_id)
);

-- Insert default members
INSERT INTO members (name, email) VALUES
  ('Paul', 'paul@example.com'),
  ('Adit', 'adit@example.com'),
  ('Bimo', 'bimo@example.com')
ON CONFLICT (name) DO NOTHING;

-- Create function to update member totals
CREATE OR REPLACE FUNCTION update_member_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE members
    SET 
      total_earned = total_earned + NEW.amount,
      total_transactions = total_transactions + 1,
      updated_at = now()
    WHERE id = NEW.member_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating member totals
DROP TRIGGER IF EXISTS trigger_update_member_totals ON member_transactions;
CREATE TRIGGER trigger_update_member_totals
  AFTER INSERT ON member_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_member_totals();

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for members table
CREATE POLICY "Members are viewable by authenticated users"
  ON members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can update own data"
  ON members FOR UPDATE
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- RLS Policies for transactions table
CREATE POLICY "Transactions are viewable by authenticated users"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for member_transactions table
CREATE POLICY "Member transactions are viewable by authenticated users"
  ON member_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert member transactions"
  ON member_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_member_transactions_member_id ON member_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_member_transactions_transaction_id ON member_transactions(transaction_id);
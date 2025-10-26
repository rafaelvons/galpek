/*
  # Add Activity Prices Table

  ## Overview
  This migration creates a table to store predefined prices for each activity/COA.
  Users can set the price for each type of carry/raid activity.

  ## New Tables
  
  ### `activity_prices` table
  - `id` (uuid, primary key) - Unique identifier
  - `activity_name` (text, unique) - Name of the activity (V4 Carry, Buddha Raid, etc.)
  - `unit_price` (numeric) - Price per unit for this activity
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on activity_prices table
  - Allow authenticated users to read all prices
  - Allow authenticated users to update prices

  ## Notes
  - Prices are initialized with 0, users can update them later
  - When an activity is selected, the price will be displayed automatically
*/

-- Create activity_prices table
CREATE TABLE IF NOT EXISTS activity_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_name text UNIQUE NOT NULL,
  unit_price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default activities with initial prices (can be updated by user)
INSERT INTO activity_prices (activity_name, unit_price) VALUES
  ('V4 Carry/Trial', 0),
  ('Levi Carry', 0),
  ('Dough Raid', 0),
  ('Carry Raid', 0),
  ('Buddha Raid', 0),
  ('Raid Biasa', 0),
  ('Raid Order', 0),
  ('Enchanted Relic', 0),
  ('PH Carry', 0),
  ('Carry Dough', 0),
  ('Shekels', 0),
  ('Lightning', 0)
ON CONFLICT (activity_name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE activity_prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_prices table
CREATE POLICY "Activity prices are viewable by authenticated users"
  ON activity_prices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update activity prices"
  ON activity_prices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_prices_name ON activity_prices(activity_name);
-- Update the outstanding amount from the 'overdue_amount' key inside the dynamic_fields JSONB column.
-- It casts the extracted text value to numeric.
-- We use NULLIF to handle empty strings gracefully, and only update rows where the key actually exists.

UPDATE portfolio_records
SET outstanding = CAST(NULLIF(TRIM(dynamic_fields->>'overdue_amount'), '') AS numeric)
WHERE dynamic_fields ? 'overdue_amount'
  AND dynamic_fields->>'overdue_amount' IS NOT NULL;

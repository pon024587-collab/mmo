-- Fix double-stringified metadata
UPDATE items
SET metadata = (metadata#>>'{}')::jsonb
WHERE typeof(metadata) = 'string';

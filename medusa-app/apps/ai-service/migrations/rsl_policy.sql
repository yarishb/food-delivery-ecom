CREATE POLICY "Enable insert for anonymous users" 
ON document_sections 
FOR INSERT 
WITH CHECK (true);
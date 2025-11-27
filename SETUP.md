# Supabase MCP Server Setup Guide

## Installation

### Prerequisites
- Node.js 18+ installed
- - A Supabase account and project
  - - Your Supabase API key
   
    - ### Step 1: Clone the Repository
    - ```bash
      git clone https://github.com/ohadbenami/supabase-mcp-server.git
      cd supabase-mcp-server
      ```

      ### Step 2: Install Dependencies
      ```bash
      npm install
      ```

      ### Step 3: Set Up Environment Variables
      Create a `.env` file in the root directory with your Supabase credentials:

      ```env
      SUPABASE_URL=https://your-project-id.supabase.co
      SUPABASE_API_KEY=your-secret-api-key
      ```

      You can find these in your Supabase project settings:
      - Go to Settings > API
      - - Copy your **Project URL** and **Secret API Key**
       
        - ### Step 4: Run the Server
        - ```bash
          npm start
          ```

          For development with auto-reload:
          ```bash
          npm run dev
          ```

          ## MCP Tools Available

          ### 1. list_tables
          Get all tables from your Supabase database.

          **Input:** None required

          **Example Response:**
          ```json
          {
            "tables": ["users", "products", "orders"]
          }
          ```

          ### 2. query_table
          Query data from a specific table with optional filters.

          **Input:**
          - `table` (required): Table name
          - - `filters` (optional): Object with column:value pairs
            - - `limit` (optional): Number of rows to return
             
              - **Example:**
              - ```json
                {
                  "table": "users",
                  "filters": { "status": "active" },
                  "limit": 10
                }
                ```

                ### 3. insert_row
                Insert a new row into a table.

                **Input:**
                - `table` (required): Table name
                - - `data` (required): Object with column:value pairs
                 
                  - **Example:**
                  - ```json
                    {
                      "table": "users",
                      "data": {
                        "name": "John Doe",
                        "email": "john@example.com",
                        "status": "active"
                      }
                    }
                    ```

                    ### 4. update_row
                    Update an existing row.

                    **Input:**
                    - `table` (required): Table name
                    - - `id` (required): Row ID to update
                      - - `data` (required): Object with columns to update
                       
                        - **Example:**
                        - ```json
                          {
                            "table": "users",
                            "id": "123",
                            "data": { "status": "inactive" }
                          }
                          ```

                          ### 5. delete_row
                          Delete a row from a table.

                          **Input:**
                          - `table` (required): Table name
                          - - `id` (required): Row ID to delete
                           
                            - **Example:**
                            - ```json
                              {
                                "table": "users",
                                "id": "123"
                              }
                              ```

                              ### 6. execute_sql
                              Execute a custom SQL query.

                              **Input:**
                              - `query` (required): SQL query to execute
                             
                              - **Example:**
                              - ```json
                                {
                                  "query": "SELECT COUNT(*) as total FROM users WHERE status = 'active'"
                                }
                                ```

                                ## Integration with Claude

                                To use this MCP server with Claude:

                                1. The server runs as a stdio service
                                2. 2. Claude can call the MCP methods to interact with your Supabase database
                                   3. 3. All operations are performed with your API key securely
                                     
                                      4. ## Security Notes
                                     
                                      5. - Never commit your `.env` file to version control
                                         - - Keep your SUPABASE_API_KEY private
                                           - - Use environment variables for sensitive data
                                             - - Consider using Row Level Security (RLS) policies in Supabase
                                              
                                               - ## Troubleshooting
                                              
                                               - ### Error: "SUPABASE_API_KEY environment variable is required"
                                               - Make sure your `.env` file is created and contains the correct API key.
                                              
                                               - ### Error: "Failed to list tables"
                                               - Check that your Supabase URL and API key are correct and your database has tables.
                                              
                                               - ### Error: "Query failed"
                                               - Ensure the table name exists and your query syntax is correct.
                                              
                                               - ## Support
                                              
                                               - For issues and questions, please open an issue on GitHub.
                                              
                                               - ---

                                               **Created for seamless Claude + Supabase integration via MCP protocol**

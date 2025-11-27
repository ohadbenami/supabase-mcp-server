import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uwfbirjpzzberwrhkson.supabase.co';
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

if (!SUPABASE_API_KEY) {
    console.error('Error: SUPABASE_API_KEY environment variable is required');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

// MCP Tools Definition
const tools = [
  {
        name: "list_tables",
        description: "Get all tables from the Supabase database",
        inputSchema: { type: "object", properties: {} }
  },
  {
        name: "query_table",
        description: "Query data from a specific table with optional filters and limit",
        inputSchema: {
                type: "object",
                properties: {
                          table: { type: "string", description: "Table name" },
                          filters: { type: "object", description: "Optional filters {column: value}" },
                          limit: { type: "number", description: "Number of rows to return" }
                },
                required: ["table"]
        }
  },
  {
        name: "insert_row",
        description: "Insert a new row into a table",
        inputSchema: {
                type: "object",
                properties: {
                          table: { type: "string", description: "Table name" },
                          data: { type: "object", description: "Row data to insert" }
                },
                required: ["table", "data"]
        }
  },
  {
        name: "update_row",
        description: "Update an existing row in a table",
        inputSchema: {
                type: "object",
                properties: {
                          table: { type: "string", description: "Table name" },
                          id: { type: "string", description: "Row ID to update" },
                          data: { type: "object", description: "Data to update" }
                },
                required: ["table", "id", "data"]
        }
  },
  {
        name: "delete_row",
        description: "Delete a row from a table",
        inputSchema: {
                type: "object",
                properties: {
                          table: { type: "string", description: "Table name" },
                          id: { type: "string", description: "Row ID to delete" }
                },
                required: ["table", "id"]
        }
  },
  {
        name: "execute_sql",
        description: "Execute a custom SQL query (read-only recommended)",
        inputSchema: {
                type: "object",
                properties: {
                          query: { type: "string", description: "SQL query to execute" }
                },
                required: ["query"]
        }
  }
  ];

// Tool Implementation
async function handleTool(toolName, toolInput) {
    switch (toolName) {
      case "list_tables": {
              const { data, error } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');
              if (error) throw new Error(`Failed to list tables: ${error.message}`);
              return { tables: data?.map(t => t.table_name) || [] };
      }

      case "query_table": {
              let query = supabase.from(toolInput.table).select('*');

              if (toolInput.filters) {
                        for (const [key, value] of Object.entries(toolInput.filters)) {
                                    if (value === null) {
                                                  query = query.is(key, null);
                                    } else if (Array.isArray(value)) {
                                                  query = query.in(key, value);
                                    } else if (typeof value === 'object') {
                                                  query = query.contains(key, value);
                                    } else {
                                                  query = query.eq(key, value);
                                    }
                        }
              }

              if (toolInput.limit) {
                        query = query.limit(toolInput.limit);
              }

              const { data, error } = await query;
              if (error) throw new Error(`Query failed: ${error.message}`);
              return { data, count: data?.length || 0 };
      }

      case "insert_row": {
              const { data, error } = await supabase
                .from(toolInput.table)
                .insert([toolInput.data])
                .select();
              if (error) throw new Error(`Insert failed: ${error.message}`);
              return { inserted: data };
      }

      case "update_row": {
              const { data, error } = await supabase
                .from(toolInput.table)
                .update(toolInput.data)
                .eq('id', toolInput.id)
                .select();
              if (error) throw new Error(`Update failed: ${error.message}`);
              return { updated: data };
      }

      case "delete_row": {
              const { error } = await supabase
                .from(toolInput.table)
                .delete()
                .eq('id', toolInput.id);
              if (error) throw new Error(`Delete failed: ${error.message}`);
              return { success: true, message: `Row ${toolInput.id} deleted` };
      }

      case "execute_sql": {
              const { data, error } = await supabase.rpc('execute_sql', { 
                                                                 query: toolInput.query 
              });
              if (error) throw new Error(`SQL execution failed: ${error.message}`);
              return { result: data };
      }

      default:
              throw new Error(`Unknown tool: ${toolName}`);
    }
}

// MCP Server Protocol Implementation
async function processRequest(request) {
    if (request.method === 'initialize') {
          return {
                  protocolVersion: '2024-11-05',
                  capabilities: {
                            tools: {}
                  },
                  serverInfo: {
                            name: 'supabase-mcp-server',
                            version: '1.0.0'
                  }
          };
    }

  if (request.method === 'tools/list') {
        return { tools };
  }

  if (request.method === 'tools/call') {
        const { name, arguments: args } = request.params;
        try {
                const result = await handleTool(name, args);
                return {
                          content: [
                            {
                                          type: 'text',
                                          text: JSON.stringify(result, null, 2)
                            }
                                    ]
                };
        } catch (error) {
                return {
                          content: [
                            {
                                          type: 'text',
                                          text: `Error: ${error.message}`
                            }
                                    ],
                          isError: true
                };
        }
  }

  return { error: 'Unknown method' };
}

// Server Loop
async function runServer() {
    console.log('Supabase MCP Server starting...');
    console.log(`Connected to: ${SUPABASE_URL}`);

  const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
  });

  const processLine = async (line) => {
        try {
                const request = JSON.parse(line);
                const response = await processRequest(request);
                console.log(JSON.stringify(response));
        } catch (error) {
                console.error(JSON.stringify({
                          error: error.message
                }));
        }
  };

  rl.on('line', processLine);
    rl.on('close', () => {
          console.log('Server closed');
          process.exit(0);
    });
}

runServer().catch(error => {
    console.error('Server error:', error);
    process.exit(1);
});

const fastify = require('fastify');
const { z } = require('zod');
const { fastifyCors } = require('@fastify/cors');
const formbody = require('@fastify/formbody');
const multipart = require('@fastify/multipart');
const querystring = require('querystring');

const servers = {
  todolist: (port) => {
    const app = fastify({ logger: true });

    // Register plugins
    app.register(formbody);
    app.register(multipart);
    app.register(fastifyCors, {
      // DO NOTE USE THIS IN PRODUCTION
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
      exposedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    let todos = [];

    // Zod schemas
    const todoSchema = z.object({
      text: z.string().min(1, 'Text is required'),
      completed: z.boolean().optional()
    });

    const todoIdSchema = z.string().min(1, 'Todo ID is required');

    // Helper function to parse form data
    const parseFormData = async (request) => {
      if (request.isMultipart()) {
        const data = {};
        for await (const part of request.parts()) {
          if (part.type === 'file') {
            const buffer = await part.toBuffer();
            data[part.fieldname] = buffer.toString();
          } else {
            data[part.fieldname] = part.value;
          }
        }
        return data;
      }
      
      if (typeof request.body === 'string') {
        // Try to parse as URL-encoded form data
        try {
          const parsed = querystring.parse(request.body);
          if (parsed.text) {
            return { text: parsed.text };
          }
        } catch (e) {
          // If parsing fails, treat as plain text
          return { text: request.body };
        }
      }
      return request.body;
    };

    // Create todo
    // Example JSON: curl -X POST http://localhost:3000/todos -H "Content-Type: application/json" -d '{"text":"Buy groceries"}'
    // Example Form: curl -X POST http://localhost:3000/todos -d "text=Buy groceries"
    // Example Form with spaces: curl -X POST http://localhost:3000/todos -d "text=Buy%20groceries"
    // Example Text: curl -X POST http://localhost:3000/todos -H "Content-Type: text/plain" -d "Buy groceries"
    // Example Multipart: curl -X POST http://localhost:3000/todos -F "text=Buy groceries"
    app.post('/todos', async (request, reply) => {
      try {
        let text;

        // Handle different content types
        if (request.headers['content-type']?.includes('application/json')) {
          const validatedData = todoSchema.parse(request.body);
          text = validatedData.text;
        } else {
          // For form data, multipart, or plain text, parse the body
          const parsedData = await parseFormData(request);
          if (typeof parsedData === 'object' && parsedData.text) {
            text = parsedData.text;
          } else {
            text = parsedData;
          }

          if (typeof text !== 'string' || text.trim().length === 0) {
            throw new Error('Text is required');
          }
        }

        const todo = {
          id: Date.now().toString(),
          text: text.trim(),
          completed: false
        };
        todos.push(todo);
        return todo;
      } catch (error) {
        reply.code(400);
        return { error: error.message || error.errors?.[0]?.message || 'Invalid request' };
      }
    });

    // Get all todos
    // Example: curl http://localhost:3000/todos
    app.get('/todos', async () => {
      return todos;
    });

    // Update todo
    // Example JSON: curl -X PUT http://localhost:3000/todos/123 -H "Content-Type: application/json" -d '{"text":"Buy milk","completed":true}'
    // Example Form: curl -X PUT http://localhost:3000/todos/123 -d "text=Buy milk&completed=true"
    app.put('/todos/:id', async (request, reply) => {
      try {
        const id = todoIdSchema.parse(request.params.id);
        const validatedData = todoSchema.parse(request.body);

        const todo = todos.find(t => t.id === id);
        if (!todo) {
          reply.code(404);
          return { error: 'Todo not found' };
        }

        Object.assign(todo, validatedData);
        return todo;
      } catch (error) {
        reply.code(400);
        return { error: error.errors[0].message };
      }
    });

    // Delete todo
    // Example: curl -X DELETE http://localhost:3000/todos/123
    app.delete('/todos/:id', async (request, reply) => {
      try {
        const id = todoIdSchema.parse(request.params.id);
        const index = todos.findIndex(t => t.id === id);
        if (index === -1) {
          reply.code(404);
          return { error: 'Todo not found' };
        }
        todos.splice(index, 1);
        return { success: true };
      } catch (error) {
        reply.code(400);
        return { error: error.errors[0].message };
      }
    });

    return app;
  }
};

async function startServer(appType, port = 3000) {
  const server = servers[appType];
  if (!server) {
    throw new Error(`Server type not found: ${appType}`);
  }

  const app = server(port);

  try {
    await app.listen({ port });
    console.log(`Server is running on http://localhost:${port}`);
    console.log('\nExample API Usage:');
    console.log('\nCreate a todo (JSON):');
    console.log('curl -X POST http://localhost:3000/todos -H "Content-Type: application/json" -d \'{"text":"Buy groceries"}\'');
    console.log('\nCreate a todo (Form):');
    console.log('curl -X POST http://localhost:3000/todos -d "text=Buy groceries"');
    console.log('\nCreate a todo (Form with spaces):');
    console.log('curl -X POST http://localhost:3000/todos -d "text=Buy%20groceries"');
    console.log('\nCreate a todo (Text):');
    console.log('curl -X POST http://localhost:3000/todos -H "Content-Type: text/plain" -d "Buy groceries"');
    console.log('\nCreate a todo (Multipart):');
    console.log('curl -X POST http://localhost:3000/todos -F "text=Buy groceries"');
    console.log('\nGet all todos:');
    console.log('curl http://localhost:3000/todos');
    console.log('\nUpdate a todo (JSON):');
    console.log('curl -X PUT http://localhost:3000/todos/123 -H "Content-Type: application/json" -d \'{"text":"Buy milk","completed":true}\'');
    console.log('\nUpdate a todo (Form):');
    console.log('curl -X PUT http://localhost:3000/todos/123 -d "text=Buy milk&completed=true"');
    console.log('\nDelete a todo:');
    console.log('curl -X DELETE http://localhost:3000/todos/123');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

module.exports = {
  startServer
}; 

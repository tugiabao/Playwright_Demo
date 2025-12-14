import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { spawn } from 'child_process';
import path from 'path';
import open from 'open';
import fs from 'fs';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = 3333;

// Serve static files from dashboard/public
app.use(express.static(path.join(__dirname, 'public')));

// Serve the 'result' directory so we can show images/json
app.use('/result', express.static(path.join(__dirname, '../result')));

// Serve the 'playwright-report' directory
app.use('/report', express.static(path.join(__dirname, '../result/playwright-report')));

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('run-module', (moduleName: string) => {
        let command = 'npm';
        let args: string[] = [];

        // Map module names to npm scripts
        switch (moduleName) {
            case 'scrape':
                args = ['run', 'scrape'];
                break;
            case 'auto':
                args = ['run', 'auto'];
                break;
            case 'test':
                args = ['run', 'test'];
                break;
            default:
                socket.emit('log', `Unknown module: ${moduleName}`);
                return;
        }

        socket.emit('log', `\n🚀 Starting module: ${moduleName}...\n`);
        socket.emit('status', { module: moduleName, status: 'running' });

        // Spawn the process (using shell: true for Windows compatibility with npm)
        const process = spawn(command, args, { shell: true, cwd: path.join(__dirname, '../') });

        process.stdout.on('data', (data) => {
            socket.emit('log', data.toString());
        });

        process.stderr.on('data', (data) => {
            socket.emit('log', `ERR: ${data.toString()}`);
        });

        process.on('close', (code) => {
            const success = code === 0;
            socket.emit('log', `\n✅ Process finished with code ${code}\n`);
            
            // Send specific completion events based on module
            if (success) {
                if (moduleName === 'scrape') {
                     // Read the products.json to send back
                     try {
                        const productsPath = path.join(__dirname, '../result/products.json');
                        if (fs.existsSync(productsPath)) {
                            const data = fs.readFileSync(productsPath, 'utf-8');
                            socket.emit('result-scrape', JSON.parse(data));
                        }
                     } catch (e) {
                         socket.emit('log', `Error reading results: ${e}`);
                     }
                } else if (moduleName === 'auto') {
                    socket.emit('result-auto', '/result/auto-login.png');
                } else if (moduleName === 'test') {
                    socket.emit('result-test', '/report/index.html');
                }
            }
            
            socket.emit('status', { module: moduleName, status: success ? 'completed' : 'error' });
        });
    });
});

httpServer.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Dashboard running at ${url}`);
    open(url);
});

const http = require('http');
const fs = require('fs');
const path = require('path');
 
const PORT = 3000;
const HOST = '0.0.0.0';

function loadConfig() {
    const configPath = path.join(__dirname, 'config.json');
    try {
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configData);
            return config;
        }
    } catch (error) {
        console.warn('⚠️  Ошибка чтения config.json:', error.message);
    }
    return { excelFilePath: '' };
}

function getExcelFilePath() {
    const config = loadConfig();
    
    if (config.excelFilePath && config.excelFilePath.trim() !== '') {
        const configuredPath = config.excelFilePath.trim();
        
        if (fs.existsSync(configuredPath)) {
            const stats = fs.statSync(configuredPath);
            
            if (stats.isDirectory()) {
                console.log(`📂 Используется папка из config.json: ${configuredPath}`);
                return findFirstExcelFileInDirectory(configuredPath);
            } else if (stats.isFile() && configuredPath.endsWith('.xlsx')) {
                console.log(`📊 Используется файл из config.json: ${configuredPath}`);
                return configuredPath;
            } else {
                console.error(`❌ Путь указывает не на xlsx файл: ${configuredPath}`);
                console.log('🔍 Попытка поиска в папке проекта...');
            }
        } else {
            console.error(`❌ Путь не существует: ${configuredPath}`);
            console.log('🔍 Попытка поиска в папке проекта...');
        }
    }
    
    return findFirstExcelFileInDirectory(__dirname);
}

function findFirstExcelFileInDirectory(directory) {
    try {
        const files = fs.readdirSync(directory);
        const excelFile = files.find(file => file.endsWith('.xlsx'));
        
        if (!excelFile) {
            if (directory === __dirname) {
                console.error('❌ Excel файл (.xlsx) не найден в папке проекта!');
            } else {
                console.error(`❌ Excel файл (.xlsx) не найден в папке: ${directory}`);
            }
            return null;
        }
        
        const fullPath = path.join(directory, excelFile);
        if (directory === __dirname) {
            console.log(`📊 Найден Excel файл в папке проекта: ${excelFile}`);
        } else {
            console.log(`📊 Найден Excel файл: ${excelFile}`);
        }
        return fullPath;
    } catch (error) {
        console.error(`❌ Ошибка чтения папки ${directory}:`, error.message);
        return null;
    }
}
 
const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    if (url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Производственные Дашборды</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #eee;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            background: #0f1419;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            text-align: center;
            max-width: 500px;
        }
        h1 { color: #667eea; margin-bottom: 10px; }
        p { color: #aaa; margin-bottom: 30px; }
        .buttons { display: flex; flex-direction: column; gap: 15px; }
        a {
            display: block;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.1rem;
            transition: all 0.3s ease;
        }
        .btn-mop {
            background: #00b050;
            color: white;
        }
        .btn-mop:hover {
            background: #009040;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 176, 80, 0.4);
        }
        .btn-mult {
            background: #ff9800;
            color: white;
        }
        .btn-mult:hover {
            background: #e68900;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 152, 0, 0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Производственные Дашборды</h1>
        <p>Выберите логику для отображения</p>
        <div class="buttons">
            <a href="/dashboard-mop.html" class="btn-mop">MOP Логика</a>
            <a href="/dashboard-mult.html" class="btn-mult">MULT Логика</a>
        </div>
    </div>
</body>
</html>
        `);
        
    } else if (url === '/dashboard-mop.html' || url === '/dashboard-mult.html' || url === '/dashboard.html') {
        let fileName = url.substring(1);
        if (url === '/dashboard.html') {
            fileName = 'dashboard-mop.html';
        }
        const filePath = path.join(__dirname, fileName);
        
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Ошибка загрузки дашборда');
                console.error(`Ошибка чтения ${fileName}:`, err);
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
        
    } else if (url === '/excel') {
        const excelPath = getExcelFilePath();
        
        if (!excelPath) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Excel файл не найден');
            return;
        }
        
        fs.stat(excelPath, (err, stats) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Ошибка получения информации о файле');
                console.error('Ошибка stat Excel файла:', err);
                return;
            }
            
            res.setHeader('Last-Modified', stats.mtime.toUTCString());
            
            fs.readFile(excelPath, (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end('Ошибка загрузки Excel файла');
                    console.error('Ошибка чтения Excel файла:', err);
                    return;
                }
                
                res.writeHead(200, {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Length': data.length
                });
                res.end(data);
            });
        });
        
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Страница не найдена');
    }
});
 
server.listen(PORT, HOST, () => {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   🚀 Производственный Дашборд запущен!        ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📡 Сервер работает на: http://localhost:${PORT}`);
    console.log(`🌐 Доступен по адресу: http://${HOST}:${PORT}`);
    console.log('');
    console.log('📋 Доступные адреса:');
    console.log(`   • Главная: http://localhost:${PORT}/`);
    console.log(`   • MOP Дашборд: http://localhost:${PORT}/dashboard-mop.html`);
    console.log(`   • MULT Дашборд: http://localhost:${PORT}/dashboard-mult.html`);
    console.log(`   • Excel данные: http://localhost:${PORT}/excel`);
    console.log('');
    console.log('🔄 Дашборды автоматически обновляются каждые 60 секунд');
    console.log('📊 Excel файл загружается без кеширования');
    console.log('');
    console.log('⚙️  Для указания пути к Excel файлу отредактируйте config.json');
    console.log('');
    console.log('❌ Для остановки нажмите Ctrl+C');
    console.log('');
    
    const excelFile = getExcelFilePath();
    if (excelFile) {
        console.log(`✅ Готов к работе с файлом: ${path.basename(excelFile)}`);
        console.log(`📂 Полный путь: ${excelFile}`);
    }
});
 
process.on('SIGINT', () => {
    console.log('\n\n🛑 Остановка сервера...');
    server.close(() => {
        console.log('✅ Сервер остановлен');
        process.exit(0);
    });
});
 
process.on('SIGTERM', () => {
    console.log('\n\n🛑 Остановка сервера...');
    server.close(() => {
        console.log('✅ Сервер остановлен');
        process.exit(0);
    });
});

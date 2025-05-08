const { spawn } = require('child_process');
const path = require('path');

// Função para iniciar o servidor
function startServer() {
  console.log('Iniciando servidor...');
  
  // Iniciar o servidor Node.js
  const server = spawn('node', ['src/index.js'], {
    stdio: 'inherit'
  });

  // Tratamento de erros
  server.on('error', (error) => {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  });

  // Tratamento de saída
  server.on('exit', (code) => {
    if (code !== 0) {
      console.log(`Servidor encerrado com código ${code}`);
      // Se o erro for de porta em uso, tenta matar o processo e reiniciar
      if (code === 1) {
        console.log('Tentando liberar a porta 3001...');
        const killPort = spawn('npx', ['kill-port', '3001'], {
          stdio: 'inherit'
        });
        
        killPort.on('exit', (killCode) => {
          if (killCode === 0) {
            console.log('Porta liberada. Reiniciando servidor...');
            setTimeout(startServer, 1000);
          } else {
            console.error('Não foi possível liberar a porta. Por favor, tente manualmente:');
            console.error('1. Execute: npx kill-port 3001');
            console.error('2. Reinicie o servidor: npm start');
            process.exit(1);
          }
        });
      } else {
        process.exit(code);
      }
    }
  });

  // Tratamento de sinais
  process.on('SIGINT', () => {
    console.log('\nEncerrando servidor...');
    server.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nEncerrando servidor...');
    server.kill('SIGTERM');
    process.exit(0);
  });
}

// Iniciar o servidor
startServer(); 
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Função para executar comandos
function runCommand(command) {
  try {
    console.log(`Executando: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Erro ao executar comando: ${command}`);
    console.error(error);
  }
}

// Função para remover diretório recursivamente
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`Removendo diretório: ${dirPath}`);
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
    } catch (error) {
      console.error(`Erro ao remover diretório: ${dirPath}`);
      console.error(error);
    }
  }
}

// Função principal
async function fixPrisma() {
  console.log('Iniciando correção do Prisma...');

  // 1. Remover node_modules e .prisma
  console.log('\n1. Removendo node_modules e .prisma...');
  removeDirectory(path.join(__dirname, 'node_modules'));
  removeDirectory(path.join(__dirname, '.prisma'));

  // 2. Limpar cache do npm
  console.log('\n2. Limpando cache do npm...');
  runCommand('npm cache clean --force');

  // 3. Reinstalar dependências
  console.log('\n3. Reinstalando dependências...');
  runCommand('npm install');

  // 4. Gerar cliente Prisma
  console.log('\n4. Gerando cliente Prisma...');
  runCommand('npx prisma generate');

  console.log('\nCorreção concluída!');
}

// Executar correção
fixPrisma(); 
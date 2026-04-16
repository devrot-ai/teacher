#!/usr/bin/env node

/**
 * Startup Health Check Script
 * Checks if all required services are available before starting the main server
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking required services...\n');

// Service URLs
const services = {
  'Backend API': 'http://localhost:5001',
  'ChromaDB': 'http://localhost:8000',
  'Ollama': 'http://localhost:11434'
};

// Check service availability
async function checkService(name, url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      console.log(`✅ ${name}: Available (${url})`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ ${name}: Not available (${url}) - ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`⏰ ${name}: Timeout (${url})`);
      resolve(false);
    });
  });
}

// Check if directories exist
function checkDirectory(name, dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${name}: Directory exists (${dirPath})`);
    return true;
  } else {
    console.log(`❌ ${name}: Directory missing (${dirPath})`);
    return false;
  }
}

// Main check function
async function runHealthCheck() {
  console.log('📋 Service Availability Check:');
  console.log('================================');
  
  const results = [];
  
  // Check HTTP services
  for (const [name, url] of Object.entries(services)) {
    const isAvailable = await checkService(name, url);
    results.push({ name, available: isAvailable });
  }
  
  console.log('\n📁 Directory Check:');
  console.log('=======================');
  
  // Check required directories
  const directories = {
    'Uploads': './uploads',
    'Files Storage': './uploads/files',
    'Node Modules': './node_modules'
  };
  
  for (const [name, dirPath] of Object.entries(directories)) {
    const exists = checkDirectory(name, dirPath);
    results.push({ name, available: exists });
  }
  
  console.log('\n🎯 Summary:');
  console.log('============');
  
  const availableCount = results.filter(r => r.available).length;
  const totalCount = results.length;
  
  console.log(`Services ready: ${availableCount}/${totalCount}`);
  
  if (availableCount === totalCount) {
    console.log('\n🚀 All services are ready! You can start the application.');
    console.log('\nTo start the backend server:');
    console.log('  npm run dev');
    console.log('\nTo start the frontend:');
    console.log('  cd ../frontend && npm run dev');
  } else {
    console.log('\n⚠️  Some services are missing. Here\'s how to fix them:');
    
    const unavailable = results.filter(r => !r.available);
    
    unavailable.forEach(service => {
      switch (service.name) {
        case 'ChromaDB':
          console.log('\n🔧 ChromaDB Setup:');
          console.log('  Option 1: Install with Docker (recommended):');
          console.log('    docker run -d --name chromadb -p 8000:8000 chromadb/chroma');
          console.log('  Option 2: Install with Python:');
          console.log('    pip install chromadb');
          console.log('    chroma run --host localhost --port 8000');
          break;
          
        case 'Ollama':
          console.log('\n🤖 Ollama Setup:');
          console.log('  1. Download and install Ollama from: https://ollama.ai');
          console.log('  2. Start Ollama service:');
          console.log('    ollama serve');
          console.log('  3. Pull required models:');
          console.log('    ollama pull deepseek-r1:1.5b');
          console.log('    ollama pull embeddinggemma:latest');
          break;
          
        case 'Backend API':
          console.log('\n🖥️  Backend Server:');
          console.log('  Start with: npm run dev');
          break;
          
        case 'Uploads':
          console.log('\n📁 Create Uploads Directory:');
          console.log('  mkdir -p uploads/files');
          break;
          
        case 'Files Storage':
          console.log('\n📁 Create Files Storage Directory:');
          console.log('  mkdir -p uploads/files');
          break;
          
        case 'Node Modules':
          console.log('\n📦 Install Dependencies:');
          console.log('  npm install');
          break;
      }
    });
  }
  
  console.log('\n💡 Quick Start Commands:');
  console.log('==========================');
  console.log('# Terminal 1 - Start Services');
  console.log('docker run -d --name chromadb -p 8000:8000 chromadb/chroma');
  console.log('ollama serve');
  console.log('');
  console.log('# Terminal 2 - Install Models');
  console.log('ollama pull deepseek-r1:1.5b');
  console.log('ollama pull embeddinggemma:latest');
  console.log('');
  console.log('# Terminal 3 - Start Backend');
  console.log('npm run dev');
  console.log('');
  console.log('# Terminal 4 - Start Frontend');
  console.log('cd ../frontend && npm run dev');
}

// Run the health check
runHealthCheck().catch(console.error);

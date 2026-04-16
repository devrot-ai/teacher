#!/usr/bin/env node

/**
 * Feature Test Script
 * Tests upload document and chat functionality
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const API_BASE = 'http://localhost:5001';

console.log('🧪 Testing EduBridge Features...\n');

// Test data
const testUserId = 'test-user-' + Date.now();
const testSessionId = 'test-session-' + Date.now();

// Create a test file
function createTestFile() {
  const testContent = `
# Test Document

This is a test document for upload functionality.

## Mathematics
- Addition: 2 + 2 = 4
- Multiplication: 3 × 4 = 12
- Division: 10 ÷ 2 = 5

## Science
- Water formula: H₂O
- Gravity: 9.8 m/s²
- Speed of light: 299,792,458 m/s

## History
- World War II: 1939-1945
- Independence Day: August 15, 1947 (India)
- Moon Landing: July 20, 1969
`;

  const testFilePath = path.join(__dirname, 'test-document.txt');
  fs.writeFileSync(testFilePath, testContent);
  return testFilePath;
}

// Test 1: Health Check
async function testHealth() {
  console.log('🏥 Testing API Health...');
  try {
    const response = await axios.get(`${API_BASE}/`);
    console.log('✅ API Health:', response.status);
    console.log('   Features:', response.data.features.join(', '));
    return true;
  } catch (error) {
    console.log('❌ API Health Failed:', error.message);
    return false;
  }
}

// Test 2: Upload Document
async function testUpload() {
  console.log('\n📤 Testing Document Upload...');
  
  try {
    const testFilePath = createTestFile();
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('userId', testUserId);
    formData.append('sessionId', testSessionId);

    const response = await axios.post(`${API_BASE}/api/upload`, formData, {
      headers: formData.getHeaders(),
      timeout: 30000
    });

    console.log('✅ Upload Success:', response.status);
    console.log('   File ID:', response.data.fileId);
    console.log('   File Name:', response.data.fileName);
    console.log('   Chunks Created:', response.data.chunksCreated);
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    return response.data.fileId;
  } catch (error) {
    console.log('❌ Upload Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test 3: Chat Query
async function testChat(fileId) {
  console.log('\n💬 Testing Chat Query...');
  
  try {
    const queryData = {
      query: 'What is the formula for water?',
      userId: testUserId,
      sessionId: testSessionId,
      mentionedFileIds: fileId ? [fileId] : undefined
    };

    const response = await axios.post(`${API_BASE}/api/query`, queryData, {
      timeout: 60000
    });

    console.log('✅ Chat Success:', response.status);
    console.log('   Answer Length:', response.data.answer?.length || 0, 'characters');
    console.log('   Sources Found:', response.data.sources?.length || 0);
    console.log('   Answer Preview:', response.data.answer?.substring(0, 100) + '...');
    
    return true;
  } catch (error) {
    console.log('❌ Chat Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Streaming Chat
async function testStreamingChat(fileId) {
  console.log('\n🌊 Testing Streaming Chat...');
  
  try {
    const queryData = {
      query: 'Explain the mathematical concepts',
      userId: testUserId,
      sessionId: testSessionId,
      mentionedFileIds: fileId ? [fileId] : undefined
    };

    const response = await axios.post(`${API_BASE}/api/query/stream`, queryData, {
      responseType: 'stream',
      timeout: 60000
    });

    let chunks = [];
    let sources = [];
    
    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr && jsonStr !== '[DONE]') {
            try {
              const data = JSON.parse(jsonStr);
              if (data.type === 'text') chunks.push(data.content);
              if (data.type === 'source') sources.push(data.source);
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    });

    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        console.log('✅ Streaming Success');
        console.log('   Text Chunks:', chunks.length);
        console.log('   Sources Found:', sources.length);
        console.log('   Full Answer:', chunks.join(''));
        resolve(true);
      });

      response.data.on('error', (error) => {
        console.log('❌ Streaming Failed:', error.message);
        reject(error);
      });
    });
  } catch (error) {
    console.log('❌ Streaming Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 5: Get Session Details
async function testSessionDetails() {
  console.log('\n📋 Testing Session Details...');
  
  try {
    const response = await axios.get(
      `${API_BASE}/api/chats/${testSessionId}?userId=${testUserId}`,
      { timeout: 10000 }
    );

    console.log('✅ Session Details Success:', response.status);
    console.log('   Messages:', response.data.session?.messages?.length || 0);
    console.log('   Document Count:', response.data.documentCount || 0);
    console.log('   Collection:', response.data.session?.chromaCollectionName);
    
    return true;
  } catch (error) {
    console.log('❌ Session Details Failed:', error.response?.data || error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log(`🆔 Test Session: User=${testUserId}, Session=${testSessionId}`);
  console.log('=========================================================\n');
  
  const results = {};
  
  // Run all tests
  results.health = await testHealth();
  
  if (results.health) {
    const fileId = await testUpload();
    results.upload = !!fileId;
    
    if (results.upload) {
      results.chat = await testChat(fileId);
      results.streaming = await testStreamingChat(fileId);
      results.sessionDetails = await testSessionDetails();
    } else {
      results.chat = await testChat(null);
      results.streaming = await testStreamingChat(null);
      results.sessionDetails = false;
    }
  } else {
    results.upload = false;
    results.chat = false;
    results.streaming = false;
    results.sessionDetails = false;
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const testNames = {
    health: 'API Health',
    upload: 'Document Upload',
    chat: 'Chat Query',
    streaming: 'Streaming Chat',
    sessionDetails: 'Session Details'
  };
  
  let passedCount = 0;
  for (const [key, name] of Object.entries(testNames)) {
    const status = results[key] ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}`);
    if (results[key]) passedCount++;
  }
  
  console.log(`\n🎯 Overall: ${passedCount}/${Object.keys(results).length} tests passed`);
  
  if (passedCount === Object.keys(results).length) {
    console.log('\n🎉 All tests passed! The upload and chat features are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above for details.');
    console.log('\n💡 Common fixes:');
    console.log('   • Make sure ChromaDB is running on port 8000');
    console.log('   • Make sure Ollama is running on port 11434');
    console.log('   • Check that backend server is running on port 5001');
    console.log('   • Verify required Ollama models are installed');
  }
}

// Run the tests
runTests().catch(console.error);

/**
 * Test Script for API Filtering (Updated for Screen ID Priority)
 * This script tests the updated filtering functionality for test scripts
 */

// Mock API response for testing
const mockApiResponse = {
  data: [
    {
      id: 1,
      name: 'Login Test',
      project_id: 1,
      screen_id: 1,
      screen: { id: 1, name: 'Login Page' },
      tags: [{ name: 'auth' }, { name: 'critical' }]
    },
    {
      id: 2,
      name: 'Product Search Test',
      project_id: 1,
      screen_id: 2,
      screen: { id: 2, name: 'Product Page' },
      tags: [{ name: 'search' }, { name: 'products' }]
    },
    {
      id: 3,
      name: 'Cart Test',
      project_id: 1,
      screen_id: 3,
      screen: { id: 3, name: 'Cart Page' },
      tags: [{ name: 'cart' }, { name: 'critical' }]
    },
    {
      id: 4,
      name: 'API Test',
      project_id: 2,
      screen_id: 4,
      screen: { id: 4, name: 'API Endpoint' },
      tags: [{ name: 'api' }, { name: 'backend' }]
    }
  ]
};

// Test filtering function with new screen_id priority
function testFiltering() {
  console.log('🧪 Testing Updated API Filtering Logic (Screen ID Priority)...\n');

  // Test 1: Filter by screen (highest priority)
  console.log('📋 Test 1: Filter by Screen ID = 1 (Primary Filter)');
  const screenFiltered = mockApiResponse.data.filter(script => script.screen_id == 1);
  console.log(`   Found ${screenFiltered.length} scripts for screen 1`);
  screenFiltered.forEach(script => console.log(`   - ${script.name} (Project: ${script.project_id})`));
  console.log('');

  // Test 2: Filter by project (secondary priority)
  console.log('📋 Test 2: Filter by Project ID = 1 (Secondary Filter)');
  const projectFiltered = mockApiResponse.data.filter(script => script.project_id == 1);
  console.log(`   Found ${projectFiltered.length} scripts for project 1`);
  projectFiltered.forEach(script => console.log(`   - ${script.name} (Screen: ${script.screen.name})`));
  console.log('');

  // Test 3: Filter by screen and project (both filters)
  console.log('📋 Test 3: Filter by Screen ID = 2 AND Project ID = 1');
  const screenAndProjectFiltered = mockApiResponse.data.filter(script => 
    script.screen_id == 2 && script.project_id == 1
  );
  console.log(`   Found ${screenAndProjectFiltered.length} scripts for screen 2, project 1`);
  screenAndProjectFiltered.forEach(script => console.log(`   - ${script.name}`));
  console.log('');

  // Test 4: Filter by tags (frontend filtering)
  console.log('📋 Test 4: Filter by Tag = "critical" (Frontend Filtering)');
  const tagFiltered = mockApiResponse.data.filter(script => 
    script.tags.some(tag => tag.name === 'critical')
  );
  console.log(`   Found ${tagFiltered.length} scripts with "critical" tag`);
  tagFiltered.forEach(script => console.log(`   - ${script.name} (Tags: ${script.tags.map(t => t.name).join(', ')})`));
  console.log('');

  // Test 5: Search by name
  console.log('📋 Test 5: Search by Name containing "Test"');
  const searchFiltered = mockApiResponse.data.filter(script => 
    script.name.toLowerCase().includes('test')
  );
  console.log(`   Found ${searchFiltered.length} scripts with "Test" in name`);
  searchFiltered.forEach(script => console.log(`   - ${script.name}`));
  console.log('');

  // Test 6: Complex filtering (Screen + Tags)
  console.log('📋 Test 6: Complex Filter (Screen 1 + Critical Tag)');
  const complexFiltered = mockApiResponse.data.filter(script => 
    script.screen_id == 1 && script.tags.some(tag => tag.name === 'critical')
  );
  console.log(`   Found ${complexFiltered.length} scripts for screen 1 with critical tag`);
  complexFiltered.forEach(script => console.log(`   - ${script.name} (Project: ${script.project_id})`));
  console.log('');

  console.log('✅ All filtering tests completed!');
}

// Test URL building with new priority
function testUrlBuilding() {
  console.log('🔗 Testing URL Building (Screen ID Priority)...\n');

  const baseUrl = 'http://localhost:8000/api';
  
  // Test 1: No filters
  console.log('📋 Test 1: No filters');
  console.log(`   URL: ${baseUrl}/test-scripts`);
  console.log('');

  // Test 2: Screen filter only (highest priority)
  console.log('📋 Test 2: Screen filter only (Primary)');
  const screenParams = new URLSearchParams();
  screenParams.append('screen_id', '2');
  console.log(`   URL: ${baseUrl}/test-scripts/search?${screenParams.toString()}`);
  console.log('');

  // Test 3: Project filter only (secondary)
  console.log('📋 Test 3: Project filter only (Secondary)');
  const projectParams = new URLSearchParams();
  projectParams.append('project_id', '1');
  console.log(`   URL: ${baseUrl}/test-scripts/search?${projectParams.toString()}`);
  console.log('');

  // Test 4: Screen + Project filters (Screen first)
  console.log('📋 Test 4: Screen + Project filters (Screen Priority)');
  const bothParams = new URLSearchParams();
  bothParams.append('screen_id', '2');
  bothParams.append('project_id', '1');
  console.log(`   URL: ${baseUrl}/test-scripts/search?${bothParams.toString()}`);
  console.log('');

  // Test 5: Search term + Screen
  console.log('📋 Test 5: Search term + Screen filter');
  const searchParams = new URLSearchParams();
  searchParams.append('q', 'login');
  searchParams.append('screen_id', '1');
  console.log(`   URL: ${baseUrl}/test-scripts/search?${searchParams.toString()}`);
  console.log('');

  console.log('✅ All URL building tests completed!');
}

// Test the new filtering logic
function testNewLogic() {
  console.log('🔄 Testing New Filtering Logic...\n');

  // Simulate the new API call logic
  const filters = {
    screen: '2',
    project: '1',
    search: 'test',
    tags: ['critical']
  };

  console.log('📋 Input Filters:');
  console.log(`   Screen ID: ${filters.screen}`);
  console.log(`   Project ID: ${filters.project}`);
  console.log(`   Search: ${filters.search}`);
  console.log(`   Tags: ${filters.tags.join(', ')}`);
  console.log('');

  // Simulate backend filtering (Priority: Screen > Project > Search)
  let filteredScripts = mockApiResponse.data;
  
  // Priority 1: Screen filtering
  if (filters.screen) {
    filteredScripts = filteredScripts.filter(script => script.screen_id == filters.screen);
    console.log(`📱 After Screen Filter (ID: ${filters.screen}): ${filteredScripts.length} scripts`);
  }

  // Priority 2: Project filtering
  if (filters.project) {
    filteredScripts = filteredScripts.filter(script => script.project_id == filters.project);
    console.log(`📁 After Project Filter (ID: ${filters.project}): ${filteredScripts.length} scripts`);
  }

  // Priority 3: Search filtering
  if (filters.search) {
    filteredScripts = filteredScripts.filter(script => 
      script.name.toLowerCase().includes(filters.search.toLowerCase())
    );
    console.log(`🔍 After Search Filter ("${filters.search}"): ${filteredScripts.length} scripts`);
  }

  // Frontend: Tags filtering
  if (filters.tags && filters.tags.length > 0) {
    filteredScripts = filteredScripts.filter(script => 
      filters.tags.some(tag => script.tags?.some(scriptTag => scriptTag.name === tag))
    );
    console.log(`🏷️ After Tags Filter (${filters.tags.join(', ')}): ${filteredScripts.length} scripts`);
  }

  console.log('\n📋 Final Results:');
  filteredScripts.forEach(script => {
    console.log(`   - ${script.name} (Screen: ${script.screen.name}, Project: ${script.project_id})`);
  });

  console.log('\n✅ New filtering logic test completed!');
}

// Run tests
console.log('🚀 Starting Updated API Filtering Tests...\n');
testFiltering();
console.log('\n' + '='.repeat(50) + '\n');
testUrlBuilding();
console.log('\n' + '='.repeat(50) + '\n');
testNewLogic();
console.log('\n🎉 All tests completed successfully!');

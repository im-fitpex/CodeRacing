import requests
import json

def test_recommendation_web():
    """Test recommendation web API"""
    
    url = "http://localhost:8000/recommendation-web"
    
    # Test data
    payload = {
        "installed_app_ids": [1, 2, 4, 6, 8],  # ID установленных приложений
        "max_depth": 2,
        "max_recommendations": 30
    }
    
    print("🔍 Testing Recommendation Web API...")
    print(f"📦 Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"\n✅ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"\n📊 Statistics:")
            print(f"  - Total Nodes: {data['stats']['total_nodes']}")
            print(f"  - Total Edges: {data['stats']['total_edges']}")
            print(f"  - Installed Apps: {data['stats']['installed_apps']}")
            print(f"  - Recommended Apps: {data['stats']['recommended_apps']}")
            print(f"  - Processing Time: {data.get('processing_time_ms', 0):.2f}ms")
            
            print(f"\n🎯 Nodes (first 5):")
            for i, node in enumerate(data['nodes'][:5]):
                installed = "✓ INSTALLED" if node['is_installed'] else "○ recommended"
                print(f"  {i+1}. {node['name']} ({node['category']}) - {installed}")
            
            print(f"\n🔗 Links (first 5):")
            for i, link in enumerate(data['links'][:5]):
                print(f"  {i+1}. {link['source']} → {link['target']} (similarity: {link['similarity']}%)")
            
            # Save to file
            with open('recommendation_web_result.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"\n💾 Full response saved to 'recommendation_web_result.json'")
            
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure ML API is running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    test_recommendation_web()

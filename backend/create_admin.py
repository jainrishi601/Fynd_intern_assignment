import requests

API_URL = "http://localhost:8000"

def create_admin():
    print(f"Attempting to create admin user at {API_URL}...")
    try:
        response = requests.post(f"{API_URL}/auth/setup-admin", json={
            "username": "admin",
            "hashed_password": "password123", # Endpoint handles hashing
            "rating": 0,    # Ignore (schema artifact)
            "content": ""   # Ignore
        })
        
        if response.status_code == 200:
            print("✅ Admin user created successfully!")
            print("Username: admin")
            print("Password: password123")
        elif response.status_code == 400:
            print("⚠️  Admin user already exists.")
        else:
            print(f"❌ Failed to create admin: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure the backend is running on port 8000.")

if __name__ == "__main__":
    create_admin()

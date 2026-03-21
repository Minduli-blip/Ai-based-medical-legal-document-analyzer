import os
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

def main():
    creds_file = "credentials.json"
    if not os.path.exists(creds_file):
        raise FileNotFoundError("credentials.json not found in this folder")

    flow = InstalledAppFlow.from_client_secrets_file(creds_file, SCOPES)

    # opens browser for login,then stores token.json
    creds = flow.run_local_server(port=0)

    with open("token.json", "w", encoding="utf-8") as f:
        f.write(creds.to_json())

    print("✅ token.json created successfully!")

if __name__ == "__main__":
    main()
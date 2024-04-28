# import requests
# import os
# from dotenv import load_dotenv
# from pathlib import Path


# def fetch_quotes(category='happiness'):
#     BASE_DIR = Path(__file__).resolve().parent.parent
#     load_dotenv(BASE_DIR / '.env')

#     MY_API_KEY = os.environ.get('NINJA_KEY')
#     api_url = f'https://api.api-ninjas.com/v1/quotes?category={category}'

#     response = requests.get(api_url, headers={'X-Api-Key': MY_API_KEY})

#     if response.status_code == requests.codes.ok:
#         return response.json()[0]['quote']
#     else:
#         print(f"Error: {response.status_code}, {response.text}")
#         return None


# # Example usage
# quotes_data = fetch_quotes()

# if quotes_data:
#     print(quotes_data)

# """
# API categories 

# age
# alone
# amazing
# anger
# architecture
# art
# attitude
# beauty
# best
# birthday
# business
# car
# change
# communications
# computers
# cool
# courage
# dad
# dating
# death
# design
# dreams
# education
# environmental
# equality
# experience
# failure
# faith
# family
# famous
# fear
# fitness
# food
# forgiveness
# freedom
# friendship
# funny
# future
# god
# good
# government
# graduation
# great
# happiness
# health
# history
# home
# hope
# humor
# imagination
# inspirational
# intelligence
# jealousy
# knowledge
# leadership
# learning
# legal
# life
# love
# marriage
# medical
# men
# mom
# money
# morning
# movies
# success
# """
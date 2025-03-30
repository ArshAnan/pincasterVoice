import json

with open('DPR_Eateries_001.json', 'r') as file:
    data = json.load(file)

for place in data:
    print(place['type_name'])

print(data[0])
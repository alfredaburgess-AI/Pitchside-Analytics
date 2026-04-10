import pandas as pd
import json

df = pd.read_csv('PHOP_Master_Database.csv', encoding='latin-1')
print(df.columns)
print(df[['Player Name', 'POS']])

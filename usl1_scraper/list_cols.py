import pandas as pd
df = pd.read_csv('PHOP_Master_Database.csv', encoding='latin-1')
print(df.columns.tolist())

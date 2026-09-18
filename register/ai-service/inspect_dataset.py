import pandas as pd
import numpy as np

df = pd.read_excel("dataset.xlsx")
print("Columns:", df.columns.tolist())
print("Classification unique:", df['Classification'].unique().tolist())
print("Categories unique:", df['Category'].dropna().unique().tolist())
print("Hiking entries count:", len(df[df['Category'].str.strip().str.lower() == 'hiking']))

#!/usr/bin/env python
# Name: Lotte van den Berg
# Student number: 12427241
"""
This script converts a CSV file to a JSON format.
"""
import pandas as pd

# Any other url can be uses as well
input = 'GR_Leiden.csv'
# Convert to pandas dataframe
df = pd.read_csv(input, sep=';', usecols=['verkiezing', 'partij', 'stemmen'], encoding='latin-1')

# For the purpose of assignment 4: preprocess data you for the assignment
# Otherwise, skip this part
df = df[df['verkiezing'] == 'GR2018']
print(df)
df = df.drop('verkiezing', 1)
print(df)
df = df.groupby(['partij']).sum()
print(df)

# Convert to JSON file
# Fill in any filename you like, default orient is columns
df.to_json('GR_Leiden.json', orient='index')

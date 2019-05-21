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
df = pd.read_csv(input, sep=';', usecols=['verkiezing', 'partij', 'w', 'stemmen'], encoding='latin-1')

# For the purpose of assignment 6: preprocess data you for the assignment
# Otherwise, skip this part
df = df[df['verkiezing'] == 'GR2018']
df = df.drop('verkiezing', 1)
dfWijken = df.groupby(['partij', 'w']).sum()
dfStemmen = df.drop('w', 1)
dfStemmen = dfStemmen.groupby(['partij']).sum()


# Convert to JSON file
# Fill in any filename you like, default orient is columns
dfWijken.to_json('GR_LeidenWijken.json', orient="table")
dfStemmen.to_json('GR_LeidenStemmen.json', orient="index")

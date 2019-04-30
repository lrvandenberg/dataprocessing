#!/usr/bin/env python
# Name: Lotte van den Berg
# Student number: 12427241
"""
This script converts a CSV file to a JSON format.
"""
import pandas as pd

# Any other url can be uses as well
url = 'https://raw.githubusercontent.com/fivethirtyeight/data/master/births/US_births_2000-2014_SSA.csv'

# Convert to pandas dataframe
df = pd.read_csv(url)

# For the purpose of assignment 3: preprocess data you for the assignment
# Otherwise, skip this part
df = df[['year', 'births']]
df = df.groupby(['year']).mean()

# Convert to JSON file
# Fill in any filename you like, default orient is columns
df.to_json('US_births_2000-2014_SSA.json', orient='index')

#!/usr/bin/env python
# Name: Lotte van den Berg
# Student number: 12427241
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""
import pandas as pd
url = 'https://raw.githubusercontent.com/pydata/pydata-book/master/ch09/stock_px.csv'
df = pd.read_csv(url,index_col=0,parse_dates=[0])

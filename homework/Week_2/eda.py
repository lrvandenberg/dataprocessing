# !/usr/bin/env python
# Name: Lotte van den Berg
# Student number: 12427241
"""
This script [...].
"""
import pandas as pd
import numpy as np
import csv

# Read a comma-separated values (csv) file into DataFrame.
usecols = ['Country', 'Region', 'Pop. Density (per sq. mi.)', 'Infant mortality (per 1000 births)', 'GDP ($ per capita) dollars']
data = pd.read_csv('input.csv', usecols=usecols)

# preprocessing
# moeten alle dingen met missing values worden verwijderd?
# hoe spot je outliers?

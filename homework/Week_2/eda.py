# !/usr/bin/env python
# Name: Lotte van den Berg
# Student number: 12427241
"""
This script loads in a dataset from a csv file, preproccesses it
and visually analyzes it.
It returns a JSON file with the cleaned data.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt


def read_csv(input_file):
    """
    Reads csv file into a pandas DataFrame.
    Only uses the columns:
    - Country
    - Region
    - Pop. Density (per sg. mi.)
    - Infant mortality (per 1000 births)
    - GDP ($ per capita) dollars
    """
    usecols = ['Country', 'Region', 'Pop. Density (per sq. mi.)', 'Infant mortality (per 1000 births)', 'GDP ($ per capita) dollars']
    data = pd.read_csv(input_file, usecols=usecols)

    return data

def clean(data):
    """
    Preprocesses the dataset.
    Deletes rows with to many missing values.
    Replaces other missing values or outliers with the mean of the column.
    """
    # Missing values are indicated with NaN or the string 'unknown'
    # Convert missing values indicated with string 'unknown' to NaN
    data = data.replace(to_replace='unknown', value=np.nan)

    # Delete any rows with more than 1 missing value
    data = data.dropna(thresh=4)

    # Convert final three columns to floats for calculations
    data['Pop. Density (per sq. mi.)'] = data['Pop. Density (per sq. mi.)'].str.replace(',', '.').astype(float)
    data['Infant mortality (per 1000 births)'] = data['Infant mortality (per 1000 births)'].str.replace(',', '.').astype(float)
    data['GDP ($ per capita) dollars'] = data['GDP ($ per capita) dollars'].str.rstrip(' dollars').astype(float)

    # Convert outliers in the dataframe to NaN
    # The result of the GDP histogram showed that a GDP was too high
    data['GDP ($ per capita) dollars'] = data['GDP ($ per capita) dollars'].replace(to_replace=400000, value=np.nan)

    # The result of a minimum value test showed that a Pop Density of zero occured somewhere
    data['Pop. Density (per sq. mi.)'] = data['Pop. Density (per sq. mi.)'].replace(to_replace=0, value=np.nan)

    # Fill missing values (as indicated by NaN) with the mean of each column
    data = data.fillna(data.mean())

    return data

def central_tendancy(data):
    """
    Prints the mean, median, mode and standard deviation.
    Plots a histogram.
    Analyzes the histogram.
    """
    # Central Tendancy
    print(f"mean = {data['GDP ($ per capita) dollars'].mean()}")
    print(f"median = {data['GDP ($ per capita) dollars'].median()}")
    print(f"mode = {data['GDP ($ per capita) dollars'].mode()}")
    print(f"std = {data['GDP ($ per capita) dollars'].std()}")

    # Histogram of GDP
    # Showed Suriname as a 'wrong' outlier
    # Analysis: Data is not normally distributed. Most concentrated between 0 and 10000 dollars.
    hist = data['GDP ($ per capita) dollars'].plot(kind='hist')
    hist.set_xlabel('GDP ($ per capita) dollars')
    hist.set_title('Histogram of GDP')
    plt.show(block=False)
    plt.pause(4)
    plt.close()

def five_number_summary(data):
    """
    Prints the median, minimum, maximum, first quartile, third quartile.
    Plots a boxplot.
    Analyzes the boxplot
    """
    # Five number summary
    print(f"median = {data['Infant mortality (per 1000 births)'].median()}")
    print(data['Infant mortality (per 1000 births)'].describe()[['min','25%','75%','max']])

    # Boxplot of Infant Mortality
    box = data['Infant mortality (per 1000 births)'].plot(kind='box')
    box.set_title('Boxplot Infant Mortality')
    plt.show()

    # Analysis
    # Outliers: looking up the outliers (below) shows that they are 'poor' countries and that 4 of them are located in the same region
    print(data.loc[data['Infant mortality (per 1000 births)'] > 125])

if __name__ == "__main__":
    data = read_csv('input.csv')
    data = clean(data)
    central_tendancy(data)
    five_number_summary(data)

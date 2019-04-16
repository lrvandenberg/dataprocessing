# !/usr/bin/env python
# Name: Lotte van den Berg
# Student number: 12427241
"""
This script loads in a dataset from a csv file, preproccesses it and visually analyzes it.
To view the plots longer/shorter, please add time in the plt.pause() function.
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
    Preprocesses the dataset:
    - Deletes rows with to many missing values.
    - Replaces missing values or 'wrong' outliers with the mean of the column.
    - Formats the data for correct usage.
    """
    # Missing values are indicated in the dataset with NaN or the string 'unknown'
    # For consistency and calculation, convert all missing values to NaN
    data = data.replace(to_replace='unknown', value=np.nan)

    # Delete any rows with more than 1 missing value
    data = data.dropna(thresh=4)

    # Clean up each column
    # Convert final three columns to floats for calculations
    data['Country'] = data.iloc[: ,0].str.rstrip()
    data['Region'] = data.iloc[: ,1].str.rstrip()
    data['Pop. Density (per sq. mi.)'] = data.iloc[: ,2].str.replace(',', '.').astype(float)
    data['Infant mortality (per 1000 births)'] = data.iloc[: ,3].str.replace(',', '.').astype(float)
    data['GDP ($ per capita) dollars'] = data.iloc[: ,4].str.rstrip(' dollars').astype(float)

    # Convert outliers in the dataframe to NaN
    # The result of the GDP histogram showed that a GDP was too high
    data['GDP ($ per capita) dollars'] = data.iloc[: ,4].replace(to_replace=400000, value=np.nan)

    # The result of a minimum value test showed that a Pop Density of zero occured somewhere
    data['Pop. Density (per sq. mi.)'] = data.iloc[: ,2].replace(to_replace=0, value=np.nan)

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
    print("Central Tendency of GDP ($ per capita) dollars:")
    print(f"mean = {data.mean()}")
    print(f"median = {data.median()}")
    print(f"mode = {data.mode()[0]}")
    print(f"std = {data.std()}\n")

    # Histogram of GDP
    hist = data.plot(kind='hist')
    hist.set_xlabel('GDP ($ per capita) dollars')
    hist.set_title('Histogram of GDP')

    # show histogram for 2 seconds, prevent window blocking
    plt.show(block=False)
    plt.pause(1)
    plt.close()

    # EDA Analysis Histogram:
    # Data is not normally distributed.
    # Data is most concentrated between 0 and 10000 dollars, meaning most countries have a 'low' GDP
    # Histogram showed Suriname as a 'wrong' outlier; the number was too high. Cleaned thereafter in dataset.
    # On the right is an outlier that does not need correction,
    # looking up the outlier showed that the country is Luxembourg, which is indeed a 'rich' country.
    # Code used for looking up outlier: data.loc[data['GDP ($ per capita) dollars'] > 40000]


def five_number_summary(data):
    """
    Prints the median, minimum, maximum, first quartile, third quartile.
    Plots a boxplot.
    Analyzes the boxplot
    """
    # Five number summary
    print("Five number summary of Infant Mortality:")
    print(f"median = {data.median()}")
    print(data.describe()[['min','25%','75%','max']])

    # Boxplot of Infant Mortality
    box = data.plot(kind='box')
    box.set_title('Boxplot Infant Mortality')

    # Show boxplot for 1 second, prevent window blocking
    plt.show(block=False)
    plt.pause(1)
    plt.close()

    # EDA Analysis Boxplot:
    # The boxplot shows a couple of outliers.
    # looking up the outliers showed that they are 'poor' countries and
    # that 4 of them are located in the same region. Therefore, the outliers need not to be cleaned.
    # Code used for looking up outlier: data.loc[data['Infant mortality (per 1000 births)'] > 125]


if __name__ == "__main__":
    # Load in csv file
    data = read_csv('input.csv')

    # Clean data
    data = clean(data)

    # Calculate and visualize Central Tendancy and Five Number Summary
    central_tendancy(data['GDP ($ per capita) dollars'])
    five_number_summary(data['Infant mortality (per 1000 births)'])

    # Save cleaned data to eda.json
    data = data.set_index('Country')
    data.to_json(r'C:\Users\lr_va\Downloads\dataprocessing\homework\Week_2\eda.json', orient='index')

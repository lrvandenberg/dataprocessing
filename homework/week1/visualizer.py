#!/usr/bin/env python
# Name: Lotte van den Berg
# Student number: 12427241
"""
This script visualizes data obtained from a .csv file in a line chart.
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionaries for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}
data_dict_avg = {}

def read_csv(input_file):
    """
    Reads ratings per year from movies.csv and saves them
    """
    reader = csv.DictReader(input_file)
    for row in reader:
        data_dict[row['Year']].append(float(row['Rating']))
    input_file.close()
    return data_dict

def count_average(data_dict):
    """
    Calculate the average rating per year.
    """
    for key in data_dict:
        avg = round(sum(data_dict[key])/len(data_dict[key]), 1)
        data_dict_avg[key] = avg
    return data_dict_avg

def plot_line(data_dict_avg):
    """
    Creates a line chart with the average movie rating per year.
    """
    plt.ylabel('IMDB rating')
    plt.xlabel('year')
    plt.title('Average top 50 IMDB movie rating from 2008-2017')

    year = list(data_dict_avg.keys())
    values = list(data_dict_avg.values())
    plt.plot(year, values)
    plt.ylim((8.0,9.5))

    plt.show()

if __name__ == "__main__":
    # open csv file and read it
    with open(INPUT_CSV, 'r') as input_file:
        read_csv(input_file)

    # calculate average rating per year
    count_average(data_dict)

    # plot line chart
    plot_line(data_dict_avg)

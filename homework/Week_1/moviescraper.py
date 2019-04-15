#!/usr/bin/env python
# Name: Lotte van den Berg
# Student number: 12427241
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup
import re

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title (string)
    - Rating (float)
    - Year of release (integer)
    - Actors/actresses (string, comma separated if more than one)
    - Runtime (integer)
    """
    movies = []
    containers = dom.find_all('div', class_ = 'lister-item-content')

    for container in containers:
        title = container.a.text

        rating = float(container.strong.text)

        year = container.find('span', class_ = 'lister-item-year text-muted unbold').text
        year = re.findall("\((.*?)\)", year)
        if len(year[0]) is not 4:
            year = int(year[1])
        else:
            year = int(year[0])

        actors = []
        stars = container.find_all(href=re.compile("adv_li_st_"))
        for star in stars:
            actors.append(star.text)
        actors = ", ".join(actors)

        runtime = container.find('span', class_ = 'runtime').text
        runtime = int(runtime.split()[0])

        movies.append([title, rating, year, actors, runtime])

    return movies


def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])
    for movie in movies:
        writer.writerow(movie)

    outfile.close()


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.dates import DateFormatter, WeekdayLocator
from scipy.ndimage.filters import gaussian_filter1d
import seaborn as sns
import pandas as pd
import dataset
import os
import datetime
import wes

wes.set_palette('Zissou1')

DB = dataset.connect(os.environ['DATABASE_URL'].replace('postgres://', 'postgresql://'))

table = DB['data']
sall = 'SELECT * FROM data'
date_format = '%Y-%m-%d'


def get_buckets(lo: datetime.date, hi: datetime.date):
    d_array = []
    delta_seconds = ((hi - lo) * 24 * 60 * 60).days
    tdelta = datetime.timedelta(seconds=delta_seconds) / 9
    for i in range(9):
        hid = lo + (tdelta * (i + 1)) - datetime.timedelta(hours=24)
        lod = lo + (tdelta * i)
        d_array.append((lod, hid))
    return np.array(d_array)


def get_dt(s):
    return datetime.datetime.strptime(s, date_format).date()


if __name__ == '__main__':
    dfl = list(DB.query(sall))
    DF = pd.DataFrame(dfl)
    hihi = np.max(DF['hi'].apply(get_dt))
    lolo = np.min(DF['lo'].apply(get_dt))
    big_datelist = pd.date_range(start=lolo, end=hihi)[:-1]
    bigdf = pd.DataFrame(index=big_datelist, columns=DF['email'])

    for row in DF.to_dict(orient='records'):
        bins = get_buckets(get_dt(row['lo']), get_dt(row['hi']))
        datedf = []
        persondatelist = []
        for i, bin in enumerate(bins):
            datelist = list(pd.date_range(bin[0], bin[1]).values)
            persondatelist += datelist
            datedf += [row[f'b{i+1}']/len(datelist) for _ in datelist]
        if sum(datedf) == 0:
            continue
        datedf = list(map(lambda x: (x/sum(datedf)) * 100, datedf))
        datedf = pd.DataFrame(datedf, index=persondatelist, columns=[row['email']])
        bigdf.update(datedf)

    finaldist = bigdf.mean(axis=1)
    mpl_date = DateFormatter("%Y-%m-%d")
    smoothbrain = gaussian_filter1d(finaldist, sigma=2.5)
    smoothbrain = pd.Series(index=finaldist.index, data=smoothbrain)
    fig, ax = plt.subplots(figsize=(16, 9))
    ax.bar(finaldist.index, finaldist, color='C0')
    ax.plot(smoothbrain.index, smoothbrain, color='C4')
    ax.xaxis.set_major_formatter(mpl_date)
    ax.xaxis.set_major_locator(WeekdayLocator(interval=2))
    plt.xticks(rotation=45, ha='right')
    plt.ylabel('Average Number of Guesses per Day', size='x-large')
    plt.xlabel('Date', size='x-large')
    plt.savefig('finaldist.png', dpi=255)

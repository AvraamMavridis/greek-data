// Dirty script to scrap for news titles in greek media

const Xray = require('x-ray');
const x = Xray();
const Promise = require('bluebird');
const _ = require('lodash');
const savedData = require('../data/news_articles');
const fs = require('fs');

console.log('Number of articles: ', savedData.length)

const mapToCaregory = category => {
  return article => ({
    ...article,
    category
  });
};

const mapToPolitics = mapToCaregory(['politics']);
const mapToEconomy = mapToCaregory(['economy']);
const mapToWorld = mapToCaregory(['world']);
const mapToArts = mapToCaregory(['arts']);
const mapToSports = mapToCaregory(['sports']);

const politics = [];
const economy = [];
const sports = [];
const worlds = [];
const arts = [];

// NEWS24
politics.push(
  Promise.promisify(
    x('http://www.news247.gr/politiki/', '.with-sidebar article', [
      {
        title: 'a@title'
      }
    ])
  )
);

economy.push(Promise.promisify(
  x('http://www.news247.gr/oikonomia/', '.with-sidebar article', [
    {
      title: 'a@title'
    }
  ])
));

worlds.push(Promise.promisify(
  x('http://www.news247.gr/kosmos/', '.with-sidebar article', [
    {
      title: 'a@title'
    }
  ])
));

// INGR
politics.push(
  Promise.promisify(
    x('http://www.in.gr/politics/', '.article-dd', [
      {
        title: ''
      }
    ])
  )
);

economy.push(Promise.promisify(
  x('http://www.in.gr/economy/', '.article-dd', [
    {
      title: ''
    }
  ])
));

worlds.push(Promise.promisify(
  x('http://www.in.gr/world/', '.article-dd', [
    {
      title: ''
    }
  ])
));

arts.push(Promise.promisify(
  x('http://www.in.gr/culture/', '.article-dd', [
    {
      title: ''
    }
  ])
));

// Newsit
politics.push(
  Promise.promisify(
    x('https://www.newsit.gr/category/politikh/', '.title_story', [
      {
        title: 'a@title'
      }
    ])
  )
);

economy.push(Promise.promisify(
  x('https://www.newsit.gr/category/oikonomia/', '.title_story', [
    {
      title: 'a@title'
    }
  ])
));

sports.push(Promise.promisify(
  x('https://www.newsit.gr/category/athlitika/', '.title_story', [
    {
      title: 'a@title'
    }
  ])
));

// Newsbomb
politics.push(
  Promise.promisify(
    x('http://www.newsbomb.gr/politikh', '.w-main-full .story-title', [
      {
        title: ''
      }
    ])
  )
);

economy.push(Promise.promisify(
  x('http://www.newsbomb.gr/oikonomia', '.w-main-full .story-title', [
    {
      title: ''
    }
  ])
));

worlds.push(Promise.promisify(
  x('http://www.newsbomb.gr/kosmos', '.w-main-full .story-title', [
    {
      title: ''
    }
  ])
));

sports.push(Promise.promisify(
  x('http://www.newsbomb.gr/sports', '.w-main-full .story-title', [
    {
      title: ''
    }
  ])
));

// To bhma
politics.push(
  Promise.promisify(
    x('http://www.tovima.gr/politics/', '.page_middle .tag_item_title h3', [
      {
        title: ''
      }
    ])
  )
);

economy.push(Promise.promisify(
  x('http://www.tovima.gr/finance/', '.page_middle .tag_item_title h3', [
    {
      title: ''
    }
  ])
));

worlds.push(Promise.promisify(
  x('http://www.tovima.gr/world/', '.page_middle .tag_item_title h3', [
    {
      title: ''
    }
  ])
));

sports.push(Promise.promisify(
  x('http://www.tovima.gr/sports/', '.page_middle .tag_item_title h3', [
    {
      title: ''
    }
  ])
));

arts.push(Promise.promisify(
  x('http://www.tovima.gr/culture/', '.page_middle .tag_item_title h3', [
    {
      title: ''
    }
  ])
));

sports.push(Promise.promisify(
  x('http://www.sdna.gr/', '.home-secondary .views-field-title', [
    {
      title: ''
    }
  ])
));

sports.push(Promise.promisify(
  x('http://www.gazzetta.gr/football', '#block-system-main .views-field-title', [
    {
      title: ''
    }
  ])
));

sports.push(Promise.promisify(
  x('http://www.gazzetta.gr/basketball', '#block-system-main .views-field-title', [
    {
      title: ''
    }
  ])
));

sports.push(Promise.promisify(
  x('http://www.gazzetta.gr/volleyball', '#block-system-main .views-field-title', [
    {
      title: ''
    }
  ])
));

sports.push(Promise.promisify(
  x('http://www.gazzetta.gr/other-sports', '#block-system-main .views-field-title', [
    {
      title: ''
    }
  ])
));

const parse = parser => {
  return data => {
    return _.flatMap(data)
      .map(obj => {
        return {
          title: _.trim(obj.title)
        };
      })
      .map(parser);
  };
};

let politicsProm = politics.map(p => p());
politicsProm = Promise.all(politicsProm).then(parse(mapToPolitics))

let sportsProm = sports.map(p => p());
sportsProm = Promise.all(sportsProm).then(parse(mapToSports))

let worldsProm = worlds.map(p => p());
worldsProm = Promise.all(worldsProm).then(parse(mapToWorld))

let economyProm = economy.map(p => p());
economyProm = Promise.all(economyProm).then(parse(mapToEconomy))

let artsProm = arts.map(p => p());
artsProm = Promise.all(artsProm).then(parse(mapToArts))


Promise.all([politicsProm, sportsProm, worldsProm, economyProm, artsProm])
  .then(_.flatMap)
  .then(data => {
    let newData = savedData.concat(data);
    newData = _.uniqBy(newData, 'title');
    fs.writeFileSync('./data/news_articles.json', JSON.stringify(newData));
    console.log('Number of articles: ', newData.length)
  });

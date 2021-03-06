import firestore from '@react-native-firebase/firestore';
import {NEWSAPI} from '@env';

export default getHeadline = async () => {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow',
    };

    var url =
      'https://newsapi.org/v2/top-headlines?' +
      'country=us&' +
      'category=sports&' +
      'apiKey=' +
      NEWSAPI;
    await fetch(url, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const res = JSON.parse(result);
        const article = res.articles.find((item) => item.urlToImage !== null);
        const image = article.urlToImage;

        const headline = article.title;
        const url = article.url;
        firestore().collection('Topics').add({
            Date: firestore.FieldValue.serverTimestamp(),
            PhotoURL: image,
            Title: headline,
            URL: url,
            Type: 'Sports'
        })
        // console.log(res);
      })
      .catch((error) => console.log('error', error));

    var url =
      'https://newsapi.org/v2/top-headlines?' +
      'country=us&' +
      'category=entertainment&' +
      'apiKey=' +
      NEWSAPI;
    await fetch(url, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const res = JSON.parse(result);
        const article = res.articles.find((item) => item.urlToImage !== null);
        const image = article.urlToImage;
        const headline = article.title;
        const url = article.url;
        firestore().collection('Topics').add({
            Date: firestore.FieldValue.serverTimestamp(),
            PhotoURL: image,
            Title: headline,
            URL: url,
            Type: 'Entertainment'
        })
        // console.log(res);
      })
      .catch((error) => console.log('error', error));

    var url =
      'https://newsapi.org/v2/top-headlines?' +
      'country=us&' +
      'category=business&' +
      'apiKey=' +
      NEWSAPI;
    await fetch(url, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const res = JSON.parse(result);
        const article = res.articles.find((item) => item.urlToImage !== null);
        const image = article.urlToImage;
        const headline = article.title;
        const url = article.url;
        firestore().collection('Topics').add({
            Date: firestore.FieldValue.serverTimestamp(),
            PhotoURL: image,
            Title: headline,
            URL: url,
            Type: 'Business'
        })
        // console.log(res);
      })
      .catch((error) => console.log('error', error));

    var url =
      'https://newsapi.org/v2/top-headlines?' +
      'country=us&' +
      'category=science&' +
      'apiKey=' +
      NEWSAPI;
    await fetch(url, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const res = JSON.parse(result);
        const article = res.articles.find((item) => item.urlToImage !== null);
        const image = article.urlToImage;
        const headline = article.title;
        const url = article.url;
        firestore().collection('Topics').add({
            Date: firestore.FieldValue.serverTimestamp(),
            PhotoURL: image,
            Title: headline,
            URL: url,
            Type: 'Science'
        })
        // console.log(res);
      })
      .catch((error) => console.log('error', error));
  };
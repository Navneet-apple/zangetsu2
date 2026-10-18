// Internet Archive animation and cartoons with public-domain or Creative Commons license metadata.
// Original Zangetsu-native provider. Verify each item's rights and terms before use.
var IA_API = 'https://archive.org/advancedsearch.php';
var IA_META = 'https://archive.org/metadata/';
var IA_ITEM = 'https://archive.org/details/';
var IA_DOWNLOAD = 'https://archive.org/download/';
var SOURCE_ID = 'ia-licensed-animation';
var LICENSE_QUERY = '(licenseurl:*publicdomain* OR licenseurl:*creativecommons.org*)';

function getInfo() {
  return {
    name: 'Internet Archive — Licensed Animation',
    lang: 'en',
    baseUrl: 'https://archive.org/details/animationandcartoons',
    type: 'anime',
    version: '0.1.0'
  };
}

function _getJson(url) {
  return fetch(url, {
    headers: { 'User-Agent': 'Zangetsu2/0.1 (licensed animation catalog)' }
  }).then(function (r) {
    if (!r || (r.status && r.status >= 400)) throw new Error('Internet Archive request failed');
    return JSON.parse(r.body || '{}');
  });
}

function _clean(value) {
  if (Array.isArray(value)) value = value[0];
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

function _licensed(value) {
  var license = String(value || '').toLowerCase();
  return license.indexOf('publicdomain') !== -1 ||
    license.indexOf('creativecommons.org') !== -1;
}

function _search(query, page) {
  var q = 'collection:animationandcartoons AND mediatype:movies AND ' + LICENSE_QUERY;
  if (query) {
    var safe = String(query).replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
    if (safe) q += ' AND title:(' + safe + ')';
  }
  var url = IA_API + '?q=' + encodeURIComponent(q) +
    '&fl[]=identifier&fl[]=title&fl[]=description&fl[]=year&fl[]=licenseurl' +
    '&rows=24&page=' + Math.max(1, Number(page) || 1) + '&output=json';
  return _getJson(url).then(function (json) {
    var docs = json && json.response && json.response.docs || [];
    return docs.filter(function (doc) { return _licensed(doc.licenseurl); })
      .map(function (doc) {
        var id = String(doc.identifier || '');
        var title = _clean(doc.title) || id;
        return {
          id: id,
          title: title,
          englishTitle: title,
          type: 'anime',
          sourceId: SOURCE_ID,
          url: IA_ITEM + encodeURIComponent(id),
          cover: 'https://archive.org/services/img/' + encodeURIComponent(id),
          description: _clean(doc.description),
          year: doc.year || null
        };
      });
  });
}

function search(query, page, opts) {
  return _search(query, page);
}

function getHome(opts) {
  return _search('', 1).then(function (items) {
    return items.length ? [{ title: 'Licensed Animation & Cartoons', items: items }] : [];
  });
}

function getDetail(url, opts) {
  var id = String(url || '').replace(/[?#].*$/, '').split('/').pop();
  return _getJson(IA_META + encodeURIComponent(id)).then(function (json) {
    var metadata = json && json.metadata || {};
    var license = _clean(metadata.licenseurl);
    if (!_licensed(license)) throw new Error('This item has no recognized public-domain or Creative Commons license metadata');
    var title = _clean(metadata.title) || id;
    var description = _clean(metadata.description);
    return {
      id: id,
      title: title,
      englishTitle: title,
      type: 'anime',
      sourceId: SOURCE_ID,
      url: IA_ITEM + encodeURIComponent(id),
      cover: 'https://archive.org/services/img/' + encodeURIComponent(id),
      description: description,
      episodes: [{ id: id, title: 'Play video', url: id }]
    };
  });
}

function getEpisodes(url, opts) {
  return getDetail(url, opts).then(function (detail) { return detail.episodes || []; });
}

function getVideoSources(episodeUrl) {
  var id = String(episodeUrl || '').replace(/[?#].*$/, '').split('/').pop();
  return _getJson(IA_META + encodeURIComponent(id)).then(function (json) {
    var metadata = json && json.metadata || {};
    if (!_licensed(metadata.licenseurl)) {
      throw new Error('Playback blocked: no recognized public-domain or Creative Commons license metadata');
    }
    var files = json && json.files || [];
    var candidates = files.filter(function (file) {
      return file && file.name && /\.(mp4|webm|ogv)$/i.test(file.name) &&
        !/thumb|thumbnail|sample|preview|_itemimage/i.test(file.name) &&
        (!file.source || file.source === 'original' || file.source === 'derivative');
    }).sort(function (a, b) {
      return (Number(b.height) || 0) - (Number(a.height) || 0);
    });
    if (!candidates.length) throw new Error('No compatible video file found for this item');
    return candidates.slice(0, 5).map(function (file) {
      return {
        url: IA_DOWNLOAD + encodeURIComponent(id) + '/' +
          file.name.split('/').map(encodeURIComponent).join('/'),
        quality: file.height ? String(file.height) + 'p' : file.format || 'Video',
        container: String(file.name.split('.').pop() || '').toLowerCase(),
        kind: 'sub'
      };
    });
  });
}

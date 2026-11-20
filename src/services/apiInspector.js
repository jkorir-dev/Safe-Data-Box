function inferFieldType(key, sampleValue) {
  const lowerKey = key.toLowerCase();

  if (lowerKey.includes('phone') || lowerKey.includes('mobile') || lowerKey.includes('tel')) {
    return 'kenyan_phone';
  }
  if (lowerKey.includes('mpesa') || lowerKey.includes('receipt') || lowerKey.includes('tx')) {
    return 'mpesa_code';
  }
  if (lowerKey.includes('kra') || lowerKey.includes('pin')) {
    return 'kra_pin';
  }
  if (lowerKey.includes('county') || lowerKey.includes('city') || lowerKey.includes('region')) {
    return 'kenyan_county';
  }
  if (lowerKey.includes('amount') || lowerKey.includes('price') || lowerKey.includes('balance')) {
    return 'kes_amount';
  }
  if (lowerKey.includes('email')) {
    return 'email';
  }
  if (lowerKey === 'id' || lowerKey.endsWith('_id') || lowerKey.endsWith('id')) {
    return 'relational_id';
  }
  if (lowerKey.includes('name') || lowerKey.includes('user')) {
    return 'kenyan_name';
  }
  if (typeof sampleValue === 'boolean') {
    return 'boolean';
  }
  if (typeof sampleValue === 'number') {
    return 'kes_amount';
  }
  if (typeof sampleValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(sampleValue)) {
    return 'iso_date';
  }

  return 'uuid';
}

export async function cloneSchemaFromUrl(url) {
  if (!url || !url.startsWith('http')) {
    throw new Error('Please enter a valid HTTP or HTTPS API endpoint URL.');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}.`);
  }

  const payload = await response.json();

  let sampleObj = null;
  if (Array.isArray(payload) && payload.length > 0 && typeof payload[0] === 'object') {
    sampleObj = payload[0];
  } else if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.data) && payload.data.length > 0) {
      sampleObj = payload.data[0];
    } else if (Array.isArray(payload.results) && payload.results.length > 0) {
      sampleObj = payload.results[0];
    } else {
      sampleObj = payload;
    }
  }

  if (!sampleObj || typeof sampleObj !== 'object') {
    throw new Error('Could not find a valid JSON object structure in that API response.');
  }

  const fields = Object.entries(sampleObj)
    .filter(([, val]) => val === null || typeof val !== 'object')
    .map(([key, val]) => ({
      key,
      type: inferFieldType(key, val),
    }));

  if (fields.length === 0) {
    throw new Error('No primitive JSON fields found to import.');
  }

  return fields;
}

export const SAMPLE_API_PRESETS = [
  {
    label: 'JSONPlaceholder Users',
    url: 'https://typicode.com',
  },
  {
    label: 'JSONPlaceholder Posts',
    url: 'https://typicode.com',
  },
  {
    label: 'DummyJSON Products',
    url: 'https://dummyjson.com',
  },
];
